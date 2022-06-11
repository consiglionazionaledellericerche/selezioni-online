
import {of as observableOf, throwError as observableThrowError, Subject, Observable, pipe} from 'rxjs';

import {catchError, map, switchMap} from 'rxjs/operators';
import { Router } from '@angular/router';
import { Token } from './model/token.model';
import { User } from './model/user.model';
import { Authority } from './model/authority.model';

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {ApiMessageService, MessageType} from '../core/api-message.service';
import {Injectable} from '@angular/core';
import {ConfigService} from '../core/config.service';
import { MenuService } from '../core/header/menu.service';

@Injectable()
export class AuthService {

  static tokenHeaders = new HttpHeaders()
    .set('Content-Type', 'application/x-www-form-urlencoded');

  // Emesso quando l'utente effettua login
  public userActivated = new Subject<User>();
  public userModified = new Subject<User>();


  // Stored Token
  private token: Token;

  constructor(private router: Router,
              private httpClient: HttpClient,
              private menuService: MenuService,
              private apiMessageService: ApiMessageService,
              private configService: ConfigService) {}

  private setToken(token: Token) {
    this.token = token;
    if (this.token == null) {
      localStorage.removeItem('token');
    } else {
      localStorage.setItem('token', JSON.stringify(this.token));
    }
  }

  public updateUserOnToken(user: User): void {
    var token = this.getToken();
    token.user = user;
    this.setToken(token);
    this.userModified.next(user);
  }
  /**
   * Il token.
   * @returns {Token}
   */
  public getToken(): Token {
    if (this.token) {
      return this.token;
    }
    this.token = JSON.parse(localStorage.getItem('token'));
    if (this.token) {
      return this.token;
    }
    return null;
  }
  

  /**
   * Login.
   * In caso positivo ritorna il token, altrimenti l'errore.
   * @param username
   * @param password
   */
   public signinUserSSO(access_token: string): Observable<any> {
    const post = 'access_token=' + access_token;
    return this.configService.getGateway().pipe(switchMap((gateway) => {
      return this.httpClient.post<Token>(gateway + ConfigService.URL_SSO_LOGIN, post,
        {headers: AuthService.tokenHeaders}).pipe(
        map(
          (token) => {
            token.valid_until = new Date().getTime() + (token.expires_in * 1000);
            this.setToken(token);
            this.userActivated.next(this.token.user); // ex. per notifica all'headerComponent.
            return this.getToken();
          }),
        catchError(
          (error: HttpErrorResponse) => {
            this.apiMessageService.sendMessage(MessageType.ERROR, 'signin.unauthorized');
            return observableThrowError(error);
          }));
    }));
  }

  /**
   * Login.
   * In caso positivo ritorna il token, altrimenti l'errore.
   * @param username
   * @param password
   */
  public signinUser(username: string, password: string): Observable<any> {
    const post = 'grant_type=password&scope=webclient&username=' + username + '&password=' + password;
    return this.configService.getApiBase().pipe(switchMap((apiBase) => {
      return this.httpClient.post<Token>(apiBase + ConfigService.URL_OAUTH_LOGIN, post,
        {headers: AuthService.tokenHeaders}).pipe(
        map(
          (token) => {
            token.valid_until = new Date().getTime() + (token.expires_in * 1000);
            this.setToken(token);
            this.userActivated.next(this.token.user); // ex. per notifica all'headerComponent.
            return this.getToken();
          }),
        catchError(
          (error: HttpErrorResponse) => {
            this.apiMessageService.sendMessage(MessageType.ERROR, 'signin.unauthorized');
            return observableThrowError(error);
          }));
    }));
  }

  public logoutUser(): Observable<any> {
    return this.configService.getApiBase().pipe(switchMap((apiBase) => {
      return this.httpClient.post<Token>(apiBase + ConfigService.URL_OAUTH_LOGOUT,
        {headers: AuthService.tokenHeaders}).pipe(
        map(
          (result) => {
            return result;
          }),
        catchError(
          (error: HttpErrorResponse) => {
            this.apiMessageService.sendMessage(MessageType.ERROR, error.error.error_description);
            return observableThrowError(error);
          }));
    }));

  }

  private refreshToken(): Observable<Token> {
    console.info('verifico la validita del ticket');
    const currentToken = this.getToken();
    const post = 'ticket=' + currentToken.ticket;
    return this.configService.getApiBase().pipe(switchMap((apiBase) => {
      return this.httpClient.post<Token>(apiBase + ConfigService.URL_VALIDATE_TICKET, post,
        {headers: AuthService.tokenHeaders}).pipe(
        map(
          (resp: any) => {
            if(resp.isValid) {
              currentToken.valid_until = new Date().getTime() + (currentToken.expires_in * 1000);
              this.setToken(currentToken);
              return currentToken;
            } else {
              this.setToken(null);
              return null;
            }
          }));
    }));
  }
  /**
   * Logout.
   */
  public logout() {
    this.logoutUser().subscribe((result) => {
      this.setToken(null);
      this.menuService.destroyNavbar();
      this.userActivated.next(null);
      this.router.navigate(['']);
    });
  }

  /**
   * Recupera il token (refreshato in caso di bisogno).
   * @returns {Observable<Token>}
   */
  public getRefreshedToken(): Observable<Token> {
    if (this.getToken() == null) {
      return observableOf(null);
    }
    if (!this.isTokenExpired()) {
      return observableOf(this.getToken());
    }
    return this.refreshToken();
  }

  /**
   * Se il token è scaduto.
   * @returns {Boolean}
   */
  public isTokenExpired(): Boolean {
    return this.getToken().valid_until <= new Date().getTime();
  }

  /**
   * If User is autenticated.
   * @returns {boolean}
   */
  public isAuthenticated() {
    return this.getToken() != null;
  }

  /**
   * Authenticated User
   * @returns {any}
   */
  public getUser(): User {
    return this.getToken() ? this.getToken().user : null;
  }

  /**
   * Authenticated User's authorities.
   * @returns {any}
   */
  public getAuthorities(): Authority[] {
    return this.getToken() ? this.getToken().auth : null;
  }

  /**
   * Authenticate username.
   * @returns {string}
   */
  public getUsername(): string {
    return this.getUser() ? null : this.getUser().userName;
  }

}
