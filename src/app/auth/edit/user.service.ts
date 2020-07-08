import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CommonService} from '../../common/controller/common.service';
import {ApiMessageService} from '../../core/api-message.service';
import {of as observableOf, timer as observableTimer, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {ConfigService} from '../../core/config.service';
import {MODULE_CONFIGURAZIONE} from '../../app-routing.module';
import {User} from '../model/user.model';

@Injectable()
export class UserService extends CommonService<User> {

  public static ROUTE = 'user';

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
    return UserService.ROUTE;
  }

  public existingCodicefiscale(codicefiscale: string, id: string): Observable<boolean> {
    return this.getBoolean('/existingcodicefiscale', new HttpParams()
      .set('codicefiscale', codicefiscale.toUpperCase())
      .set('id', id ? id : ''));
  }

  public existingEmail(email: string, id: string): Observable<boolean> {
    return this.getBoolean('/existingemail', new HttpParams()
      .set('email', email.toLowerCase())
      .set('id', id ? id : ''));
  }

}
