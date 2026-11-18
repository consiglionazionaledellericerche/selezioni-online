import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, expand, map, reduce, switchMap } from 'rxjs/operators';
import { ConfigService } from '../config.service';
import { ApiMessageService, MessageType } from '../api-message.service';
import { SpringError } from '../../common/model/spring-error.model';
import { Call } from '../call/call.model';

/** Operazioni sulla domanda che allegano un documento (menu "Operazioni" del legacy). */
export type ApplicationOperation = 'esclusione' | 'riammissione' | 'ritiro' | 'rinuncia' | 'comunicazione' | 'convocazione';

/** Voce di punteggio configurata nel bando (etichetta, minimo e limite massimo). */
export interface ScoreField {
  index: number;
  property: string;
  label: string;
  min: any;
  max: any;
}

/** Proprietà della domanda corrispondenti alle voci di punteggio 1..7 del bando. */
export const SCORE_PROPERTIES = [
  'jconon_application:punteggio_titoli',
  'jconon_application:punteggio_scritto',
  'jconon_application:punteggio_secondo_scritto',
  'jconon_application:punteggio_colloquio',
  'jconon_application:punteggio_prova_pratica',
  'jconon_application:punteggio_6',
  'jconon_application:punteggio_7'
];

export const ESITI = ['V', 'I', 'S', 'R'];

/** Voci di punteggio attive nel bando: quelle con un'etichetta diversa da "Vuoto". */
export function callScoreFields(call: Call): ScoreField[] {
  const source: any = call || {};
  return SCORE_PROPERTIES
    .map((property, i) => ({
      index: i + 1,
      property,
      label: source['punteggio_' + (i + 1)],
      min: source['punteggio_' + (i + 1) + '_min'],
      max: source['punteggio_' + (i + 1) + '_limite']
    }))
    .filter(field => field.label && field.label !== 'Vuoto');
}

/**
 * Client delle API /openapi/v1 per le operazioni di RdP, CONCORSI e commissione sulle domande
 * (ApplicationOperationsController) e per punteggi, graduatoria e allegati del bando (CallScoresController).
 */
@Injectable({ providedIn: 'root' })
export class ApplicationOperationsService {

  constructor(private http: HttpClient,
              private configService: ConfigService,
              private apiMessageService: ApiMessageService,
              private translateService: TranslateService) {}

  /* Singola domanda */

  operation(applicationId: string, operation: ApplicationOperation, file: File, properties: { [key: string]: any }): Observable<any> {
    const data = new FormData();
    data.append('file', file, file.name);
    data.append('properties', new Blob([JSON.stringify(properties || {})], { type: 'application/json' }));
    return this.request(apiBase => this.http.post(this.applicationPath(apiBase, applicationId) + '/operations/' + operation, data));
  }

  reperibilita(applicationId: string, properties: { [key: string]: any }): Observable<any> {
    return this.request(apiBase => this.http.put(this.applicationPath(apiBase, applicationId) + '/reperibilita', properties));
  }

  saveScores(applicationId: string, properties: { [key: string]: any }): Observable<{ message: string }> {
    return this.request(apiBase => this.http.put<{ message: string }>(this.applicationPath(apiBase, applicationId) + '/scores', properties));
  }

  /** Predispone (o restituisce, se esiste) la scheda di valutazione della domanda. */
  createEvaluation(applicationId: string): Observable<{ [key: string]: string }> {
    return this.request(apiBase => this.http.post<{ [key: string]: string }>(this.applicationPath(apiBase, applicationId) + '/evaluation', null));
  }

  /* Documenti (API generiche di cool-jconon) */

  /** Documenti di un tipo contenuti nella cartella (es. la scheda di valutazione o gli allegati del vincitore). */
  children(parentId: string, type: string): Observable<any[]> {
    return this.request(apiBase => this.http.get<{ items: any[] }>(apiBase + '/v1/children', {
      params: new HttpParams().set('parentId', parentId).set('type', type).set('page', '0').set('offset', '100').set('fetchObject', 'true')
    })).pipe(map(result => result.items || []));
  }

  /** Versioni di un documento, dalla più recente. */
  versions(documentId: string): Observable<any[]> {
    return this.configService.getGateway().pipe(
      switchMap(gateway => this.http.get<{ items: any[] }>(gateway + '/rest/search/document/version',
        { params: new HttpParams().set('nodeRef', documentId) })),
      map(result => result.items || []),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  createDocument(parentId: string, file: File, properties: { [key: string]: any }): Observable<any> {
    const data = new FormData();
    data.append('file', file, file.name);
    data.append('properties', new Blob([JSON.stringify(properties)], { type: 'application/json' }));
    return this.request(apiBase => this.http.post(apiBase + '/v1/document/create/' + encodeURIComponent(parentId), data));
  }

  /** Nuova versione del documento (il contenuto sostituito crea una versione maggiore). */
  updateDocument(file: File, properties: { [key: string]: any }): Observable<any> {
    const data = new FormData();
    data.append('file', file, file.name);
    data.append('properties', new Blob([JSON.stringify(properties)], { type: 'application/json' }));
    return this.request(apiBase => this.http.post(apiBase + '/v1/document/update', data));
  }

  deleteDocument(objectId: string): Observable<any> {
    return this.request(apiBase => this.http.delete(apiBase + '/v1/document/delete', { params: new HttpParams().set('objectId', objectId) }));
  }

  download(objectId: string, fileName: string): Observable<void> {
    return this.configService.getGateway().pipe(
      switchMap(gateway => this.http.get(gateway + '/rest/content', { params: new HttpParams().set('nodeRef', objectId), responseType: 'blob' })),
      map(blob => saveAs(blob, fileName)),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /* Bando */

  /** Domande attive del bando (inviate e non escluse), tutte le pagine, come proprietà CMIS. */
  activeApplications(callId: string): Observable<any[]> {
    return this.applications(callId, 'attive');
  }

  saveAllScores(callId: string, rows: { [key: string]: any }[]): Observable<{ righe: number }> {
    return this.request(apiBase => this.http.post<{ righe: number }>(this.callPath(apiBase, callId) + '/scores', rows));
  }

  ranking(callId: string): Observable<any> {
    return this.request(apiBase => this.http.post(this.callPath(apiBase, callId) + '/scores/ranking', null));
  }

  unlockRanking(callId: string): Observable<any> {
    return this.request(apiBase => this.http.post(this.callPath(apiBase, callId) + '/scores/unlock', null));
  }

  protocol(callId: string): Observable<{ [key: string]: string }> {
    return this.request(apiBase => this.http.post<{ [key: string]: string }>(this.callPath(apiBase, callId) + '/scores/protocol', null));
  }

  exportScores(callId: string): Observable<void> {
    return this.request(apiBase => this.http.get(this.callPath(apiBase, callId) + '/scores.xls',
      { responseType: 'blob', observe: 'response' })).pipe(
      map((response: HttpResponse<Blob>) => saveAs(response.body, this.fileName(response, 'punteggi.xls')))
    );
  }

  exportScoresAsync(callId: string): Observable<{ email: string }> {
    return this.request(apiBase => this.http.post<{ email: string }>(this.callPath(apiBase, callId) + '/scores/export-async', null));
  }

  importScores(callId: string, file: File): Observable<{ righe: number }> {
    const data = new FormData();
    data.append('xls', file, file.name);
    return this.request(apiBase => this.http.post<{ righe: number }>(this.callPath(apiBase, callId) + '/scores.xls', data));
  }

  /** Aggiunge il file alle domande indicate o, se nessuna, a tutte quelle che rispettano i filtri. */
  addAttachment(callId: string, file: File, filters: { status: string, totalFrom?: number, totalTo?: number, applications?: string[] }): Observable<{ numAllegati: number }> {
    const data = new FormData();
    data.append('file', file, file.name);
    let params = new HttpParams().set('status', filters.status || 'attive');
    if (filters.totalFrom !== null && filters.totalFrom !== undefined && String(filters.totalFrom) !== '') {
      params = params.set('totalFrom', String(filters.totalFrom));
    }
    if (filters.totalTo !== null && filters.totalTo !== undefined && String(filters.totalTo) !== '') {
      params = params.set('totalTo', String(filters.totalTo));
    }
    (filters.applications || []).forEach(id => params = params.append('applications', id));
    return this.request(apiBase => this.http.post<{ numAllegati: number }>(this.callPath(apiBase, callId) + '/application-attachments', data, { params }));
  }

  /** Domande del bando per stato (come i filtri della pagina legacy "Aggiungi allegato alle domande"). */
  applications(callId: string, status: string): Observable<any[]> {
    const applicationStatus = { P: 'P', C: 'C', tutte: 'all', attive: 'active', escluse: 'excluded' }[status] || 'active';
    const offset = 100;
    const page = (n: number) => this.request(apiBase => this.http.get<{ items: any[], count: number }>(apiBase + '/v1/application', {
      params: new HttpParams().set('callId', callId).set('applicationStatus', applicationStatus)
        .set('orderBy', 'cognome').set('orderDirection', 'asc')
        .set('page', String(n)).set('offset', String(offset))
    })).pipe(map(result => ({ n, result })));
    return page(0).pipe(
      expand(({ n, result }) => (n + 1) * offset < (result.count || 0) && (result.items || []).length ? page(n + 1) : EMPTY),
      reduce((all, { result }) => all.concat(result.items || []), [] as any[]),
      // "escluse" nel legacy: inviate con esclusione o rinuncia
      map(items => status === 'escluse' ? items.filter(item => item['jconon_application:stato_domanda'] === 'C') : items)
    );
  }

  /* ---------------------------------------------------------------- */

  private applicationPath(apiBase: string, applicationId: string): string {
    return apiBase + '/v1/application/' + encodeURIComponent(applicationId);
  }

  private callPath(apiBase: string, callId: string): string {
    return apiBase + '/v1/call/' + encodeURIComponent(callId);
  }

  private fileName(response: HttpResponse<Blob>, fallback: string): string {
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
    return match ? decodeURIComponent(match[1] || match[2]) : fallback;
  }

  private request<T>(call: (apiBase: string) => Observable<T>): Observable<T> {
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => call(apiBase)),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;
    if (error.status === 403) {
      message = 'admin.error.forbidden';
    } else if (error.error instanceof Blob) {
      message = 'admin.error.generic';
    } else if (error.error && error.error.i18n) {
      message = new SpringError(error, this.translateService).getRestErrorMessage();
    } else {
      message = (error.error && (error.error.message || error.error.error)) || 'admin.error.generic';
    }
    this.apiMessageService.sendMessage(MessageType.ERROR, message);
    return throwError(() => message);
  }
}
