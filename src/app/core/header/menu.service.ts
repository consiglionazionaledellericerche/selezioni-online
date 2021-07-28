
import { throwError as observableThrowError, of as observableOf, Subject, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { Menu } from './model/menu.model';
import { NavbarMenu } from './model/navbar-menu.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../config.service';
import { ApiMessageService, MessageType } from '../api-message.service';
import { CacheService } from '../cache.service';
import { MenuItem } from './model/menuitem.model';

@Injectable()
export class MenuService {

  public navbarEvaluated = new Subject<NavbarMenu>();
  public sidebarEvaluated = new Subject<boolean>();
  public sidebarMenuEvaluated = new Subject<boolean>();

  public navbarMenu: NavbarMenu = null;

  public constructor(private injector: Injector,
                     private configService: ConfigService,
                     private apiMessageService: ApiMessageService,
                     private cacheService: CacheService,
                     protected httpClient: HttpClient) {}

  public destroyNavbar() {
    this.navbarMenu = null;
    this.navbarEvaluated.next(this.navbarMenu);
  }

  /**
   * Costruisce gli oggetti del menu.
   */
  public buildNavbar() : Observable<NavbarMenu> {
    return this.cacheService.cache().pipe(switchMap((cache) => {
      const application = new Menu('application.mine.menu', 'folder-open', undefined, '/my-applications');
      const application_user = new Menu('application.user.menu', 'folder-open-o', undefined, '/applications-user', 'sidebar');

      const helpdesk = new Menu('helpdesk.title', 'question-circle-o', undefined, '/configurazione/helpdesk');
      const faq = new Menu('faq.title', 'question', undefined, '/configurazione/faq');
      const contacts = new Menu('contacts.title', 'address-book-o', undefined, '/configurazione/contacts');
      var callMenuItems : MenuItem[] = [];
      cache.jsonlistCallType.forEach(callType => {
        if (!callType.childs) {
          callMenuItems.push(new MenuItem(callType.key, undefined, '/manage-call?call-type=' + callType.key, callType.label, 'PUT', callType.key));
        }
      });
      const callMenu = new Menu('call.manage', undefined, callMenuItems, undefined, 'sidebar');
      var adminMenuItems : MenuItem[] = [];
      adminMenuItems.push(new MenuItem('menu.groups', undefined, '/groups', 'menu.groups', 'GET', 'groups'));
      adminMenuItems.push(new MenuItem('menu.jsConsole', undefined, '/jsConsole', 'menu.jsConsole', 'GET', 'jsConsole'));
      const adminMenu = new Menu('menu.admin', undefined, adminMenuItems, undefined, 'sidebar');

      return observableOf(new NavbarMenu([application, application_user, helpdesk, faq, contacts, callMenu, adminMenu]));
    }));
  }

  /**
   * Valuta gli oggetti del menu.
   */
  public evaluateNavbar() {
    if (!this.navbarMenu) {
      this.buildNavbar().subscribe((navbarMenu) => {
        this.navbarMenu = navbarMenu;
        this.executePermittedPaths();  
      });
    } else {
      this.executePermittedPaths();  
    }
  }

  private executePermittedPaths() {
    this.getPermittedPaths(this.navbarMenu.getPaths(this.injector)).subscribe(permittedPaths => {
      this.navbarMenu.evaluate(permittedPaths);
      this.navbarEvaluated.next(this.navbarMenu);
    });  
  }

  private getPermittedPaths(paths: any[]): Observable<string[]> {
    return this.configService.getApiBase().pipe(switchMap((apiBase) => {
      return this.httpClient.post<string[]>(apiBase + '/v1/pcheck', paths).pipe(
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
