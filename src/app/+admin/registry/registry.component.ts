import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Helpers } from '../../common/helpers/helpers';
import { AdminService, RegistryCall, RegistryPage, RegistryPerson } from '../admin.service';

type RegistryTab = 'commissioners' | 'rdp';

interface PersonDetail {
  loading: boolean;
  error?: boolean;
  calls: RegistryCall[];
}

/** Stato della ricerca paginata di una scheda. */
interface TabState {
  items: RegistryPerson[];
  index: { [key: string]: RegistryPerson };
  nextSkip: number;
  hasMore: boolean;
  loading: boolean;
  failed: boolean;
  total?: number;
  /** Richiesta in corso: le risposte di ricerche superate si scartano. */
  request: number;
}

/**
 * Commissari e responsabili del procedimento (RdP), riservata ad amministratori e gruppo CONCORSI.
 * Le persone arrivano dal server a pagine di 10, con i dati dell'utenza, e la pagina successiva si carica
 * scorrendo fino in fondo (scroll infinito). Aprendo una riga si caricano i bandi della persona.
 */
@Component({
  standalone: false,
  selector: 'app-admin-registry',
  template: `
    <p class="small text-muted" translate>admin.registry.info</p>
    <ul class="nav nav-tabs auto mb-3" role="tablist">
      <li class="nav-item" *ngFor="let t of tabs">
        <button type="button" class="nav-link" role="tab" [class.active]="tab === t" [attr.aria-selected]="tab === t" (click)="select(t)">
          {{ 'admin.registry.tab.' + t | translate }}
        </button>
      </li>
    </ul>

    <div class="d-flex flex-wrap align-items-center gap-3 mb-3">
      <div class="search">
        <input type="search" class="form-control form-control-sm"
               [placeholder]="'admin.registry.filter_' + tab | translate" [attr.aria-label]="'admin.registry.filter_' + tab | translate"
               [ngModel]="filters[tab]" (ngModelChange)="onFilter($event)">
      </div>
      <span class="small text-secondary" *ngIf="state.items.length || !state.loading">
        {{ 'admin.registry.loaded' | translate:{ value: state.items.length } }}
        <ng-container *ngIf="tab === 'commissioners' && state.total >= 0"> · {{ 'admin.registry.assignments' | translate:{ value: state.total } }}</ng-container>
        <ng-container *ngIf="tab === 'rdp' && state.total >= 0"> · {{ 'admin.registry.found' | translate:{ value: state.total } }}</ng-container>
      </span>
    </div>

    <div *ngIf="state.failed" class="alert alert-danger">{{ 'admin.error.generic' | translate }}</div>
    <div *ngIf="!state.loading && !state.failed && !state.items.length" class="alert alert-light">{{ 'admin.registry.empty' | translate }}</div>

    <div class="accordion registry" *ngIf="state.items.length">
      <div class="accordion-item" *ngFor="let person of state.items; trackBy: trackKey">
        <h3 class="accordion-header">
          <button type="button" class="accordion-button" [class.collapsed]="!open[person.key]"
                  [attr.aria-expanded]="!!open[person.key]" (click)="toggle(person)">
            <span class="person d-flex align-items-center w-100 gap-3">
            <span class="d-flex flex-wrap align-items-baseline gap-2 flex-grow-1 min-w-0">
              <span class="fw-semibold">{{ fullName(person) }}</span>
              <span *ngIf="person.username" class="small text-secondary font-monospace">{{ person.username }}</span>
              <span *ngIf="!person.username" class="badge badge-outline-secondary small">{{ 'admin.registry.external' | translate }}</span>
              <span *ngIf="person.account?.notFound" class="badge badge-outline-danger small">{{ 'admin.registry.account_missing' | translate }}</span>
              <span *ngIf="person.account?.disabilitata" class="badge badge-outline-danger small">{{ 'admin.registry.account_disabled' | translate }}</span>
              <span *ngIf="person.qualifica" class="small text-secondary">{{ person.qualifica }}</span>
            </span>
            <!-- conteggio in una colonna fissa a destra, allineato su tutte le righe -->
            <span class="count flex-shrink-0 text-end small text-secondary me-2">{{ countLabel(person) }}</span>
            </span>
          </button>
        </h3>
        <div class="accordion-collapse collapse" [class.show]="open[person.key]">
          <div class="accordion-body pt-0" *ngIf="open[person.key]">
            <!-- utenza -->
            <dl class="account row small mb-3" *ngIf="person.account && !person.account.notFound">
              <ng-container *ngFor="let field of accountFields">
                <ng-container *ngIf="accountValue(person, field) as value">
                  <dt class="col-sm-3 col-lg-2 text-secondary fw-normal">{{ 'admin.registry.account.' + field | translate }}</dt>
                  <dd class="col-sm-9 col-lg-4">
                    <a *ngIf="field === 'email' || field === 'emailEsterna'; else plain" [href]="'mailto:' + value">{{ value }}</a>
                    <ng-template #plain>{{ value }}</ng-template>
                  </dd>
                </ng-container>
              </ng-container>
            </dl>
            <p *ngIf="(!person.account || person.account.notFound) && person.email" class="small mb-3">
              <svg class="icon icon-xs icon-secondary me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-mail"></use></svg>
              <a [href]="'mailto:' + person.email">{{ person.email }}</a>
            </p>
            <!-- bandi -->
            <ng-container *ngIf="details[tab][person.key] as detail">
              <div *ngIf="detail.loading" class="d-flex align-items-center gap-2 small text-secondary">
                <div class="progress-spinner progress-spinner-active progress-spinner-sm"></div>{{ 'layout.loading' | translate }}
              </div>
              <div *ngIf="detail.error" class="alert alert-danger small mb-0">{{ 'admin.error.generic' | translate }}</div>
              <div *ngIf="!detail.loading && !detail.error && !detail.calls.length" class="small text-secondary">
                {{ 'admin.registry.no_calls' | translate }}
              </div>
              <div class="table-responsive" *ngIf="!detail.loading && detail.calls.length">
                <table class="table table-sm table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">{{ 'admin.registry.call' | translate }}</th>
                      <th scope="col">{{ 'admin.registry.description' | translate }}</th>
                      <th scope="col">{{ 'admin.registry.structure' | translate }}</th>
                      <th scope="col" class="text-nowrap">{{ 'admin.registry.deadline' | translate }}</th>
                      <th scope="col" *ngIf="tab === 'commissioners'">{{ 'admin.registry.role' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let call of detail.calls">
                      <td class="text-nowrap">
                        <a [routerLink]="['/call-detail']" [queryParams]="{ callCode: call.codice }">{{ call.codice }}</a>
                      </td>
                      <td class="small">
                        <span class="clamp" [title]="text(call.profilo || call.descrizione)">{{ text(call.profilo || call.descrizione) }}</span>
                      </td>
                      <td class="small">{{ text(call.struttura || call.sede) }}</td>
                      <td class="small text-nowrap">{{ call.dataFine | date:'dd/MM/yyyy' }}</td>
                      <td class="small text-nowrap" *ngIf="tab === 'commissioners'">
                        {{ call.ruolo ? ('call_manage.commission.ruoli.' + call.ruolo | translate) : '' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </div>

    <!-- scroll infinito: quando questo elemento entra nella finestra si carica la pagina successiva -->
    <div #sentinel class="sentinel" aria-hidden="true"></div>
    <div *ngIf="state.loading" class="d-flex justify-content-center align-items-center gap-2 small text-secondary py-3">
      <div class="progress-spinner progress-spinner-active progress-spinner-sm"></div>{{ 'layout.loading' | translate }}
    </div>
    <div *ngIf="!state.loading && state.hasMore && !state.failed" class="text-center mt-2">
      <button type="button" class="btn btn-outline-primary btn-sm" (click)="loadMore()">{{ 'admin.registry.more' | translate }}</button>
    </div>
  `,
  styles: [`
    .search { min-width: 300px; }
    .registry .accordion-button { padding-top: .75rem; padding-bottom: .75rem; }
    .registry .accordion-button .badge { font-size: .75rem; }
    .registry .person { min-width: 0; }
    .registry .min-w-0 { min-width: 0; }
    .registry .count { width: 7.5rem; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .account dt, .account dd { margin-bottom: .35rem; }
    .sentinel { height: 1px; }
    .clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class RegistryComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Persone per pagina. */
  public readonly PAGE = 10;
  public readonly tabs: RegistryTab[] = ['commissioners', 'rdp'];
  public readonly accountFields = ['cognome', 'nome', 'matricola', 'codiceFiscale', 'email', 'emailEsterna', 'telefono', 'tipo'];
  public tab: RegistryTab = 'commissioners';
  public filters: { [tab: string]: string } = { commissioners: '', rdp: '' };
  public states: { [tab: string]: TabState } = { commissioners: this.emptyState(), rdp: this.emptyState() };
  public open: { [key: string]: boolean } = {};
  public details: { [tab: string]: { [key: string]: PersonDetail } } = { commissioners: {}, rdp: {} };

  @ViewChild('sentinel') private sentinel: ElementRef<HTMLElement>;
  private observer: IntersectionObserver;
  private sentinelVisible = false;
  private filter$ = new Subject<{ tab: RegistryTab, value: string }>();
  private subscriptions = new Subscription();
  private textCache = new Map<string, string>();

  constructor(private adminService: AdminService, private translateService: TranslateService, private zone: NgZone) {}

  get state(): TabState {
    return this.states[this.tab];
  }

  ngOnInit(): void {
    this.subscriptions.add(this.filter$.pipe(
      debounceTime(400),
      distinctUntilChanged((a, b) => a.tab === b.tab && a.value === b.value)
    ).subscribe(({ tab }) => this.reset(tab)));
    this.loadMore();
  }

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined' || !this.sentinel) {
      return;
    }
    this.observer = new IntersectionObserver(entries => {
      this.sentinelVisible = entries.some(entry => entry.isIntersecting);
      if (this.sentinelVisible) {
        this.zone.run(() => this.loadMore());
      }
    }, { rootMargin: '300px' });
    this.observer.observe(this.sentinel.nativeElement);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  select(tab: RegistryTab): void {
    if (this.tab === tab) {
      return;
    }
    this.tab = tab;
    this.open = {};
    if (!this.state.items.length && this.state.hasMore) {
      this.loadMore();
    }
  }

  onFilter(value: string): void {
    this.filters[this.tab] = value;
    this.filter$.next({ tab: this.tab, value: (value || '').trim() });
  }

  /** Pagina successiva della scheda attiva (dallo scroll o dal pulsante). */
  loadMore(): void {
    const tab = this.tab;
    const state = this.states[tab];
    if (state.loading || !state.hasMore || state.failed) {
      return;
    }
    state.loading = true;
    const request = ++state.request;
    const filter = (this.filters[tab] || '').trim();
    const call = tab === 'commissioners' ?
      this.adminService.registryCommissioners(state.nextSkip, this.PAGE, filter) :
      this.adminService.registryRdp(state.nextSkip, this.PAGE, filter);
    call.subscribe((page: RegistryPage) => {
      if (request !== state.request) {
        return;
      }
      this.merge(state, page);
      state.loading = false;
      // se la sentinella è ancora visibile (pagina corta) si continua a caricare
      setTimeout(() => {
        if (this.sentinelVisible && this.tab === tab) {
          this.loadMore();
        }
      });
    }, () => {
      if (request === state.request) {
        state.loading = false;
        state.failed = true;
      }
    });
  }

  toggle(person: RegistryPerson): void {
    this.open[person.key] = !this.open[person.key];
    if (this.open[person.key] && !this.details[this.tab][person.key]) {
      this.loadCalls(this.tab, person);
    }
  }

  fullName(person: RegistryPerson): string {
    const cognome = person.cognome || person.account?.cognome;
    const nome = person.nome || person.account?.nome;
    const name = [cognome, nome].filter(value => !!value).join(' ').trim();
    return name ? name.toUpperCase() : person.username;
  }

  /** Valore di un campo dell'utenza da mostrare (null se assente). */
  accountValue(person: RegistryPerson, field: string): string {
    const account = person.account;
    if (!account) {
      return null;
    }
    if (field === 'tipo') {
      return this.translateService.instant('admin.registry.account.' + (account.ldap ? 'ldap' : 'local'));
    }
    const value = (account as any)[field];
    return value !== undefined && value !== null && value !== '' ? String(value) : null;
  }

  /** "3 incarichi" per i commissari, "5 bandi" per gli RdP (vuoto finché i bandi non sono caricati). */
  countLabel(person: RegistryPerson): string {
    const count = this.countOf(person);
    if (count === null) {
      return '';
    }
    const key = this.tab === 'commissioners' ? 'admin.registry.assignments_count' : 'admin.registry.calls_count';
    return this.translateService.instant(key + (count === 1 ? '_one' : '_other'), { value: count });
  }

  /** Numero di bandi: incarichi per i commissari, bandi caricati per gli RdP (null finché non si apre la riga). */
  countOf(person: RegistryPerson): number {
    if (this.tab === 'commissioners') {
      return person.incarichi ?? null;
    }
    const detail = this.details.rdp[person.key];
    return detail && !detail.loading && !detail.error ? detail.calls.length : null;
  }

  /**
   * Profilo, descrizione e struttura del bando possono contenere HTML (anche entità come &rsquo; o &nbsp;):
   * si mostra il solo testo. Il risultato è in cache per non ricalcolarlo a ogni controllo.
   */
  text(value: string): string {
    if (!value) {
      return '';
    }
    let result = this.textCache.get(value);
    if (result === undefined) {
      result = Helpers.stripHtml(value);
      this.textCache.set(value, result);
    }
    return result;
  }

  trackKey(_: number, person: RegistryPerson): string {
    return person.key;
  }

  /** Nuova ricerca: si riparte dalla prima pagina. */
  private reset(tab: RegistryTab): void {
    const request = this.states[tab].request + 1;
    this.states[tab] = { ...this.emptyState(), request };
    this.details[tab] = {};
    if (this.tab === tab) {
      this.open = {};
      this.loadMore();
    }
  }

  /** Accoda la pagina; una persona che prosegue dalla pagina precedente si unisce alla sua riga. */
  private merge(state: TabState, page: RegistryPage): void {
    (page.items || []).forEach(item => {
      const existing = state.index[item.key];
      if (existing) {
        existing.incarichi = (existing.incarichi || 0) + (item.incarichi || 0);
        existing.qualifica = existing.qualifica || item.qualifica;
        existing.email = existing.email || item.email;
        existing.account = existing.account || item.account;
      } else {
        state.index[item.key] = item;
        state.items.push(item);
      }
    });
    state.nextSkip = page.nextSkip;
    state.hasMore = !!page.hasMore;
    state.total = page.total;
  }

  private loadCalls(tab: RegistryTab, person: RegistryPerson): void {
    const detail: PersonDetail = { loading: true, calls: [] };
    this.details[tab][person.key] = detail;
    const done = (calls: RegistryCall[]) => {
      detail.calls = calls || [];
      detail.loading = false;
    };
    const failed = () => {
      detail.loading = false;
      detail.error = true;
    };
    if (tab === 'commissioners') {
      this.adminService.registryCommissionerCalls(person).subscribe(done, failed);
    } else {
      this.adminService.registryRdpCalls(person.username).subscribe(result => done(result.calls), failed);
    }
  }

  private emptyState(): TabState {
    return { items: [], index: {}, nextSkip: 0, hasMore: true, loading: false, failed: false, request: 0 };
  }
}
