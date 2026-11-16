import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ConfigService } from '../../core/config.service';

export type HelpdeskProblemType = 'tecnico' | 'normativo';

/**
 * Invio delle segnalazioni all'HelpDesk tramite /openapi/v1/helpdesk.
 */
@Injectable()
export class HelpdeskService {

  public static URL = '/v1/helpdesk';

  constructor(private httpClient: HttpClient, private configService: ConfigService) {}

  public send(data: {[key: string]: string}, allegato?: File): Observable<any> {
    const formData = new FormData();
    Object.keys(data)
      .filter(key => data[key] !== undefined && data[key] !== null && data[key] !== '')
      .forEach(key => formData.append(key, data[key]));
    if (allegato) {
      formData.append('allegato', allegato, allegato.name);
    }
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.post(apiBase + HelpdeskService.URL + '/send', formData)),
      catchError((error: HttpErrorResponse) => throwError(
        error.error && error.error.message ? error.error.message : 'message.helpdesk.send.failed'
      ))
    );
  }
}
