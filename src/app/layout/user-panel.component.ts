import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription, catchError, of } from 'rxjs';
import { User } from '../auth/model/user.model';
import { ApplicationService } from '../core/application/application.service';
import { ApplicationState } from '../core/application/application-state.model';
import { NavbarMenu } from '../core/header/model/navbar-menu.model';
import { ManageCallService } from '../core/call/manage-call.service';
import { AccordionComponent, AccordionGroupComponent } from '../shared/ui/accordion.component';

/**
 * Pannello laterale dell'utente (offcanvas Bootstrap Italia): dati dell'utente, impostazioni e uscita,
 * riepilogo delle candidature (proprie e, per chi gestisce i bandi, di tutti i candidati)
 * e menu di gestione (Configura nuovo bando, Amministrazione).
 */
@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, AccordionComponent, AccordionGroupComponent],
  template: `
    @if (open) {
      <div class="offcanvas-backdrop fade show" (click)="close.emit()"></div>
    }
    <aside class="offcanvas offcanvas-start user-panel" [class.show]="open" tabindex="-1" role="dialog"
           aria-modal="true" [attr.aria-hidden]="!open" [attr.aria-label]="'layout.user_panel' | translate">
      @if (user) {
        <div class="offcanvas-header border-bottom">
          <button type="button" class="btn btn-link p-0 me-3" (click)="close.emit()" [attr.aria-label]="'layout.close' | translate">
            <svg class="icon icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close-big"></use></svg>
          </button>
          <h2 class="h4 mb-0 flex-grow-1 text-truncate">{{ user.firstName }} {{ user.lastName }}</h2>
          <span class="avatar size-lg bg-primary text-white fw-semibold ms-2" aria-hidden="true">{{ initials() }}</span>
        </div>
        <div class="offcanvas-body p-0">
          <div class="px-4 py-3 border-bottom small">
            <div><span class="text-secondary">{{ 'layout.username' | translate }}:&nbsp;</span><strong>{{ user.userName }}</strong></div>
            @if (user.email) {
              <div class="text-truncate"><span class="text-secondary">{{ 'layout.email' | translate }}:&nbsp;</span>{{ user.email }}</div>
            }
            <ul class="list-unstyled mb-0 mt-2 account-links">
              <li>
                <a class="state-link" routerLink="/create-account" (click)="close.emit()">
                  <span class="d-flex align-items-center">
                    <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-settings"></use></svg>
                    {{ 'layout.settings' | translate }}
                  </span>
                </a>
              </li>
              <li>
                <a class="state-link" routerLink="/notifications" (click)="close.emit()">
                  <span class="d-flex align-items-center">
                    <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-horn"></use></svg>
                    {{ 'push.menu' | translate }}
                  </span>
                </a>
              </li>
              <li>
                <a class="state-link text-danger" href="javascript:void(0)" (click)="logout.emit()">
                  <span class="d-flex align-items-center">
                    <svg class="icon icon-sm icon-danger me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-logout"></use></svg>
                    {{ 'layout.logout' | translate }}
                  </span>
                </a>
              </li>
            </ul>
          </div>

          @if (mine?.length) {
            <section class="px-4 py-3 border-bottom">
              <h3 class="panel-title">{{ 'layout.my_applications' | translate }}</h3>
              <ul class="list-unstyled mb-0">
                @for (state of mine; track $index) {
                  <li>
                    <a class="state-link" [routerLink]="['/my-applications']" [queryParams]="{ applicationStatus: state.getFilterStato() }" (click)="close.emit()">
                      <span>{{ state.getLabel() | translate }}</span>
                      <span class="badge rounded-pill" [ngClass]="badge(state)">{{ state.count }}</span>
                    </a>
                  </li>
                }
              </ul>
            </section>
          }

          @if (canSeeAll) {
            <section class="px-4 py-3 border-bottom">
              <h3 class="panel-title">{{ 'layout.all_applications' | translate }}</h3>
              @if (loadingAll) {
                <div class="panel-loading"><div class="progress-spinner progress-spinner-active progress-spinner-sm"></div>{{ 'layout.loading' | translate }}</div>
              }
              <ul class="list-unstyled mb-0">
                @for (state of all; track $index) {
                  <li>
                    <a class="state-link" [routerLink]="['/applications-user']" [queryParams]="{ applicationStatus: state.getFilterStato() }" (click)="close.emit()">
                      <span>{{ state.getLabel() | translate }}</span>
                      <span class="badge rounded-pill" [ngClass]="badge(state)">{{ state.count }}</span>
                    </a>
                  </li>
                }
              </ul>
            </section>
          }

          <section class="px-4 py-3 border-bottom">
            <h3 class="panel-title">{{ 'overview.panel_title' | translate }}</h3>
            @if (loadingCommunications) {
              <div class="panel-loading"><div class="progress-spinner progress-spinner-active progress-spinner-sm"></div>{{ 'layout.loading' | translate }}</div>
            }
            <ul class="list-unstyled mb-0">
              @for (k of communicationKinds; track k.kind) {
                <li>
                  <a class="state-link" [routerLink]="['/communications']" [queryParams]="{ kind: k.kind }" (click)="close.emit()">
                    <span class="d-flex align-items-center">
                      <svg class="icon icon-sm icon-primary me-2"><use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + k.icon"></use></svg>
                      {{ 'communications.kind.' + k.kind | translate }}
                    </span>
                    @if (!loadingCommunications && communicationCounts[k.kind] !== undefined) {
                      <span class="badge rounded-pill bg-primary">{{ communicationCounts[k.kind] }}</span>
                    }
                  </a>
                </li>
              }
            </ul>
          </section>

          @if (menus.length) {
            <app-accordion [closeOthers]="true" class="d-block">
              @for (menu of menus; track menu.name) {
                <app-accordion-group>
                  <span accordion-heading class="fw-semibold text-primary">{{ menu.name | translate }}</span>
                  <ul class="list-unstyled mb-0">
                    @for (item of menu.items; track item.name) {
                      @if (item.active) {
                        <li>
                          <a class="state-link" [routerLink]="[item.path]" [queryParams]="item.queryParams" (click)="close.emit()">
                            <span>{{ item.name | translate }}</span>
                          </a>
                        </li>
                      }
                    }
                  </ul>
                </app-accordion-group>
              }
            </app-accordion>
          }
        </div>
      }
    </aside>
  `,
  styles: [`
    .user-panel { width: min(420px, 92vw); visibility: hidden; transition: transform .3s ease, visibility .3s; }
    .user-panel.show { visibility: visible; transform: none; }
    .offcanvas-backdrop { z-index: 1044; }
    .user-panel { z-index: 1045; }
    .avatar { display: inline-flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; border-radius: 50%; }
    .panel-title { font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #5d7083; margin-bottom: .5rem; }
    .state-link { display: flex; justify-content: space-between; align-items: center; padding: .4rem .25rem; text-decoration: none; color: #17324d; border-radius: 4px; }
    .state-link:hover { background: #f0f6fc; }
    .state-link.text-danger { color: #d9364f; }
    .panel-loading { display: flex; align-items: center; gap: .5rem; font-size: .875rem; color: #5d7083; padding: .25rem; }
  `],
})
export class UserPanelComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() user: User;
  @Input() navbarMenu: NavbarMenu;
  @Output() close = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  private readonly applicationService = inject(ApplicationService);
  public mine: ApplicationState[];
  public communicationKinds = [
    { kind: 'convocazioni', icon: 'it-calendar' },
    { kind: 'esclusioni', icon: 'it-ban' },
    { kind: 'comunicazioni', icon: 'it-mail' }
  ];
  public communicationCounts: { [kind: string]: number } = {};
  public canSeeAll = false;
  public loadingAll = false;
  public loadingCommunications = false;
  private requests = new Subscription();
  private readonly manageCallService = inject(ManageCallService);
  public all: ApplicationState[];

  get menus() {
    return (this.navbarMenu?.menus || []).filter(menu => menu.items && menu.items.some(item => item.active));
  }

  ngOnChanges(changes: SimpleChanges): void {
    // cambio di utenza: si annullano le richieste in corso e si azzerano i dati del precedente
    if (changes['user'] && (changes['user'].previousValue?.userName !== changes['user'].currentValue?.userName)) {
      this.reset();
    }
    if (this.open && this.user && (changes['open'] || changes['user'])) {
      this.load();
    }
  }

  private reset(): void {
    this.requests.unsubscribe();
    this.requests = new Subscription();
    this.mine = undefined;
    this.all = undefined;
    this.communicationCounts = {};
    this.loadingAll = false;
    this.loadingCommunications = false;
  }

  private load(): void {
    this.requests.unsubscribe();
    this.requests = new Subscription();
    const userName = this.user.userName;
    this.requests.add(this.applicationService.applicationState(userName).pipe(catchError(() => of([])))
      .subscribe(states => this.mine = this.merge(states)));
    this.canSeeAll = ManageCallService.isConcorsi(this.user) ||
      (this.user.groups || []).some(g => (g.itemName || '').toUpperCase().indexOf('RDP') !== -1);
    if (this.canSeeAll) {
      this.loadingAll = true;
      this.requests.add(this.applicationService.allApplicationState().pipe(catchError(() => of([])))
        .subscribe(states => {
          this.all = this.merge(states);
          this.loadingAll = false;
        }));
    }
    this.loadingCommunications = true;
    this.requests.add(this.manageCallService.communicationsCount().subscribe(counts => {
      this.communicationCounts = counts || {};
      this.loadingCommunications = false;
    }, () => this.loadingCommunications = false));
  }

  /** Unisce gli stati con la stessa etichetta (es. diversi tipi di esclusione), sommandone i conteggi. */
  private merge(states: ApplicationState[]): ApplicationState[] {
    const byLabel = new Map<string, ApplicationState>();
    (states || []).filter(state => state.count > 0).forEach(state => {
      const key = state.getLabel();
      const existing = byLabel.get(key);
      if (existing) {
        existing.count += state.count;
      } else {
        byLabel.set(key, Object.assign(new ApplicationState(), state));
      }
    });
    return Array.from(byLabel.values());
  }

  initials(): string {
    return ((this.user?.firstName || '').charAt(0) + (this.user?.lastName || '').charAt(0)).toUpperCase() || 'U';
  }

  badge(state: ApplicationState): string {
    return state.isEsclusa() ? 'bg-danger' : state.isProvvisoria() ? 'bg-warning text-dark' : 'bg-success';
  }

  ngOnDestroy(): void {
    this.requests.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.close.emit();
    }
  }
}
