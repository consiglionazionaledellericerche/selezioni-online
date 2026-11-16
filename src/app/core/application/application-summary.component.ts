import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApplicationService } from './application.service';
import { ApplicationState } from './application-state.model';
import { AuthService } from '../../auth/auth.service';

/**
 * Riepilogo delle candidature raggruppate per stato (ex barra laterale della vecchia interfaccia).
 * scope "mine" usa /application/state (domande dell'utente), "all" usa /application/all-state.
 * layout "tiles": riquadri cliccabili sopra gli elenchi; "list": elenco compatto (menu utente).
 */
@Component({
  selector: 'app-application-summary',
  standalone: true,
  host: { '[style.display]': "layout === 'list' ? 'contents' : null" },
  imports: [NgClass, RouterLink, TranslatePipe],
  template: `
    @if (states.length) {
      @if (layout === 'tiles') {
        <div class="row g-3 mb-2" role="list">
          @for (state of states; track $index) {
            <div class="col-6 col-md-3" role="listitem">
              <button type="button" class="summary-tile card shadow-sm rounded h-100 w-100 text-start"
                 [ngClass]="'summary-tile--' + kind(state)" [class.summary-tile--selected]="active === state.getFilterStato()"
                 [attr.aria-pressed]="active === state.getFilterStato()" (click)="selected.emit(state.getFilterStato())">
                <span class="summary-count">{{ state.count }}</span>
                <span class="summary-label">{{ state.getLabel() | translate }}</span>
              </button>
            </div>
          }
        </div>
      } @else {
        <li class="px-3 pt-2 pb-1 small fw-semibold text-uppercase text-secondary">{{ title | translate }}</li>
        @for (state of states; track $index) {
          <li>
            <a class="dropdown-item list-item d-flex justify-content-between align-items-center" [routerLink]="[route]"
               [queryParams]="{ applicationStatus: state.getFilterStato() }">
              <span>{{ state.getLabel() | translate }}</span>
              <span class="badge rounded-pill ms-3" [ngClass]="badgeClass(state)">{{ state.count }}</span>
            </a>
          </li>
        }
      }
    }
  `,
  styles: [`
    .badge { color: #fff !important; min-width: 2rem; }
    .badge.text-dark { color: #1a1a1a !important; }
    .summary-tile--selected { background: #f0f6fc; outline: 2px solid #0066cc; }
    .summary-tile { border: 0; display: flex; flex-direction: column; padding: 1rem 1.25rem; border-left: 4px solid #0066cc; color: #17324d; }
    .summary-tile::after { display: none; }
    .summary-tile:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.12) !important; }
    .summary-tile--draft { border-left-color: #cc7a00; }
    .summary-tile--active { border-left-color: #008758; }
    .summary-tile--excluded { border-left-color: #d9364f; }
    .summary-count { font-size: 1.75rem; font-weight: 700; line-height: 1.1; }
    .summary-label { font-size: .875rem; color: #5d7083; }
  `],
})
export class ApplicationSummaryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() scope: 'mine' | 'all' = 'mine';
  @Input() layout: 'tiles' | 'list' = 'tiles';
  /** Filtro attualmente selezionato (riquadro evidenziato). */
  @Input() active: string;
  /** Riquadri: filtro scelto (valore di applicationStatus). */
  @Output() selected = new EventEmitter<string>();
  /**
   * Filtri correnti della pagina (escluso applicationStatus). Se almeno uno è valorizzato, i contatori
   * vengono calcolati con la stessa ricerca dell'elenco (service), uno per stato, leggendo solo il totale.
   */
  @Input() filters: { [key: string]: any };
  @Input() service: { getPageable: (page: number, filter: {}) => Observable<any> };

  private readonly applicationService = inject(ApplicationService);
  private readonly authService = inject(AuthService);
  public states: ApplicationState[] = [];
  private subscription = new Subscription();
  private filteredRequest: Subscription;
  private filterTimer: any;

  get route(): string {
    return this.scope === 'mine' ? '/my-applications' : '/applications-user';
  }

  get title(): string {
    return this.scope === 'mine' ? 'layout.summary_mine' : 'layout.summary_all';
  }

  ngOnInit(): void {
    this.subscription.add(this.applicationService.applicationChanged.subscribe(() => this.load()));
  }

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    const user = this.authService.isAuthenticated() ? this.authService.getUser() : null;
    if (!user) {
      this.states = [];
      return;
    }
    if (this.service && this.hasFilters()) {
      this.loadFiltered();
      return;
    }
    const request = this.scope === 'mine'
      ? this.applicationService.applicationState(user.userName)
      : this.applicationService.allApplicationState();
    request.subscribe(states => this.states = this.merge(states), () => this.states = []);
  }

  private hasFilters(): boolean {
    return Object.keys(this.filters || {})
      .filter(key => !['applicationStatus', 'fetchCall', 'filterType', 'type'].includes(key))
      .some(key => {
        const value = this.filters[key];
        return value !== null && value !== undefined && value !== '' && value !== false;
      });
  }

  /** Contatori per stato con i filtri della pagina (provvisorie, attive, escluse). */
  private loadFiltered(): void {
    clearTimeout(this.filterTimer);
    this.filterTimer = setTimeout(() => this.runFiltered(), 500);
  }

  private runFiltered(): void {
    const kinds: { status: string, stato: string, esclusione?: string }[] = [
      { status: 'P', stato: 'P' },
      { status: 'active', stato: 'C' },
      { status: 'excluded', stato: 'C', esclusione: 'E' }
    ];
    const base = { ...this.filters };
    if ('fetchCall' in base) {
      base['fetchCall'] = false;  // per i contatori basta il totale
    }
    this.filteredRequest?.unsubscribe();
    this.filteredRequest = forkJoin(kinds.map(kind =>
      this.service.getPageable(0, { ...base, applicationStatus: kind.status }).pipe(
        map((page: any) => page ? page.count : 0),
        catchError(() => of(0))
      ))
    ).subscribe(counts => {
      this.states = kinds.map((kind, i) => Object.assign(new ApplicationState(), {
        stato_domanda: kind.stato,
        esclusione_rinuncia: kind.esclusione,
        count: counts[i]
      })).filter(state => state.count > 0);
    });
  }

  /** Unisce gli stati con la stessa etichetta (es. diversi tipi di esclusione) sommandone i conteggi. */
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

  kind(state: ApplicationState): string {
    return state.isProvvisoria() ? 'draft' : state.isEsclusa() ? 'excluded' : 'active';
  }

  badgeClass(state: ApplicationState): string {
    return state.isProvvisoria() ? 'bg-warning text-dark' : state.isEsclusa() ? 'bg-danger' : 'bg-success';
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
