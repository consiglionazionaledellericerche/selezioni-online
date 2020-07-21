import {throwError as observableThrowError, of as observableOf, Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {CommonService} from '../../common/controller/common.service';
import {ApiMessageService, MessageType} from '../api-message.service';
import {Router} from '@angular/router';
import {ConfigService} from '../config.service';
import {MODULE_CONFIGURAZIONE} from '../../app-routing.module';
import { Application } from './application.model';
import { SpringError } from '../../common/model/spring-error.model';
import { ApplicationState } from './application-state.model';
import { Helpers } from '../../common/helpers/helpers';

@Injectable()
export class ApplicationService extends CommonService<Application> {

  public static ROUTE = 'application';
  
  public constructor(protected httpClient: HttpClient,
                     protected apiMessageService: ApiMessageService,
                     protected router: Router,
                     protected configService: ConfigService) {
    super(httpClient, apiMessageService, router, configService);
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
              const springError = new SpringError(httpErrorResponse);
              this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
              return observableThrowError(springError);
            })
          );
      })
    );
  }

  public loadApplication(callId: string, userId: string): Observable<Application> {
    if (!callId) {
      this.apiMessageService.sendMessage(MessageType.ERROR, 'Id richiesta mancante');
      observableThrowError(null);
    }
    const params = new HttpParams()
          .set('callId', callId)
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
                const springError = new SpringError(httpErrorResponse);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return observableThrowError(springError);
              })
            );
        })
      );
  }

  public getPageOffset(): number {
    console.log('sss');
    return 100;
  }
}
