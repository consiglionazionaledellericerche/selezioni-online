import { sortCallTypes } from '../../common/helpers/call-types';
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../config.service';
import { ApiMessageService, MessageType } from '../api-message.service';
import { CallService } from './call.service';
import { Call } from './call.model';

export const GROUP_CONCORSI = 'GROUP_CONCORSI';

export interface CallManagementCache {
  jsonlistCallType: any[];
  jsonlistAffixApplication: any[];
  jsonlistApplicationFieldsNotRequired: any[];
  /** Campi del bando (segnaposto nelle note delle comunicazioni). */
  jsonlistCallFields?: any[];
  jsonlistApplicationAspects: any[];
  jsonlistApplicationAttachments: any[];
  jsonlistApplicationCurriculums: any[];
  jsonlistApplicationSchedeAnonime: any[];
  jsonlistApplicationProdotti: any[];
  jsonlistCallAttachments: any[];
  commissionVideoGender: boolean;
}

export interface CommissionResult {
  items: any[];
  group: string;
  videoGender: boolean;
}

export type AclRole = 'Consumer' | 'Editor' | 'Collaborator' | 'Coordinator' | 'Contributor' | 'FullControl' | 'Read' | 'Write';

/**
 * Prefisso dei controlli di form che rappresentano un aspect da aggiungere o togliere:
 * 'aspect:P:jconon_call:aspect_macro_call' = true/false.
 */
export const ASPECT_CONTROL_PREFIX = 'aspect:';

/**
 * Controlli di form che servono solo all'interfaccia e non vanno inviati al backend.
 */
const UI_ONLY_CONTROLS = ['english_call_toggle'];

/**
 * Client delle API di gestione del bando (/openapi/v1/call/...) di cool-jconon.
 */
@Injectable({ providedIn: 'root' })
export class ManageCallService {

  public static URL = '/v1/call';
  private cache$: Observable<CallManagementCache>;

  constructor(
    private httpClient: HttpClient,
    private configService: ConfigService,
    private apiMessageService: ApiMessageService,
    private translateService: TranslateService,
    private callService: CallService
  ) {}

  /* Permessi lato client (il backend ripete gli stessi controlli) */

  static isAdmin(user: any): boolean {
    return !!(user && user.capabilities && user.capabilities.isAdmin);
  }

  static isMemberOf(user: any, groupName: string): boolean {
    if (!user || !groupName) {
      return false;
    }
    const name = groupName.startsWith('GROUP_') ? groupName : 'GROUP_' + groupName;
    return (user.groups || []).some(group => group.itemName === name);
  }

  static isConcorsi(user: any): boolean {
    return ManageCallService.isAdmin(user) || ManageCallService.isMemberOf(user, GROUP_CONCORSI);
  }

  static isManager(user: any, call: Call): boolean {
    return ManageCallService.isConcorsi(user) || (call && ManageCallService.isMemberOf(user, call.rdp));
  }

  static isMacroCall(call: Call): boolean {
    return !!(call && call.secondaryObjectTypeIds &&
      call.secondaryObjectTypeIds.indexOf('P:jconon_call:aspect_macro_call') !== -1);
  }

  /* Elenchi per il form del bando */

  /** Sedi abilitate per il gestore nella tipologia di bando (restricted = false: tutte). */
  managersSedi(callType: string): Observable<{ restricted: boolean, sedi: any[] }> {
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.get<{ restricted: boolean, sedi: any[] }>(apiBase + '/v1/call/managers-sedi',
        { params: { callType } }))
    );
  }

  callManagementCache(): Observable<CallManagementCache> {
    if (!this.cache$) {
      this.cache$ = this.configService.getApiBase().pipe(
        switchMap(apiBase => this.httpClient.get<CallManagementCache>(apiBase + '/v1/cache/call-management')),
        map(cache => {
          // tipologie di bando nell'ordine del legacy
          if (cache && cache.jsonlistCallType) {
            cache.jsonlistCallType = sortCallTypes(cache.jsonlistCallType);
          }
          this.registerLabels(cache);
          return cache;
        }),
        shareReplay(1),
        catchError(error => {
          this.cache$ = undefined;
          return this.handleError(error);
        })
      );
    }
    return this.cache$;
  }

  /**
   * Le select mostrano le chiavi tradotte: registra come traduzioni le etichette degli elementi in cache.
   */
  private registerLabels(cache: CallManagementCache) {
    const labels = {};
    Object.keys(cache)
      .filter(key => Array.isArray(cache[key]))
      .forEach(key => this.collectLabels(cache[key], labels));
    const lang = this.translateService.currentLang || this.translateService.defaultLang || 'it';
    this.translateService.setTranslation(lang, labels, true);
  }

  private collectLabels(items: any[], labels: {[key: string]: string}) {
    (items || []).forEach(item => {
      const label = item.label || item.defaultLabel || item.description || item.title;
      if (item.key && this.translateService.instant(item.key) === item.key) {
        labels[item.key] = this.readable(label || item.key);
      }
      if (item.childs) {
        this.collectLabels(item.childs, labels);
      }
    });
  }

  /**
   * L'etichetta inviata dal backend può essere a sua volta una chiave di traduzione legacy
   * (es. "label.jconon_application:email_pec_comunicazioni"): si prova a tradurla, anche nella forma
   * con il punto al posto dei due punti; altrimenti si ricava un testo leggibile dalla chiave.
   */
  private readable(label: string): string {
    if (!label || /\s/.test(label) || !/[.:_]/.test(label)) {
      return label;
    }
    for (const candidate of [label, label.replace(/:/g, '.')]) {
      const translated = this.translateService.instant(candidate);
      if (translated && translated !== candidate) {
        return translated;
      }
    }
    const last = label.split(/[.:]/).filter(part => !!part).pop() || label;
    const text = last.replace(/^(aspect|fl)_/, '').replace(/_/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /* Salvataggio */

  /**
   * Salva (o crea) il bando inviando direttamente i valori del form.
   * Gli aspect sono indicati dai controlli 'aspect:<id>' e vengono tradotti nei parametri
   * 'aspect' e 'add-remove-aspect' attesi dal backend; i punteggi aggiungono l'aspect relativo.
   */
  saveCall(formValue: {[key: string]: any}, entity: Call): Observable<Call> {
    const body: {[key: string]: any} = {};
    const addRemove: string[] = [];
    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (UI_ONLY_CONTROLS.indexOf(key) !== -1) {
        return;
      }
      if (key.startsWith(ASPECT_CONTROL_PREFIX)) {
        addRemove.push((value ? 'add-' : 'remove-') + key.substring(ASPECT_CONTROL_PREFIX.length));
        return;
      }
      body[key] = ManageCallService.toRequestValue(value);
    });
    const hasPunteggi = Object.keys(body).some(key => /^jconon_call:punteggio_\d+$/.test(key) && body[key]);
    if (hasPunteggi && !addRemove.some(a => a.endsWith('P:jconon_call:aspect_punteggi'))) {
      addRemove.push('add-P:jconon_call:aspect_punteggi');
    }
    if (Object.keys(body).some(key => key === 'jconon_call:elenco_lingue_da_conoscere') &&
        !addRemove.some(a => a.endsWith('P:jconon_call:aspect_lingue_da_conoscere'))) {
      const lingue = body['jconon_call:elenco_lingue_da_conoscere'];
      addRemove.push((lingue && lingue.length ? 'add-' : 'remove-') + 'P:jconon_call:aspect_lingue_da_conoscere');
    }
    body['aspect'] = (entity && entity.secondaryObjectTypeIds || []).filter(aspect => aspect.startsWith('P:'));
    body['add-remove-aspect'] = addRemove;
    if (!body['cmis:objectTypeId'] && entity) {
      body['cmis:objectTypeId'] = entity.objectTypeId;
    }
    if (!body['cmis:objectId'] && entity && entity.objectId) {
      body['cmis:objectId'] = entity.objectId;
    }
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.put<any>(apiBase + ManageCallService.URL + '/update', body)),
      map(result => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, 'call_manage.saved');
        return this.toCall(result);
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Il backend converte ogni valore con String.valueOf: date in ISO, numeri e booleani come testo,
   * array come elenco di stringhe, valori vuoti come null.
   */
  /**
   * Data nel formato accettato dal backend (NodeMetadataService di cool usa SimpleDateFormat
   * "yyyy-MM-dd'T'HH:mm:ss.SSSZ"): ora locale con scostamento numerico senza due punti (+0100): SimpleDateFormat rifiuta sia la "Z" di toISOString() sia "+01:00".
   */
  static toCmisDate(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return null;
    }
    return new DatePipe('en-US').transform(date, "yyyy-MM-dd'T'HH:mm:ss.SSSZ");
  }

  static toRequestValue(value: any): any {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    if (value instanceof Date) {
      return ManageCallService.toCmisDate(value);
    }
    if (Array.isArray(value)) {
      return value.filter(v => v !== null && v !== undefined && v !== '').map(v => v instanceof Date ? ManageCallService.toCmisDate(v) : String(v));
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return value;
  }

  /* Pubblicazione, eliminazione, bandi figli */

  publish(callId: string, publish: boolean): Observable<{published: boolean}> {
    return this.post(this.callPath(callId) + '/publish', null, new HttpParams().set('publish', String(publish)));
  }

  deleteCall(callId: string): Observable<any> {
    return this.request(apiBase => this.httpClient.delete(apiBase + this.callPath(callId)));
  }

  createChild(callId: string, properties: any): Observable<{objectId: string}> {
    return this.post(this.callPath(callId) + '/child', properties);
  }

  children(callId: string): Observable<Call[]> {
    return this.get<any[]>(this.callPath(callId) + '/children')
      .pipe(map(items => (items || []).map(item => this.toCall(item))));
  }

  /* Etichette */

  labels(callId: string): Observable<any> {
    return this.get(this.callPath(callId) + '/labels');
  }

  saveLabel(callId: string, label: {key: string, oldLabel?: string, newLabel?: string, delete?: boolean}): Observable<any> {
    return this.post(this.callPath(callId) + '/labels', label);
  }

  copyLabels(callId: string, fromCallId: string): Observable<any> {
    return this.post(this.callPath(callId) + '/labels/copy', null, new HttpParams().set('from', fromCallId));
  }

  /* Permessi */

  acl(callId: string): Observable<any> {
    return this.get(this.callPath(callId) + '/acl');
  }

  addAcl(callId: string, authority: string, role: AclRole): Observable<any> {
    return this.post(this.callPath(callId) + '/acl', {authority, role});
  }

  removeAcl(callId: string, authority: string, role: AclRole): Observable<any> {
    return this.request(apiBase => this.httpClient.delete(apiBase + this.callPath(callId) + '/acl',
      {params: new HttpParams().set('authority', authority).set('role', role)}));
  }

  setInheritedAcl(callId: string, value: boolean): Observable<any> {
    return this.request(apiBase => this.httpClient.put(apiBase + this.callPath(callId) + '/acl/inherited', null,
      {params: new HttpParams().set('value', String(value))}));
  }

  /* RdP */

  rdp(callId: string): Observable<any[]> {
    return this.get<any[]>(this.callPath(callId) + '/rdp');
  }

  addRdp(callId: string, authority: string): Observable<any> {
    return this.post(this.callPath(callId) + '/rdp', null, new HttpParams().set('authority', authority));
  }

  removeRdp(callId: string, authority: string): Observable<any> {
    return this.request(apiBase => this.httpClient.delete(apiBase + this.callPath(callId) + '/rdp',
      {params: new HttpParams().set('authority', authority)}));
  }

  /* Commissione */

  commission(callId: string): Observable<CommissionResult> {
    return this.get<CommissionResult>(this.callPath(callId) + '/commission');
  }

  addCommissionMember(callId: string, properties: any): Observable<any> {
    return this.post(this.callPath(callId) + '/commission', properties);
  }

  updateCommissionMember(callId: string, memberId: string, properties: any): Observable<any> {
    return this.request(apiBase => this.httpClient.put(
      apiBase + this.callPath(callId) + '/commission/' + encodeURIComponent(memberId), properties));
  }

  deleteCommissionMember(callId: string, memberId: string): Observable<any> {
    return this.request(apiBase => this.httpClient.delete(
      apiBase + this.callPath(callId) + '/commission/' + encodeURIComponent(memberId)));
  }

  /**
   * Restituisce {videoGenderMissing: true} se il commissario non ha visto il video sulla parita' di genere.
   */
  enableCommissionMember(callId: string, memberId: string, enabled: boolean, force = false):
      Observable<{enabled: boolean, videoGenderMissing?: boolean}> {
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.post<any>(
        apiBase + this.callPath(callId) + '/commission/' + encodeURIComponent(memberId) + '/enabled', null,
        {params: new HttpParams().set('enabled', String(enabled)).set('force', String(force))})),
      catchError((error: HttpErrorResponse) => error.status === 409 && error.error ? of(error.error) : this.handleError(error))
    );
  }

  commissionGender(): Observable<{enabled: boolean, url_it: string, url_en: string, watched: boolean}> {
    return this.get(ManageCallService.URL + '/commission-gender');
  }

  commissionGenderWatched(): Observable<any> {
    return this.post(ManageCallService.URL + '/commission-gender/watched', null);
  }

  /* Menu "Gestore" e "Commissioni" */

  /** Bandi creati dall'utente, i più recenti per primi. */
  managerCalls(limit = 12): Observable<any[]> {
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.get<any[]>(apiBase + ManageCallService.URL + '/managers', { params: new HttpParams().set('limit', String(limit)) })),
      catchError(() => of([]))
    );
  }

  /** Tipologie di bando che l'utente può creare (chiavi, es. F:jconon_call_tind:folder_concorsi_pubblici). */
  enableTypes(): Observable<string[]> {
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.get<string[]>(apiBase + ManageCallService.URL + '/enable-types')),
      catchError(() => of([]))
    );
  }

  /** Bandi in cui l'utente è commissario (più la voce per la parità di genere, quando prevista). */
  commissionCalls(): Observable<any[]> {
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.get<any[]>(apiBase + ManageCallService.URL + '/commissions')),
      catchError(() => of([]))
    );
  }

  /* Proroghe e riaperture */

  prorogations(callId: string): Observable<any[]> {
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.get<any[]>(apiBase + this.callPath(callId) + '/prorogations')),
      catchError(() => of([]))
    );
  }

  /* Esportazioni */

  exportXls(callId: string, status: 'all' | 'sent' | 'temporary' | 'active'): Observable<void> {
    return this.download(apiBase => this.httpClient.get(apiBase + this.callPath(callId) + '/export/applications.xls',
      { params: new HttpParams().set('status', status), responseType: 'blob', observe: 'response' }), 'domande.xls');
  }

  exportZip(callId: string, options: { all: boolean, active: boolean, types?: string[], applications?: string[] }): Observable<void> {
    let params = new HttpParams().set('all', String(options.all)).set('active', String(options.active));
    (options.types || []).forEach(t => params = params.append('types', t));
    (options.applications || []).forEach(a => params = params.append('applications', a));
    return this.download(apiBase => this.httpClient.post(apiBase + this.callPath(callId) + '/export/applications.zip', null,
      { params, responseType: 'blob', observe: 'response' }), 'domande.zip');
  }

  /** Archivio zip di una domanda confermata (stampa e allegati). */
  exportApplicationZip(applicationId: string): Observable<void> {
    return this.download(apiBase => this.httpClient.post(apiBase + '/v1/application/' + encodeURIComponent(applicationId) + '/export.zip', null,
      { responseType: 'blob', observe: 'response' }), 'domanda.zip');
  }

  private download(call: (apiBase: string) => Observable<HttpResponse<Blob>>, fallbackName: string): Observable<void> {
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => call(apiBase)),
      map(response => {
        const disposition = response.headers.get('Content-Disposition') || '';
        const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
        const name = match ? decodeURIComponent(match[1] || match[2]) : fallbackName;
        saveAs(response.body, name);
      }),
      catchError(error => this.handleError(error))
    );
  }

  /* Convocazioni, esclusioni e comunicazioni di tutti i bandi */

  communicationsCount(): Observable<{ [kind: string]: number }> {
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.get<{ [kind: string]: number }>(apiBase + '/v1/application/communications/count')),
      catchError(() => of({}))
    );
  }

  communications(kind: string, page: number, offset = 20): Observable<{ items: any[], count: number }> {
    return this.get(`/v1/application/communications/${kind}`, new HttpParams().set('page', String(page)).set('offset', String(offset)));
  }

  /* Allegati del macro-bando */

  linkAttachmentToChildren(callId: string, documentId: string): Observable<{count: number}> {
    return this.post(this.callPath(callId) + '/attachments/' + encodeURIComponent(documentId) + '/link-children', null);
  }

  copyAttachmentToChildren(callId: string, documentId: string): Observable<{count: number}> {
    return this.post(this.callPath(callId) + '/attachments/' + encodeURIComponent(documentId) + '/copy-children', null);
  }

  /* ---------------------------------------------------------------- */

  private toCall(json: any): Call {
    const call = this.callService.buildInstance(json);
    call.setAllowableActions(json.allowableActions || []);
    return call;
  }

  private callPath(callId: string): string {
    return ManageCallService.URL + '/' + encodeURIComponent(callId);
  }

  private get<T = any>(path: string, params?: HttpParams): Observable<T> {
    return this.request(apiBase => this.httpClient.get<T>(apiBase + path, {params}));
  }

  private post<T = any>(path: string, body: any, params?: HttpParams): Observable<T> {
    return this.request(apiBase => this.httpClient.post<T>(apiBase + path, body, {params}));
  }

  private request<T>(call: (apiBase: string) => Observable<T>): Observable<T> {
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => call(apiBase)),
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = error.status === 403 ? 'admin.error.forbidden' :
      (error.error && (error.error.message || error.error.error)) || 'admin.error.generic';
    this.apiMessageService.sendMessage(MessageType.ERROR, message);
    return throwError(message);
  }
}
