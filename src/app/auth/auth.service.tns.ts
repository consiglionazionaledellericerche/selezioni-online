
import {of as observableOf, throwError as observableThrowError, Subject, Observable, pipe} from 'rxjs';

import {catchError, map, switchMap} from 'rxjs/operators';
import { RouterExtensions } from "nativescript-angular/router";
import { Token } from './model/token.model';
import { User } from './model/user.model';
import { Authority } from './model/authority.model';



import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {ApiMessageService, MessageType} from '../core/api-message.service';
import {Injectable} from '@angular/core';
import {ConfigService} from '../core/config.service';
import * as dialogs from "tns-core-modules/ui/dialogs";

@Injectable()
export class AuthService {

  static tokenHeaders = new HttpHeaders()
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Authorization', 'Basic YWNlOnRoaXNpc3NlY3JldA==');

  // Emesso quando l'utente effettua login
  public userActivated = new Subject<User>();


  // Stored Token
  private token: Token;

  constructor(private router: RouterExtensions,
              private httpClient: HttpClient,
              private apiMessageService: ApiMessageService,
              private configService: ConfigService) {}

  private setToken(token: Token) {
    this.token = token;
  }

  /**
   * Il token.
   * @returns {Token}
   */
  public getToken(): Token {
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
            dialogs.alert({
              title: "Errore",
              message: error.error.error_description,
              okButtonText: "OK"
            }).then(() => {
                console.log("Dialog closed!");
            });
            return observableThrowError(error);
          }));
    }));

  }

  /**
   * Logout.
   */
  public logout() {
    this.setToken(null);
    this.userActivated.next(null);
    this.router.navigate([''], {clearHistory: true});
  }

  /**
   * Recupera il token (refreshato in caso di bisogno).
   * @returns {Observable<Token>}
   */
  public getRefreshedToken(): Observable<Token> {
    if (this.getToken() == null) {
      return observableOf(null);
    }
    return observableOf(this.getToken());
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
