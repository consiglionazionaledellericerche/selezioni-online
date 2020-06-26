
import {throwError as observableThrowError, Subject, Observable} from 'rxjs';

import {catchError, map, switchMap} from 'rxjs/operators';

import {Injectable, Injector} from '@angular/core';
import {Menu} from './model/menu.model';
import {MenuItem} from './model/menuitem.model';
import {ServiceReg} from '../../auth/auth.module';
import {NavbarMenu} from './model/navbar-menu.model';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ConfigService} from '../config.service';
import {ApiMessageService, MessageType} from '../api-message.service';
import { path } from 'tns-core-modules/file-system/file-system';

@Injectable()
export class MenuService {

  public navbarEvaluated = new Subject<NavbarMenu>();

  public navbarMenu: NavbarMenu = null;

  public constructor(private injector: Injector,
                     private configService: ConfigService,
                     private apiMessageService: ApiMessageService,
                     protected httpClient: HttpClient) {}

  public destroyNavbar() {
    this.navbarMenu = null;
    this.navbarEvaluated.next(this.navbarMenu);
  }

  /**
   * Costruisce gli oggetti del menu.
   */
  public buildNavbar() {

    const application = new Menu('application.mine.title', undefined, [], '/application');
    const application_user = new Menu('application.user.title', undefined, [], '/applications-user');

    const helpdesk = new Menu('helpdesk.title', undefined, [], '/configurazione/helpdesk');
    const faq = new Menu('faq.title', undefined, [], '/configurazione/faq');
    const contacts = new Menu('contacts.title', undefined, [], '/configurazione/contacts');

    this.navbarMenu = new NavbarMenu([application,application_user, helpdesk, faq, contacts]);

  }

  /**
   * Valuta gli oggetti del menu.
   */
  public evaluateNavbar() {

    // build
    if (!this.navbarMenu) {
      this.buildNavbar();
    }

    this.getPermittedPaths(this.navbarMenu.getPaths(this.injector)).subscribe(permittedPaths => {
      this.navbarMenu.evaluate(permittedPaths);
      this.navbarEvaluated.next(this.navbarMenu);
    });
  }

  private getPermittedPaths(paths: string[]): Observable<string[]> {
    return this.configService.getApiBase().pipe(switchMap((apiBase) => {
      return this.httpClient.post<string[]>(apiBase + '/v1/pcheck', { 'paths': paths}).pipe(
        map((result) => {
          return result;
        }),catchError((httpErrorResponse: HttpErrorResponse) => {
          this.apiMessageService.sendMessage(MessageType.ERROR, 'Il servizio è momentaneamente non disponibile.' +
            ' Riprovare fra alcuni secondi.');
          return observableThrowError(null);
        }),);

    }));
  }

}
