import { ToastsComponent } from './toasts.component';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LangChangeEvent, TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ItDropdownModule, ItHeaderComponent, ItIconComponent, ItNavBarModule,
} from 'design-angular-kit';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/model/user.model';
import { ApiMessage, ApiMessageService, MessageType } from '../core/api-message.service';
import { MenuService } from '../core/header/menu.service';
import { NavbarMenu } from '../core/header/model/navbar-menu.model';
import { NotifyService } from './notify.service';
import { UserPanelComponent } from './user-panel.component';
import { ApplicationSummaryComponent } from '../core/application/application-summary.component';

/**
 * Intestazione Bootstrap Italia sul modello di GesFor/GERI: header slim CNR con link di supporto,
 * lingua e menu utente, brand dell'applicazione e barra di navigazione.
 * Le voci del menu e i relativi permessi arrivano da MenuService (controllo /v1/pcheck).
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe, ItHeaderComponent, ItNavBarModule,
    ItDropdownModule, ItIconComponent, ToastsComponent, ApplicationSummaryComponent, UserPanelComponent],
  templateUrl: './header.component.html',
  styles: `
    .brand-logo { height: 56px; width: auto; margin-right: .75rem; flex-shrink: 0; }
    :host ::ng-deep .it-header-center-wrapper.it-small-header .brand-logo { height: 36px; }
    @media (max-width: 991.98px) {
      .brand-logo { height: 36px; margin-right: .5rem; }
    }
  `,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild(ItHeaderComponent) private readonly header?: ItHeaderComponent;

  private readonly authService = inject(AuthService);
  private readonly menuService = inject(MenuService);
  private readonly apiMessageService = inject(ApiMessageService);
  private readonly translateService = inject(TranslateService);
  private readonly notify = inject(NotifyService);
  private readonly titleService = inject(Title);
  private readonly router = inject(Router);

  public user: User = null;
  public navbarMenu: NavbarMenu = null;
  public lang = 'it';
  public panelOpen = false;
  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.lang = localStorage.getItem('lang') || (this.translateService.getBrowserLang() === 'en' ? 'en' : 'it');
    this.language(this.lang);
    if (this.authService.isAuthenticated()) {
      this.user = this.authService.getUser();
    }
    this.subscriptions.add(this.authService.userActivated.subscribe((user: User) => {
      this.user = user;
      if (user) {
        this.notify.success(this.translateService.instant('layout.welcome', { value: user.firstName || user.userName }), ' ');
      }
      this.menuService.evaluateNavbar();
    }));
    this.subscriptions.add(this.menuService.navbarEvaluated.subscribe(navbarMenu => this.navbarMenu = navbarMenu));
    this.menuService.evaluateNavbar();
    this.subscriptions.add(this.apiMessageService.onApiMessage.subscribe((message: ApiMessage) => this.show(message)));
    this.subscriptions.add(this.translateService.onLangChange.subscribe((_: LangChangeEvent) =>
      this.titleService.setTitle(this.translateService.instant('home.title'))));
  }

  /** Le voci di primo livello con un percorso (es. Le mie domande). */
  get links() {
    return (this.navbarMenu?.menus || []).filter(menu => menu.path && menu.active && !this.isSupport(menu.path));
  }

  /** I menu con sottovoci (Nuovo bando, Amministrazione): visibili se almeno una voce è permessa. */
  get dropdowns() {
    return (this.navbarMenu?.menus || []).filter(menu => menu.items && menu.items.some(item => item.active));
  }

  /** HelpDesk, FAQ e Contatti stanno nell'header slim, come i link secondari di GesFor. */
  get support() {
    return (this.navbarMenu?.menus || []).filter(menu => menu.path && this.isSupport(menu.path));
  }

  private isSupport(path: string): boolean {
    return path.startsWith('/configurazione/');
  }

  language(lang: string): void {
    this.lang = lang === 'en' ? 'en' : 'it';
    localStorage.setItem('lang', this.lang);
    this.translateService.use(this.lang).subscribe();
  }

  /** Su mobile chiude il menu dopo la scelta di una voce. */
  closeMenu(): void {
    if (window.matchMedia('(max-width: 991.98px)').matches) {
      this.header?.toggleCollapse();
    }
  }

  logout(): void {
    this.authService.logout();
    this.notify.success(this.translateService.instant('layout.logout_done'), ' ');
    this.router.navigateByUrl('/');
  }

  private show(message: ApiMessage): void {
    const text = this.translateService.instant(message.message || '');
    switch (message.type) {
      case MessageType.SUCCESS: this.notify.success(text); break;
      case MessageType.ERROR: this.notify.error(text); break;
      case MessageType.WARNING: this.notify.warning(text); break;
      default: this.notify.info(text);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
