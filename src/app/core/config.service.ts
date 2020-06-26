
import {of as observableOf, Observable} from 'rxjs';

import {map, catchError} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from './config.model';
import {environment} from '../../environments/environment';

@Injectable()
export class ConfigService {

  public static CONFIG_URL = '/assets/config/config.json';
  public static URL_CACHE = '/v1/cache';

  public static URL_OAUTH_LOGIN = '/security/login';
  public static URL_OAUTH_LOGOUT = '/security/logout';

  public static URL_VALIDATE_TICKET = '/security/validate';

  public static USER_ROLES_URL = '/v1/ruolo/ruoliattivi/'

  public static API_BASE = '/openapi';
  public static PROXY = '/rest/proxy';

  private config: Config = null;

  constructor(private httpClient: HttpClient) {}

  public initializeConfiguration(): Observable<Config> {
    return this.httpClient.get<Config>(ConfigService.CONFIG_URL, {responseType: 'json'}).pipe(
      map(
        (config) => {
          this.config = config;
          console.log(config);
          if (this.config.gateway.indexOf('{') >= 0) {
            console.log('Run non dockerizzato, il gateway è prelevato dall\'environment');
            this.config.gateway = environment.zuul_uri;
          }
          console.log('Configurazione inizializzata correttamente');
          console.log('Il gateway è ' + this.config.gateway);
          return config;
        }
      ));
  }

  getGateway(): Observable<string> {
    if (this.config) {
      return observableOf(this.config.gateway);
    }
    return this.initializeConfiguration().pipe(map(
      (config) => {
        return config.gateway;
      }
    ),catchError((error) => {
      console.error('La configurazione non è stata inizializzata');
      return observableOf(null);
    }),);

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

}
