import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {CommonService} from '../../common/controller/common.service';
import {ApiMessageService, MessageType} from '../../core/api-message.service';
import {Router} from '@angular/router';
import {ConfigService} from '../../core/config.service';
import {MODULE_CONFIGURAZIONE} from '../../app-routing.module';
import { Call } from './call.model';
import {throwError as observableThrowError, Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import { SpringError } from '../../common/model/spring-error.model';

@Injectable()
export class CallService extends CommonService<Call> {

  public static ROUTE = 'call';
  static PAGE_OFFSET = 12;

  public constructor(protected httpClient: HttpClient,
                     protected apiMessageService: ApiMessageService,
                     protected router: Router,
                     protected configService: ConfigService) {
    super(httpClient, apiMessageService, router, configService);
  }

  public loadLabels(callId: string): Observable<any> {
    if (!callId) {
      this.apiMessageService.sendMessage(MessageType.ERROR, 'Id richiesta mancante');
      observableThrowError(null);
    }
    const params = new HttpParams()
          .set('cmis:objectId', callId);

    return this.configService.getGateway()
      .pipe(
        switchMap((gateway) => {
          return this.httpClient.get<any>(gateway + '/rest/manage-call/load-labels', {params: params})
            .pipe(
              map((item) => {
                return item;
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

  public getModule(): string {
    return MODULE_CONFIGURAZIONE;
  }

  public getApiService(): string {
    return '';
  }

  public getRoute(): string {
    return CallService.ROUTE;
  }

  public getSelect2Mapping(): string {
    return ConfigService.API_BASE + super.getSelect2Mapping();
  }

  public getPageOffset(): number {
    return CallService.PAGE_OFFSET;
  }

}
