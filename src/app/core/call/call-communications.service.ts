import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ConfigService } from '../config.service';
import { ApiMessageService, MessageType } from '../api-message.service';

export type CommunicationKind = 'convocazioni' | 'esclusioni' | 'comunicazioni';
export type CommunicationState = 'GENERATO' | 'FIRMATO' | 'SPEDITO' | 'CONSEGNATO';

/** Proprietà CMIS dello stato per ciascun tipo di documento. */
export const STATE_PROPERTY: { [kind in CommunicationKind]: string } = {
  convocazioni: 'jconon_convocazione:stato',
  esclusioni: 'jconon_esclusione:stato',
  comunicazioni: 'jconon_comunicazione:stato'
};

export interface CandidateApplication {
  id: string;
  nome: string;
  cognome: string;
  codiceFiscale: string;
  stato: string;
  esclusione: string;
}

/**
 * Client di /openapi/v1/call/{id}/communications/{kind} (convocazioni, esclusioni, comunicazioni ai candidati).
 */
@Injectable({ providedIn: 'root' })
export class CallCommunicationsService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly apiMessageService = inject(ApiMessageService);

  /**
   * Domande del bando tra cui scegliere i destinatari (solo dati essenziali).
   * Il backend restituisce al massimo 100 elementi per pagina: la prima pagina dà il totale,
   * le successive vengono richieste in parallelo.
   */
  candidates(callId: string, applicationStatus: string): Observable<CandidateApplication[]> {
    const pageSize = 100;
    const page = (n: number) => this.request(apiBase => this.http.get<any>(apiBase + '/v1/application/user', {
      params: new HttpParams().set('page', String(n)).set('offset', String(pageSize)).set('callId', callId)
        .set('applicationStatus', applicationStatus).set('fetchCall', 'false')
    }));
    return page(0).pipe(
      switchMap(first => {
        const pages = Math.min(Math.ceil((first?.count || 0) / pageSize), 100);
        const rest = Array.from({ length: Math.max(pages - 1, 0) }, (_, i) => page(i + 1));
        return rest.length ? forkJoin(rest).pipe(map(others => [first, ...others])) : of([first]);
      }),
      map(results => results.flatMap(result => result?.items || []).map(item => ({
        id: item['cmis:objectId'],
        nome: item['jconon_application:nome'],
        cognome: item['jconon_application:cognome'],
        codiceFiscale: item['jconon_application:codice_fiscale'],
        stato: item['jconon_application:stato_domanda'],
        esclusione: item['jconon_application:esclusione_rinuncia']
      })).sort((a, b) => (a.cognome || '').localeCompare(b.cognome || '') || (a.nome || '').localeCompare(b.nome || '')))
    );
  }

  list(callId: string, kind: CommunicationKind, stato?: CommunicationState): Observable<any[]> {
    let params = new HttpParams();
    if (stato) {
      params = params.set('stato', stato);
    }
    return this.request(apiBase => this.http.get<any[]>(this.url(apiBase, callId, kind), { params }));
  }

  generate(callId: string, kind: CommunicationKind, data: FormData): Observable<number> {
    data.set('callId', callId);
    return this.request(apiBase => this.http.post<any>(this.url(apiBase, callId, kind) + '/generate', data))
      .pipe(map(result => result.count));
  }

  sign(callId: string, kind: CommunicationKind, ids: string[], credentials: { [key: string]: any }): Observable<number> {
    return this.request(apiBase => this.http.post<any>(this.url(apiBase, callId, kind) + '/sign', null,
      { params: this.params(credentials, ids) })).pipe(map(result => result.count));
  }

  send(callId: string, kind: CommunicationKind, ids: string[], options: { [key: string]: any }): Observable<number> {
    return this.request(apiBase => this.http.post<any>(this.url(apiBase, callId, kind) + '/send', null,
      { params: this.params(options, ids) })).pipe(map(result => result.count));
  }

  delete(callId: string, kind: CommunicationKind, stato: CommunicationState, ids: string[]): Observable<number> {
    return this.request(apiBase => this.http.delete<any>(this.url(apiBase, callId, kind),
      { params: this.params({ stato }, ids) })).pipe(map(result => result.count));
  }

  private url(apiBase: string, callId: string, kind: CommunicationKind): string {
    return apiBase + '/v1/call/' + encodeURIComponent(callId) + '/communications/' + kind;
  }

  private params(values: { [key: string]: any }, ids: string[]): HttpParams {
    let params = new HttpParams();
    Object.keys(values || {}).filter(key => values[key] !== null && values[key] !== undefined && values[key] !== '')
      .forEach(key => params = params.set(key, String(values[key])));
    (ids || []).forEach(id => params = params.append('ids', id));
    return params;
  }

  private request<T>(call: (apiBase: string) => Observable<T>): Observable<T> {
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => call(apiBase)),
      catchError((error: HttpErrorResponse) => {
        const message = error.status === 403 ? 'admin.error.forbidden' :
          (error.error && (error.error.message || error.error.error)) || 'admin.error.generic';
        this.apiMessageService.sendMessage(MessageType.ERROR, message);
        return throwError(() => message);
      })
    );
  }
}
