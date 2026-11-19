import { forkJoin } from 'rxjs';
import { CacheService } from '../core/cache.service';
import { ObjectType } from '../common/model/object-type.model';
import { ManageCallService } from '../core/call/manage-call.service';
import { ItMegamenuComponent } from 'design-angular-kit';
import { ToastsComponent } from './toasts.component';
import { Component, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
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
import { PushNotificationsService } from '../core/push/push-notifications.service';
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
    ItDropdownModule, ItIconComponent, ToastsComponent, ItMegamenuComponent, ApplicationSummaryComponent, UserPanelComponent],
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
  private readonly manageCallService = inject(ManageCallService);
  private readonly cacheService = inject(CacheService);
  private readonly pushNotificationsService = inject(PushNotificationsService);

  public user: User = null;
  public navbarMenu: NavbarMenu = null;
  public lang = 'it';
  public panelOpen = false;

  /** Iniziali di nome e cognome, mostrate su smartphone nel pulsante dell'utente. */
  initials(): string {
    return ((this.user?.firstName || '').charAt(0) + (this.user?.lastName || '').charAt(0)).toUpperCase() || 'U';
  }
  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.lang = localStorage.getItem('lang') || (this.translateService.getBrowserLang() === 'en' ? 'en' : 'it');
    this.language(this.lang);
    if (this.authService.isAuthenticated()) {
      this.user = this.authService.getUser();
    }
    this.loadMegaMenus();
    this.subscriptions.add(this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.openMega = null;
      }
    }));
    this.subscriptions.add(this.authService.userActivated.subscribe((user: User) => {
      this.user = user;
      this.loadMegaMenus();
      if (user) {
        const welcome = user.sesso === 'F' ? 'layout.welcome_F' : 'layout.welcome';
        this.notify.success(this.translateService.instant(welcome, { value: user.firstName || user.userName }), ' ');
      }
      this.menuService.evaluateNavbar();
    }));
    this.subscriptions.add(this.menuService.navbarEvaluated.subscribe(navbarMenu => this.navbarMenu = navbarMenu));
    this.menuService.evaluateNavbar();
    this.subscriptions.add(this.apiMessageService.onApiMessage.subscribe((message: ApiMessage) => this.show(message)));
    // PWA: nuova versione scaricata dal service worker, da attivare ricaricando la pagina
    this.subscriptions.add(this.pushNotificationsService.versionReady().subscribe(ready => {
      if (ready) {
        this.notify.info(this.translateService.instant('push.update_ready'), ' ');
      }
    }));
    this.subscriptions.add(this.translateService.onLangChange.subscribe((_: LangChangeEvent) =>
      this.titleService.setTitle(this.translateService.instant('home.title'))));
  }

  /** Le voci di primo livello con un percorso (es. Le mie domande). */
  get links() {
    return (this.navbarMenu?.menus || []).filter(menu => menu.path && menu.active && !this.isSupport(menu.path));
  }

  /**
   * I menu con sottovoci (Amministrazione): visibili se almeno una voce è permessa.
   * "Configura nuovo Bando" è nel MegaMenu "Gestore".
   */
  get dropdowns() {
    return (this.navbarMenu?.menus || []).filter(menu => menu.items && menu.items.some(item => item.active) && menu.name !== 'call.manage');
  }

  /**
   * "Nuovo bando" nel MegaMenu "Gestore": albero delle tipologie (cache jsonlistCallType) ridotto a quelle che
   * l'utente può creare (GET /v1/call/enable-types), come common.enableTypeCalls nel frontend legacy.
   */
  public newCallGroups: { label: string, items: { key: string, label: string }[] }[] = [];

  /** Etichetta di una tipologia di bando: traduzione, etichetta del backend o testo leggibile dalla chiave. */
  typeLabel(key: string, fallback?: string): string {
    if (!key) {
      return fallback || '';
    }
    const translated = this.translateService.instant(key);
    if (translated && translated !== key) {
      return translated;
    }
    return fallback && fallback !== key ? fallback : ObjectType.readable(key);
  }

  private buildNewCallGroups(tree: any[], enabled: string[]): void {
    const allowed = new Set(enabled || []);
    // etichetta di riserva (dal backend); la traduzione si applica in visualizzazione (typeLabel)
    const label = (item: any) => item.label || item.defaultLabel || '';
    const groups: { label: string, items: { key: string, label: string }[] }[] = [];
    const single: { key: string, label: string }[] = [];
    (tree || []).forEach(item => {
      if (item.childs && item.childs.length) {
        const children = item.childs.filter((child: any) => allowed.has(child.key)).map((child: any) => ({ key: child.key, label: label(child) }));
        if (allowed.has(item.key)) {
          children.unshift({ key: item.key, label: label(item) });
        }
        if (children.length) {
          groups.push({ key: item.key, label: label(item), items: children } as any);
        }
      } else if (allowed.has(item.key)) {
        single.push({ key: item.key, label: label(item) });
      }
    });
    this.newCallGroups = single.length ? [{ label: '', items: single }, ...groups] : groups;
  }

  /** HelpDesk, FAQ e Contatti stanno nell'header slim, come i link secondari di GesFor. */
  get support() {
    return (this.navbarMenu?.menus || []).filter(menu => menu.path && this.isSupport(menu.path));
  }

  /** FAQ e Contatti in alto; l'HelpDesk sta nel menu principale accanto a Home. */
  private isSupport(path: string): boolean {
    return path.startsWith('/configurazione/') && !path.includes('helpdesk');
  }

  /* ---- MegaMenu "Gestore" e "Commissioni" ---- */

  public managerCalls: any[] = [];
  public commissionCalls: any[] = [];
  public openMega: string = null;
  private megaRequests = new Subscription();

  private loadMegaMenus(): void {
    this.megaRequests.unsubscribe();
    this.megaRequests = new Subscription();
    this.managerCalls = [];
    this.commissionCalls = [];
    this.newCallGroups = [];
    this.openMega = null;
    if (!this.user) {
      return;
    }
    this.megaRequests.add(this.manageCallService.managerCalls().subscribe(calls => this.managerCalls = calls || []));
    this.megaRequests.add(this.manageCallService.commissionCalls().subscribe(calls => this.commissionCalls = calls || []));
    this.megaRequests.add(forkJoin([this.cacheService.cache(), this.manageCallService.enableTypes()])
      .subscribe(([cache, enabled]: [any, string[]]) => this.buildNewCallGroups(cache && cache.jsonlistCallType, enabled)));
  }

  /** Scadenza già passata (millisecondi). */
  isPast(time: number): boolean {
    return !!time && time < Date.now();
  }

  /** Bandi della commissione, senza la voce per la parità di genere (mostrata a parte). */
  get commissionOnlyCalls(): any[] {
    return this.commissionCalls.filter(call => call.id !== 'commission-gender');
  }

  get hasCommissionGender(): boolean {
    return this.commissionCalls.some(call => call.id === 'commission-gender');
  }

  /** Divide un elenco in colonne per il MegaMenu. */
  columns<T>(items: T[], count = 2): T[][] {
    const size = Math.ceil((items || []).length / count) || 1;
    return Array.from({ length: count }, (_, i) => (items || []).slice(i * size, (i + 1) * size)).filter(c => c.length);
  }

  toggleMega(name: string, event: Event): void {
    event.stopPropagation();
    this.openMega = this.openMega === name ? null : name;
  }

  closeMega(): void {
    this.openMega = null;
    this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.openMega && !(event.target as HTMLElement)?.closest('.megamenu')) {
      this.openMega = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.openMega = null;
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
