import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Call } from './call.model';
import { CallService } from './call.service';
import { ManageCallService } from './manage-call.service';

/**
 * Dettaglio pubblico di un bando (ex pagina call-detail di cool-jconon), raggiungibile senza autenticazione
 * con ?callCode=<codice> (stesso indirizzo della vecchia interfaccia) oppure ?callId=<id>.
 */
@Component({
  standalone: false,
  selector: 'call-detail-page',
  template: `
    <nav class="breadcrumb-container pt-3" aria-label="Percorso di navigazione">
      <ol class="breadcrumb p-0 mb-0">
        <li class="breadcrumb-item"><a routerLink="/">{{ 'layout.home' | translate }}</a><span class="separator">/</span></li>
        <li class="breadcrumb-item"><a routerLink="/">{{ 'layout.calls' | translate }}</a><span class="separator">/</span></li>
        <li class="breadcrumb-item active" aria-current="page">{{ call?.codice || code }}</li>
      </ol>
    </nav>

    <app-layout-wait [loaded]="loaded"></app-layout-wait>
    <div *ngIf="loaded && !call" class="alert alert-warning mt-4" role="alert">{{ 'layout.call_not_found' | translate:{value: code} }}</div>

    <ng-container *ngIf="call">
      <!-- intestazione -->
      <div class="row row-title pt-3 pb-2">
        <div class="border-bottom border-primary pb-3">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span class="badge rounded-pill call-type">{{ typeLabel() }}</span>
            <span class="badge rounded-pill" [ngClass]="statusClass()">{{ 'layout.status_' + status() | translate }}</span>
          </div>
          <h1 class="h2 text-primary mb-1">{{ call.codice }}</h1>
          <p *ngIf="call.profilo" class="lead mb-0">{{ call.profilo }}</p>
          <!-- bando figlio: il bando multiplo di cui fa parte -->
          <app-call-parent [call]="call"></app-call-parent>
        </div>
      </div>

      <div class="row mt-4 align-items-start">
        <!-- contenuti -->
        <div class="col-lg-8">
          <section class="card shadow-sm rounded mb-4 detail-card">
            <div class="card-body">
              <h2 class="h5 text-primary">{{ 'label.jconon_call.descrizione' | translate }}</h2>
              <div class="detail-html" [innerHtml]="text(call.descrizione, call.descrizione_en)"></div>
            </div>
          </section>

          <section class="card shadow-sm rounded mb-4 detail-card">
            <div class="card-body">
              <h2 class="h5 text-primary">{{ 'layout.call_info' | translate }}</h2>
              <dl class="row mb-0 detail-list">
                <ng-container *ngIf="call.profilo">
                  <dt class="col-sm-4">{{ 'label.jconon_call.profilo' | translate }}</dt><dd class="col-sm-8">{{ call.profilo }}</dd>
                </ng-container>
                <ng-container *ngIf="call.sede">
                  <dt class="col-sm-4">{{ 'label.jconon_call.sede' | translate }}</dt><dd class="col-sm-8">{{ text(call.sede, call.sede_en) }}</dd>
                </ng-container>
                <ng-container *ngIf="call.struttura_destinataria">
                  <dt class="col-sm-4">{{ 'label.jconon_call.struttura_destinataria' | translate }}</dt>
                  <dd class="col-sm-8">{{ text(call.struttura_destinataria, call.struttura_destinataria_en) }}</dd>
                </ng-container>
                <ng-container *ngIf="call.numero_posti">
                  <dt class="col-sm-4">{{ 'label.jconon_call.numero_posti' | translate }}</dt><dd class="col-sm-8">{{ call.numero_posti }}</dd>
                </ng-container>
                <ng-container *ngIf="call.numero_gu">
                  <dt class="col-sm-4">{{ 'layout.gazzetta' | translate }}</dt>
                  <dd class="col-sm-8">n. {{ call.numero_gu }}<span *ngIf="call.data_gu"> del {{ call.data_gu | date:'dd/MM/yyyy' }}</span></dd>
                </ng-container>
                <ng-container *ngIf="call.elenco_macroaree">
                  <dt class="col-sm-4">{{ 'call.elenco_macroaree' | translate }}</dt><dd class="col-sm-8">{{ call.elenco_macroaree }}</dd>
                </ng-container>
                <ng-container *ngIf="call.elenco_settori_tecnologici">
                  <dt class="col-sm-4">{{ 'call.elenco_settori_tecnologici' | translate }}</dt><dd class="col-sm-8">{{ call.elenco_settori_tecnologici }}</dd>
                </ng-container>
                <ng-container *ngIf="call.area_scientifica">
                  <dt class="col-sm-4">{{ 'label.jconon_call.area_scientifica' | translate }}</dt>
                  <dd class="col-sm-8">{{ text(call.area_scientifica, call.area_scientifica_en) }}</dd>
                </ng-container>
              </dl>
            </div>
          </section>

          <section *ngIf="call.requisiti || call.requisiti_en" class="card shadow-sm rounded mb-4 detail-card">
            <div class="card-body">
              <h2 class="h5 text-primary">{{ 'label.jconon_call.requisiti' | translate }}</h2>
              <div class="detail-html" [innerHtml]="text(call.requisiti, call.requisiti_en)"></div>
            </div>
          </section>

          <!-- bandi della selezione (macro-bando): visibili anche a chi non ha effettuato l'accesso -->
          <section *ngIf="children?.length" class="card shadow-sm rounded mb-4 detail-card">
            <div class="card-body">
              <h2 class="h5 text-primary">{{ 'call_manage.children.public_title' | translate }} ({{ children.length }})</h2>
              <ul class="list-unstyled mb-0 child-calls">
                <li *ngFor="let child of children" class="py-3">
                  <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <a class="fw-semibold" [routerLink]="['/call-detail']" [queryParams]="{ callId: child.objectId }">{{ child.codice }}</a>
                    <span class="badge rounded-pill" [ngClass]="isOpen(child) ? 'bg-success' : 'bg-secondary'">
                      {{ (isOpen(child) ? 'call.open' : 'call.closed') | translate }}</span>
                  </div>
                  <div *ngIf="child.profilo" class="small">{{ child.profilo }}</div>
                  <div *ngIf="child.sede || child.struttura_destinataria" class="small text-secondary">
                    {{ text(child.sede, child.sede_en) }}<ng-container *ngIf="child.sede && child.struttura_destinataria"> · </ng-container>{{ text(child.struttura_destinataria, child.struttura_destinataria_en) }}
                  </div>
                  <div *ngIf="child.data_fine_invio_domande" class="small text-secondary">
                    {{ 'layout.call_deadline' | translate }}: {{ child.data_fine_invio_domande | date:'dd/MM/yyyy HH:mm' }}
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <app-call-attachments [callId]="call.objectId"></app-call-attachments>
        </div>

        <!-- scadenza e azioni -->
        <aside class="col-lg-4">
          <div class="detail-sticky">
            <div class="card shadow-sm rounded mb-4 side-card">
              <div class="card-body">
                <div class="date-row">
                  <div class="date-block">
                    <div class="date-label">{{ 'layout.call_start' | translate }}</div>
                    <div class="date-stack">
                      <app-date-tile [date]="call.data_inizio_invio_domande" variant="success"></app-date-tile>
                      <div class="date-time">
                        <svg class="icon icon-sm" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-clock"></use></svg>
                        {{ call.data_inizio_invio_domande | date:'HH:mm' }}
                      </div>
                    </div>
                  </div>
                  <div class="date-block">
                    <div class="date-label">{{ (isExpired() && !extended() ? 'layout.call_deadline_expired' : 'layout.call_deadline') | translate }}</div>
                    <div class="date-stack">
                      <app-date-tile [date]="initialDeadline()" [variant]="status() === 'closed' ? 'secondary' : (status() === 'expiring' ? 'danger' : 'primary')"></app-date-tile>
                      <div class="date-time">
                        <svg class="icon icon-sm" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-clock"></use></svg>
                        {{ initialDeadline() | date:'HH:mm' }}
                      </div>
                    </div>
                  </div>
                </div>
                <div *ngIf="extended()" class="extended-deadline">
                  <app-date-tile [date]="call.data_fine_invio_domande" variant="warning"></app-date-tile>
                  <div>
                    <div class="fw-semibold">{{ 'call_manage.dates.extended_to' | translate }}</div>
                    <div class="small">{{ call.data_fine_invio_domande | date:'dd/MM/yyyy' }}
                      {{ 'layout.at_time' | translate }} {{ call.data_fine_invio_domande | date:'HH:mm' }}</div>
                  </div>
                </div>
                <p *ngIf="status() !== 'closed' && daysLeft() !== null" class="small mt-2 mb-3"
                   [ngClass]="status() === 'expiring' ? 'text-danger fw-semibold' : 'text-secondary'">
                  <svg class="icon icon-xs" [class.icon-danger]="status() === 'expiring'" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-clock"></use></svg>
                  {{ (daysLeft() === 0 ? 'layout.status_today' : 'layout.status_days_left') | translate:{value: daysLeft()} }}
                </p>
                <app-call-prorogations [callId]="call.objectId" class="mb-3"></app-call-prorogations>
                <app-call-actions [item]="call" mode="panel" (deleted)="router.navigate(['/'])"></app-call-actions>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </ng-container>
  `,
  styles: [`
    .call-type { background: var(--app-primary-light); color: var(--app-primary); font-weight: 600; }
    .detail-card::after, .side-card::after { display: none; }
    .detail-html { line-height: 1.6; }
    .detail-html ::ng-deep ol, .detail-html ::ng-deep ul { padding-left: 1.5rem; }
    .detail-list dt { font-weight: 600; color: #5d7083; }
    .date-row { display: flex; flex-wrap: wrap; gap: 1rem 2.5rem; margin-bottom: .75rem; }
    .date-stack { display: inline-flex; flex-direction: column; align-items: center; gap: .4rem; }
    .date-label { font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #5d7083; margin-bottom: .5rem; }
    .date-time { display: flex; align-items: center; gap: .3rem; font-size: .95rem; font-weight: 600; color: #17324d; white-space: nowrap; }
    .date-time .icon { fill: #5d7083; }
    .extended-deadline { display: flex; align-items: center; gap: 1rem; padding: .75rem; margin-top: .25rem;
      border-radius: 8px; background: #fff6e5; color: #5c3a00; }
    .detail-list dd { margin-bottom: .75rem; }
    .side-card { border-top: 4px solid var(--app-primary); }
    .child-calls li + li { border-top: 1px solid #e3e4e6; }
    @media (min-width: 992px) { .detail-sticky { position: sticky; top: 1.5rem; } }
  `]
})
export class CallDetailPageComponent implements OnInit {
  public static ROUTE = 'call-detail';

  public call: Call;
  /** Bandi figli del macro-bando, pubblicati (per chi non gestisce il bando). */
  public children: Call[];
  public code: string;
  public loaded = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private callService: CallService,
    private manageCallService: ManageCallService,
    public translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(
      switchMap(params => {
        this.loaded = false;
        this.call = undefined;
        this.code = params['callCode'];
        if (params['callId']) {
          return this.callService.getById(params['callId']);
        }
        if (!this.code) {
          return of(undefined);
        }
        return this.callService.getAll({ page: 0, offset: 20, filterType: 'all', callCode: this.code, type: 'jconon_call:folder' })
          .pipe(map(calls => (calls || []).find(c => c.codice === this.code) || (calls || [])[0]));
      })
    ).subscribe(call => {
      this.call = call;
      this.loaded = true;
      this.children = undefined;
      if (call && ManageCallService.isMacroCall(call)) {
        this.manageCallService.children(call.objectId).subscribe(children => this.children = (children || [])
          .sort((a, b) => String(a.codice).localeCompare(String(b.codice))), () => this.children = []);
      }
    }, () => this.loaded = true);
  }

  /** Bando aperto: pubblicato e dentro i termini di presentazione delle domande. */
  public isOpen(call: Call): boolean {
    const now = new Date();
    const start = call.data_inizio_invio_domande ? new Date(call.data_inizio_invio_domande as any) : null;
    const end = call.data_fine_invio_domande ? new Date(call.data_fine_invio_domande as any) : null;
    return (!start || start <= now) && (!end || end >= now);
  }

  /** Testo nella lingua corrente, con ripiego sull'italiano. */
  public text(it: string, en: string): string {
    return this.translateService.currentLang === 'en' && en ? en : it;
  }

  public typeLabel(): string {
    return this.translateService.instant(this.call.objectTypeId);
  }

  /** Il termine di presentazione delle domande è passato (diverso da "non ancora aperto"). */
  public isExpired(): boolean {
    return !!this.call?.data_fine_invio_domande && new Date() > new Date(this.call.data_fine_invio_domande);
  }

  public isActive(): boolean {
    const now = new Date();
    return now >= new Date(this.call.data_inizio_invio_domande) && now <= new Date(this.call.data_fine_invio_domande);
  }

  public daysLeft(): number {
    const end = this.call && this.call.data_fine_invio_domande ? new Date(this.call.data_fine_invio_domande as any).getTime() : NaN;
    return isNaN(end) ? null : Math.max(Math.floor((end - Date.now()) / 86400000), 0);
  }

  public status(): 'open' | 'expiring' | 'closed' {
    if (!this.isActive()) {
      return 'closed';
    }
    const days = this.daysLeft();
    return days !== null && days <= 7 ? 'expiring' : 'open';
  }

  public statusClass(): string {
    return { open: 'bg-success', expiring: 'bg-warning text-dark', closed: 'bg-secondary' }[this.status()];
  }

  public newApplication(): void {
    this.router.navigate(['/manage-application'], { queryParams: { callId: this.call.objectId } });
  }

  /** Scadenza originale del bando (data iniziale); se manca, quella effettiva. */
  initialDeadline(): Date {
    return this.call && ((this.call as any).data_fine_invio_domande_initial || this.call.data_fine_invio_domande);
  }

  /** Scadenza effettiva diversa da quella originale: il bando è stato prorogato o riaperto. */
  extended(): boolean {
    const initial = this.call && (this.call as any).data_fine_invio_domande_initial;
    const effective = this.call && this.call.data_fine_invio_domande;
    return !!initial && !!effective && new Date(initial).getTime() !== new Date(effective).getTime();
  }
}
