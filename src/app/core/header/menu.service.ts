
import { throwError as observableThrowError, of as observableOf, Subject, Observable, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { Menu } from './model/menu.model';
import { NavbarMenu } from './model/navbar-menu.model';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
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
          callMenuItems.push(new MenuItem(callType.key, undefined, '/manage-call', callType.label, 'PUT', callType.key, [], {'call-type': callType.key}));
        }
      });
      const callMenu = new Menu('call.manage', undefined, callMenuItems, undefined, 'sidebar');
      var adminMenuItems : MenuItem[] = [];
      // Le voci sono visibili in base agli id RBAC gia' definiti per le pagine legacy.
      adminMenuItems.push(new MenuItem('menu.groups', undefined, '/admin/groups', 'menu.groups', 'GET', 'groups'));
      adminMenuItems.push(new MenuItem('menu.gestori', undefined, '/admin/gestori', 'menu.gestori', 'GET', 'gestori'));
      adminMenuItems.push(new MenuItem('menu.users', undefined, '/admin/users', 'menu.users', 'GET', 'gestione-utenti'));
      adminMenuItems.push(new MenuItem('menu.rbac', undefined, '/admin/rbac', 'menu.rbac', 'GET', 'rbac-admin'));
      adminMenuItems.push(new MenuItem('menu.cache', undefined, '/admin/cache', 'menu.cache', 'GET', 'rbac-admin'));
      adminMenuItems.push(new MenuItem('menu.views', undefined, '/admin/views', 'menu.views', 'GET', 'rbac-admin'));
      adminMenuItems.push(new MenuItem('menu.jsConsole', undefined, '/admin/js-console', 'menu.jsConsole', 'GET', 'jsConsole'));
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
    // AuthService letto dall'injector per evitare dipendenze circolari
    const authService = this.injector.get(AuthService);
    const user: any = authService.isAuthenticated() ? authService.getUser() : null;
    if (user && user.capabilities && user.capabilities.isAdmin) {
      this.navbarMenu.activateAll();
      this.navbarEvaluated.next(this.navbarMenu);
      return;
    }
    this.getPermittedPaths(this.navbarMenu.getPaths(this.injector)).subscribe(permittedPaths => {
      this.navbarMenu.evaluate(permittedPaths);
      this.navbarEvaluated.next(this.navbarMenu);
    }, () => {
      // anche senza permessi il menu va mostrato (voci pubbliche)
      this.navbarMenu.evaluate([]);
      this.navbarEvaluated.next(this.navbarMenu);
    });
  }

  /**
   * Controllo multiplo (POST /v1/pcheck); se non disponibile si ripiega sul controllo singolo (GET).
   */
  private getPermittedPaths(paths: any[]): Observable<string[]> {
    return this.configService.getApiBase().pipe(switchMap((apiBase) => {
      return this.httpClient.post<string[]>(apiBase + '/v1/pcheck', paths).pipe(
        catchError(() => forkJoin(paths.map(p => this.httpClient.get<boolean>(apiBase + '/v1/pcheck', {
            params: new HttpParams().set('path', p.path).set('method', p.method || 'GET')
          }).pipe(
            map(allowed => allowed ? p.path : null),
            catchError(() => observableOf(null))
          ))).pipe(map(result => result.filter(path => !!path))))
      );
    }));
  }

}
