import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ManageCallService } from '../manage-call.service';
import { CallService } from '../call.service';
import { STATE_PROPERTY, CommunicationKind } from '../call-communications.service';

/**
 * Convocazioni, esclusioni e comunicazioni di tutti i bandi visibili all'utente:
 * per un candidato quelle ricevute, per chi gestisce i bandi quelle di sua competenza.
 */
@Component({
  selector: 'app-communications-overview',
  standalone: true,
  imports: [DatePipe, NgClass, RouterLink, TranslatePipe],
  template: `
    <div class="row row-title pt-3 pb-2">
      <div class="border-bottom border-primary pb-2 pb-lg-3 mt-lg-4">
        <h1 class="h2 text-primary mb-1">{{ 'overview.title' | translate }}</h1>
        <p class="mb-0 text-secondary">{{ 'overview.subtitle' | translate }}</p>
      </div>
    </div>
    <ul class="nav nav-tabs mt-3" role="tablist">
      @for (k of kinds; track k) {
        <li class="nav-item">
          <a class="nav-link d-flex align-items-center gap-2" href="javascript:void(0)" role="tab" [class.active]="k === kind"
             [attr.aria-selected]="k === kind" (click)="select(k)">
            {{ 'communications.kind.' + k | translate }}
            @if (counts[k] !== undefined) { <span class="badge rounded-pill bg-primary">{{ counts[k] }}</span> }
          </a>
        </li>
      }
    </ul>
    @if (items === undefined) {
      <div class="d-flex justify-content-center my-5"><div class="progress-spinner progress-spinner-active"></div></div>
    } @else if (items.length === 0) {
      <div class="alert alert-info mt-4">{{ 'no_item' | translate }}</div>
    } @else {
      <p class="small text-secondary mt-3">{{ items.length }} {{ 'layout.list_of' | translate }} {{ count }} {{ 'layout.list_items' | translate }}</p>
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th>{{ 'communications.document' | translate }}</th>
              <th>{{ 'overview.candidate' | translate }}</th>
              <th>{{ 'layout.call' | translate }}</th>
              <th>{{ 'communications.state' | translate }}</th>
              <th>{{ 'communications.modified' | translate }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (d of items; track d['cmis:objectId']) {
              <tr>
                <td class="small">{{ d['cmis:name'] }}</td>
                <td class="small">{{ d['application:cognome'] }} {{ d['application:nome'] }}</td>
                <td class="small text-nowrap">
                  @if (d['call:codice']) {
                    <a [routerLink]="['/call-detail']" [queryParams]="{ callCode: d['call:codice'] }">{{ d['call:codice'] }}</a>
                  }
                </td>
                <td><span class="badge rounded-pill" [ngClass]="stateClass(state(d))">{{ stateLabel(state(d)) }}</span></td>
                <td class="small text-nowrap">{{ d['cmis:lastModificationDate'] | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="text-end">
                  <button type="button" class="btn btn-link btn-sm p-1" (click)="download(d)" [attr.aria-label]="'communications.download' | translate">
                    <svg class="icon icon-sm icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-download"></use></svg>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (items.length < count) {
        <div class="text-center my-4">
          <button type="button" class="btn btn-outline-primary btn-sm" [disabled]="loading" (click)="more()">{{ 'layout.load_more' | translate }}</button>
        </div>
      }
    }
  `,
})
export class CommunicationsOverviewComponent implements OnInit {
  public kinds: CommunicationKind[] = ['convocazioni', 'esclusioni', 'comunicazioni'];
  public kind: CommunicationKind = 'convocazioni';
  public counts: { [kind: string]: number } = {};
  public items: any[];
  public count = 0;
  public loading = false;
  private page = 0;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly manageCallService = inject(ManageCallService);
  private readonly callService = inject(CallService);
  private readonly translate = inject(TranslateService);

  ngOnInit(): void {
    this.manageCallService.communicationsCount().subscribe(counts => this.counts = counts || {});
    this.route.queryParams.subscribe(params => {
      this.kind = this.kinds.includes(params['kind']) ? params['kind'] : 'convocazioni';
      this.load(true);
    });
  }

  select(kind: CommunicationKind): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { kind }, replaceUrl: true });
  }

  load(reset: boolean): void {
    if (reset) {
      this.page = 0;
      this.items = undefined;
    }
    this.loading = true;
    this.manageCallService.communications(this.kind, this.page).subscribe(result => {
      this.items = [...(reset ? [] : this.items || []), ...(result.items || [])];
      this.count = result.count || this.items.length;
      this.loading = false;
    }, () => {
      this.items = this.items || [];
      this.loading = false;
    });
  }

  more(): void {
    this.page++;
    this.load(false);
  }

  state(d: any): string {
    return d[STATE_PROPERTY[this.kind]] || '';
  }

  stateLabel(state: string): string {
    if (!state) {
      return '';
    }
    const key = 'communications.state_one.' + state;
    const label = this.translate.instant(key);
    return label !== key ? label : state.charAt(0) + state.slice(1).toLowerCase();
  }

  stateClass(state: string): string {
    return { FIRMATO: 'bg-primary', SPEDITO: 'bg-success', CONSEGNATO: 'bg-success', RICEVUTO: 'bg-success' }[state] || 'bg-secondary';
  }

  download(d: any): void {
    this.callService.getBlob('/rest/content?nodeRef=' + d['cmis:objectId'], d['cmis:name']);
  }
}
