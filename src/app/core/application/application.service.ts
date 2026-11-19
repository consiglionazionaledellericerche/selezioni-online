import { DocumentService } from '../document/document.service';
import { of as observableOf } from 'rxjs';
import { throwError as observableThrowError, Observable, Subject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { CommonService } from '../../common/controller/common.service';
import { ApiMessageService, MessageType } from '../api-message.service';
import { Router } from '@angular/router';
import { ConfigService } from '../config.service';
import { MODULE_CONFIGURAZIONE } from '../../app-routing.module';
import { Application } from './application.model';
import { SpringError } from '../../common/model/spring-error.model';
import { ApplicationState } from './application-state.model';
import { Helpers } from '../../common/helpers/helpers';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ApplicationService extends CommonService<Application> {

  public static ROUTE = 'application';
  // Emesso quando l'utente effettua login
  public applicationChanged = new Subject<Application>();

  public constructor(protected httpClient: HttpClient,
                     protected apiMessageService: ApiMessageService,
                     protected router: Router,
                     protected translateService: TranslateService,
                     protected configService: ConfigService) {
    super(httpClient, apiMessageService, translateService, router, configService);
  }

  public getModule(): string {
    return MODULE_CONFIGURAZIONE;
  }

  public getApiService(): string {
    return '';
  }

  public getRoute(): string {
    return ApplicationService.ROUTE;
  }

  /** Conteggi delle domande visibili all'utente (tutte le candidature), raggruppati per stato. */
  public allApplicationState(): Observable<ApplicationState[]> {
    return this.configService.getApiBase().pipe(
      switchMap((apiBase) => this.httpClient.get<any[]>(apiBase + this.getApiPath() + '/all-state')),
      map((result: any[]) => (result || []).map(item => Helpers.buildInstance(item, ApplicationState))),
      catchError(() => observableOf([] as ApplicationState[]))
    );
  }

  public applicationState(userId: string): Observable<ApplicationState[]> {
    if (!userId) {
      this.apiMessageService.sendMessage(MessageType.ERROR, 'Id richiesta mancante');
      observableThrowError(null);
    }
    const params = new HttpParams()
          .set('user', userId);
    return this.configService.getApiBase()
    .pipe(
      switchMap((apiBase) => {
        return this.httpClient.get<ApplicationState[]>(apiBase + this.getApiPath() + '/state', {params: params})
          .pipe(
            map((result: any) => {
              try {
                const items: ApplicationState[] = result.map((item) => {
                  const instance: ApplicationState = Helpers.buildInstance(item, ApplicationState);
                  return instance;
                });
                return items;
              } catch (ex) {
                console.error(ex);
                this.apiMessageService.sendMessage(MessageType.ERROR, ex);
                observableThrowError(ex);
              }
            }),
            catchError( (httpErrorResponse: HttpErrorResponse) => {
              const springError = new SpringError(httpErrorResponse, this.translateService);
              this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
              return observableThrowError(springError);
            })
          );
      })
    );
  }
  
  /**
   * Come la costruzione standard, ma conserva le proprietà della domanda che il modello non dichiara
   * (aspect resi dal componente generico): servono per inviarle di nuovo a salvataggio e invio.
   */
  protected _buildInstance(json: any): Application {
    const instance = super._buildInstance(json);
    if (instance && json) {
      // solo le proprietà che il modello non dichiara: quelle dichiarate di altre sezioni non vanno reinviate
      // (es. la data di nascita restituita dal backend in UTC, che il salvataggio non saprebbe leggere)
      const declared = this.serializeInstance(instance) || {};
      instance.extraProperties = Object.keys(json)
        .filter(key => key.includes(':') && !(key in declared) && !/^(cmis|alfcmis|sys|cm|app):/.test(key) && json[key] !== undefined)
        // le date possono arrivare come millisecondi: tornano Date, inviate poi in formato ISO
        .reduce((extra, key) => ({ ...extra, [key]: typeof json[key] === 'number' && Math.abs(json[key]) >= 1e11 ?
          new Date(json[key]) : json[key] }), {});
    }
    return instance;
  }

  /**
   * Proprietà dichiarate nel modello più quelle presenti solo nel form (aspect senza componente dedicato,
   * es. le dichiarazioni sul trattamento dei dati e sul D.P.R. 445/2000), che altrimenti non verrebbero salvate.
   */
  private serializeWithExtra(application: Application): any {
    const serialized = this.serializeInstance(application) || {};
    const extra = application?.extraProperties || {};
    Object.keys(extra)
      .filter(key => key.includes(':') && !(key in serialized))
      .forEach(key => serialized[key] = ApplicationService.toCmisValue(extra[key]));
    return serialized;
  }

  /** Valori del form nel formato atteso dal backend: date ISO, comuni e oggetti con id come identificativo. */
  private static toCmisValue(value: any): any {
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : DocumentService.toCmisDate(value);
    }
    // date già in testo (es. restituite dal backend in UTC con "Z"): riscritte nel formato che il backend accetta
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : DocumentService.toCmisDate(date);
    }
    if (Array.isArray(value)) {
      return value.map(v => ApplicationService.toCmisValue(v));
    }
    if (value && typeof value === 'object') {
      return value.id !== undefined ? value.id : value;
    }
    return value === undefined ? null : value;
  }

  public saveApplication(application: Application): Observable<Application> {
    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.post<Application>(
              apiBase + this.getApiPath() + '/save', 
              this.serializeWithExtra(application)
            )
            .pipe(
              map((item) => {
                try {
                  this.applicationChanged.next(application);
                  const instance: Application = this._buildInstance(item);
                  return instance;
                } catch (ex) {
                  this.apiMessageService.sendMessage(MessageType.ERROR, ex);
                  observableThrowError(ex);
                }
              }),
              catchError( (httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return observableThrowError(springError);
              })
            );
        })
      );
  }

  public deleteApplication(applicationId: string): Observable<any> {
    if (!applicationId) {
      this.apiMessageService.sendMessage(MessageType.ERROR, 'Id richiesta mancante');
      observableThrowError(null);
    }
    const params = new HttpParams()
          .set('objectId', applicationId);

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.delete<any>(apiBase + this.getApiPath() + '/delete', {params: params})
            .pipe(
              map((result) => {
                this.applicationChanged.next(undefined);
                return result;
              }),
              catchError( (httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return observableThrowError(springError.getRestErrorMessage());
              })
            );
        })
      );
  }

  public sendApplication(application: Application): Observable<any> {
    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.post<any>(
              apiBase + this.getApiPath() + '/send', 
              this.serializeWithExtra(application)
            )
            .pipe(
              map((result) => {
                try {
                  this.applicationChanged.next(application);
                  return result;
                } catch (ex) {
                  this.apiMessageService.sendMessage(MessageType.ERROR, ex);
                  observableThrowError(ex);
                }
              }),
              catchError( (httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return observableThrowError(springError);
              })
            );
        })
      );
  }

  public loadApplication(callId: string, applicationId: string, userId: string): Observable<Application> {
    if (!callId) {
      this.apiMessageService.sendMessage(MessageType.ERROR, 'Id richiesta mancante');
      observableThrowError(null);
    }
    const params = new HttpParams()
          .set('callId', callId)
          .set('applicationId', applicationId)
          .set('userId', userId);

    return this.configService.getGateway()
      .pipe(
        switchMap((gateway) => {
          return this.httpClient.get<Application>(gateway + '/rest/manage-application/main', {params: params})
            .pipe(
              map((item) => {
                try {
                  const instance: Application = this._buildInstance(item);
                  return instance;
                } catch (ex) {
                  console.error(ex);
                  this.apiMessageService.sendMessage(MessageType.ERROR, ex);
                  observableThrowError(ex);
                }
              }),
              catchError( (httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                return observableThrowError(springError.getRestErrorMessage());
              })
            );
        })
      );
  }

  public reopenApplication(applicationId: string): Observable<boolean> {
    if (!applicationId) {
      this.apiMessageService.sendMessage(MessageType.ERROR, 'Id richiesta mancante');
      observableThrowError(null);
    }
    const params = new HttpParams()
          .set('objectId', applicationId);

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.post<boolean>(apiBase + this.getApiPath() + '/reopen', params)
            .pipe(
              map((result) => {
                return result;
              }),
              catchError( (httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                return observableThrowError(springError.getRestErrorMessage());
              })
            );
        })
      );
  }

  /**
   * Duplica la domanda nel bando di destinazione.
   * Restituisce l'identificativo della nuova domanda.
   */
  public pasteApplication(applicationSourceId: string, callTargetId: string): Observable<string> {
    const params = new HttpParams()
          .set('applicationSourceId', applicationSourceId)
          .set('callTargetId', callTargetId);

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.post<any>(apiBase + this.getApiPath() + '/paste', params)
            .pipe(
              map((result) => result['cmis:objectId']),
              catchError( (httpErrorResponse: HttpErrorResponse) => {
                const message = httpErrorResponse.error && httpErrorResponse.error.error ?
                  httpErrorResponse.error.error :
                  new SpringError(httpErrorResponse, this.translateService).getRestErrorMessage();
                this.apiMessageService.sendMessage(MessageType.ERROR, message);
                return observableThrowError(message);
              })
            );
        })
      );
  }

  public printApplication(applicationId: string): Observable<boolean> {
    if (!applicationId) {
      this.apiMessageService.sendMessage(MessageType.ERROR, 'Id richiesta mancante');
      observableThrowError(null);
    }
    const params = new HttpParams()
          .set('objectId', applicationId);

    return this.configService.getApiBase()
      .pipe(
        switchMap((apiBase) => {
          return this.httpClient.post<boolean>(apiBase + this.getApiPath() + '/print', params)
            .pipe(
              map((result) => {
                return result;
              }),
              catchError( (httpErrorResponse: HttpErrorResponse) => {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                return observableThrowError(springError.getRestErrorMessage());
              })
            );
        })
      );
  }
  
  public getPageOffset(): number {
    return 100;
  }
}
