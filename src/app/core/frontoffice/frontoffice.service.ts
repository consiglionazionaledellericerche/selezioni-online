import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ConfigService } from '../config.service';

/** Avviso (avvisi:document) come restituito dal FrontOfficeService di cool-common. */
export interface Notice {
  nodeRef: string;
  name?: string;
  type?: string;
  title?: string;
  text?: string;
  noticeStyle?: string;
  /** MM/dd/yyyy HH:mm:ss */
  dataPubblicazione?: string;
  dataScadenza?: string;
  number?: number;
  createdBy?: string;
}

/** FAQ (faq:document). */
export interface FaqItem {
  nodeRef: string;
  type?: string;
  faqBando?: string;
  question?: string;
  answer?: string;
  show?: boolean;
  dataPubblicazione?: string;
  number?: number;
  createdBy?: string;
}

/** Avvisi e FAQ (/openapi/v1/frontoffice), ex pagina "Front Office" del legacy. */
@Injectable({ providedIn: 'root' })
export class FrontOfficeService {

  /** Visibilità di default degli avvisi (tutti gli utenti). */
  static readonly EVERYONE = 'GROUP_EVERYONE';

  constructor(private http: HttpClient, private configService: ConfigService) {}

  /** Avvisi in corso di validità (pubblicati e non scaduti). */
  notices(): Observable<Notice[]> {
    return this.get<{ docs: Notice[] }>('/notices').pipe(map(r => r?.docs || []), catchError(() => of([])));
  }

  manageNotices(filters: { [key: string]: string } = {}): Observable<{ docs: Notice[], maxNotice?: number }> {
    return this.get('/notices/manage', filters);
  }

  manageFaq(filters: { [key: string]: string } = {}): Observable<{ docs: FaqItem[], maxFaq?: number }> {
    return this.get('/faq/manage', filters);
  }

  /**
   * Crea o modifica un avviso. Come nel legacy (default del campo "Visibilità"), senza un utente o gruppo
   * indicato l'avviso è visibile a tutti (GROUP_EVERYONE): con l'autorità vuota il backend risponde 500.
   */
  saveNotice(notice: { [key: string]: any }): Observable<any> {
    const body = { ...notice, authority: (notice.authority || '').trim() || FrontOfficeService.EVERYONE };
    return this.configService.getApiBase().pipe(switchMap(apiBase => this.http.post(apiBase + '/v1/frontoffice/notices', body)));
  }

  /**
   * Avviso automatico alla pubblicazione di una convocazione del bando, come nel legacy: tipo
   * "Convocazione Bando <codice>", valido da oggi alla scadenza della convocazione, con il link al documento.
   */
  notifyConvocation(callCode: string, document: { objectId?: string, name?: string }, expiry: Date | string): Observable<any> {
    const pad = (n: number) => String(n).padStart(2, '0');
    const day = (date: Date) => date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    const now = new Date();
    const end = expiry ? new Date(expiry as any) : null;
    return this.saveNotice({
      title: 'E\' stata pubblicata la convocazione ' + document.name,
      text: '<p>Per scaricare la convocazione cliccare <a href=\'rest/content?nodeRef=' + document.objectId + '\'>qui</a></p>',
      type: 'Convocazione Bando ' + callCode,
      style: 'information',
      data: day(now),
      dataScadenza: day(end && !isNaN(end.getTime()) ? end : now),
      number: Number(String(now.getFullYear()) + pad(now.getMonth() + 1) + pad(now.getDate()) + pad(now.getHours()))
    });
  }

  saveFaq(faq: { [key: string]: any }): Observable<any> {
    return this.configService.getApiBase().pipe(switchMap(apiBase => this.http.post(apiBase + '/v1/frontoffice/faq', faq)));
  }

  delete(nodeRef: string): Observable<any> {
    return this.configService.getApiBase().pipe(switchMap(apiBase =>
      this.http.delete(apiBase + '/v1/frontoffice', { params: new HttpParams().set('nodeRef', nodeRef) })));
  }

  /** Date del FrontOfficeService (MM/dd/yyyy HH:mm:ss) in Date. */
  static date(value: string): Date {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}):(\d{2}):(\d{2}))?/.exec(value || '');
    return m ? new Date(+m[3], +m[1] - 1, +m[2], +(m[4] || 0), +(m[5] || 0)) : null;
  }

  /** yyyy-MM-dd per i campi data dei form. */
  static isoDay(value: string): string {
    const date = FrontOfficeService.date(value);
    if (!date) {
      return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  private get<T>(path: string, filters: { [key: string]: string } = {}): Observable<T> {
    let params = new HttpParams();
    Object.keys(filters).filter(k => filters[k]).forEach(k => params = params.set(k, filters[k]));
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => this.http.get<T>(apiBase + '/v1/frontoffice' + path, { params })));
  }
}
