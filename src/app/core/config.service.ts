
import {of as observableOf, Observable, forkJoin } from 'rxjs';

import {map, catchError, switchMap } from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config, Oidc} from './config.model';
import {TranslateLoader } from '@ngx-translate/core';
import { environment } from '../../environments/environment';

@Injectable()
export class ConfigService implements TranslateLoader{

  public static CONFIG_URL = '/assets/config/config.json';
  public static URL_CACHE = '/v1/cache';
  public static URL_PAESI = '/rest/static/json/paesi.json';
  public static URL_COMUNI = '/rest/static/json/comuni.json';
  public static URL_SEDI = '/rest/sedi';

  public static URL_OAUTH_LOGIN = '/security/login';
  public static URL_OAUTH_LOGOUT = '/security/logout';

  public static URL_SSO_LOGIN = '/sso/login';

  public static URL_VALIDATE_TICKET = '/security/validate';

  public static USER_ROLES_URL = '/v1/ruolo/ruoliattivi/'

  public static API_BASE = '/openapi';
  public static PROXY = '/rest/proxy';

  private config: Config = null;

  constructor(private httpClient: HttpClient) {}

  getGateway(): Observable<string> {
    return observableOf(environment.apiUrl);
  }

  getOidc(): Observable<Oidc> {
      return observableOf(new Oidc(
        environment.oidc.enable,
        environment.oidc.authority,
        environment.oidc.redirectUrl,
        environment.oidc.clientId
      ));
  }

  getApiBase(): Observable<string> {
    return this.getGateway().pipe(map( gateway => {
      return gateway + ConfigService.API_BASE;
    }));
  }

  getProxy(): Observable<string> {
    return this.getGateway().pipe(map( gateway => {
      return gateway + ConfigService.PROXY;
    }));
  }

  getTranslation(lang: string): Observable<any> {
    return forkJoin(
      [
        this.getRemoteTranslation(lang),
        this.httpClient.get(`/assets/i18n/${lang}.json`)
      ]
    ).pipe(map((data:any) => {
      return {...data[0], ...data[1]};
    }));
  }  

  getRemoteTranslation(lang: string): Observable<any> {    
    return this.getApiBase()
      .pipe(
        switchMap((apibase) => {
          return this.httpClient.get<any>( apibase + ConfigService.URL_CACHE + `/labels`)
            .pipe(
              catchError( _ => this.httpClient.get(`/assets/i18n/${lang}.json`))
            );
        })
      );
  }
}
