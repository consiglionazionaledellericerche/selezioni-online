import {Injectable} from '@angular/core';
import {catchError, map, switchMap} from 'rxjs/operators';
import {HttpClient, HttpParams, HttpErrorResponse} from '@angular/common/http';
import {CommonService} from '../../common/controller/common.service';
import {ApiMessageService, MessageType} from '../../core/api-message.service';
import {throwError as observableThrowError, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {ConfigService} from '../../core/config.service';
import {MODULE_CONFIGURAZIONE} from '../../app-routing.module';
import {User} from '../model/user.model';
import { SpringError } from '../../common/model/spring-error.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class UserService extends CommonService<User> {

  public static ROUTE = 'user';

  public constructor(protected httpClient: HttpClient,
                     protected apiMessageService: ApiMessageService,
                     protected router: Router,
                     protected configService: ConfigService,
                     public translateService: TranslateService
                     ) {
    super(httpClient, apiMessageService, translateService, router, configService);
  }

  public getModule(): string {
    return MODULE_CONFIGURAZIONE;
  }

  public getApiService(): string {
    return '';
  }

  public getRoute(): string {
    return UserService.ROUTE;
  }

  public existingCodicefiscale(codicefiscale: string, id: string): Observable<boolean> {
    return this.getBoolean('/existingcodicefiscale', new HttpParams()
      .set('codicefiscale', codicefiscale.toUpperCase())
      .set('id', id ? id : ''));
  }

  public existingEmail(email: string, id: string): Observable<boolean> {
    return this.getBoolean('/existingemail', new HttpParams()
      .set('email', encodeURIComponent(email.toLowerCase()))
      .set('id', id ? id : ''));
  }

  public changePassword(username: string, json: any): Observable<any> {
    return this.configService.getProxy()
      .pipe(
        switchMap((proxy) => {
          return this.httpClient.post<any>(proxy + '?url=service/api/person/changepassword/' + username, json)
            .pipe(
              map((result) => {
               this.apiMessageService.sendMessage(MessageType.SUCCESS, this.saveMessage());
               return result;
              }),
              catchError((httpErrorResponse: HttpErrorResponse) => {
               if(httpErrorResponse.status === 401) {
                this.apiMessageService.sendMessage(MessageType.ERROR, 'Password errata!');
                return observableThrowError('Password errata!');
               } else {
                const springError = new SpringError(httpErrorResponse, this.translateService);
                this.apiMessageService.sendMessage(MessageType.ERROR, springError.getRestErrorMessage());
                return observableThrowError(springError); 
               }
              })
            );
        })
      );
  }

}
