import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ModalService } from '../../../shared/modal/modal.service';
import { CallService } from '../call.service';
import { ApiMessageService, MessageType } from '../../api-message.service';
import { ApplicationOperationsService } from '../../application/application-operations.service';
import { CallPageBase } from './call-pages.component';

interface CandidateItem {
  id: string;
  label: string;
  stato: string;
  esclusione: string;
  totale: number;
}

/**
 * Aggiunge lo stesso file alle domande del bando (ex pagina aggiungi-allegato del frontend legacy):
 * filtro per stato e per totale punteggio, scelta delle domande (nessuna scelta = tutte quelle filtrate).
 * Le domande che hanno già un allegato con lo stesso nome vengono saltate dal backend.
 */
@Component({
  standalone: false,
  selector: 'call-application-attachment',
  template: `
    <app-call-header [call]="call" page="call_attachment.title"></app-call-header>
    <h2 class="text-primary mt-3">{{ 'call_attachment.title' | translate }}</h2>
    <p class="text-secondary">{{ 'call_attachment.info' | translate }}</p>

    <div class="row g-4">
      <aside class="col-lg-4">
        <div class="card shadow-sm rounded p-3">
          <h3 class="filters-title">{{ 'call_attachment.status' | translate }}</h3>
          <app-segmented [vertical]="true" [options]="statuses" [(ngModel)]="status" (ngModelChange)="load()"></app-segmented>
          <h3 class="filters-title mt-4">{{ 'call_attachment.total' | translate }}</h3>
          <div class="d-flex gap-2 align-items-center">
            <input type="number" class="form-control form-control-sm" [(ngModel)]="totalFrom"
                   [placeholder]="'call_attachment.from' | translate" [attr.aria-label]="'call_attachment.from' | translate">
            <span class="text-secondary">–</span>
            <input type="number" class="form-control form-control-sm" [(ngModel)]="totalTo"
                   [placeholder]="'call_attachment.to' | translate" [attr.aria-label]="'call_attachment.to' | translate">
          </div>
        </div>
      </aside>

      <section class="col-lg-8">
        <div class="card shadow-sm rounded p-3 mb-4">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <h3 class="h6 mb-0 me-auto">{{ 'call_attachment.applications' | translate }}</h3>
            <span class="badge bg-primary">{{ 'call_attachment.counter' | translate:{ total: filtered().length, selected: selected.size } }}</span>
          </div>
          <input type="search" class="form-control form-control-sm mb-2" [(ngModel)]="search"
                 [placeholder]="'call_attachment.search' | translate" [attr.aria-label]="'call_attachment.search' | translate">
          <app-layout-wait [loaded]="!!items"></app-layout-wait>
          <ng-container *ngIf="items">
            <div class="d-flex gap-3 small mb-2" *ngIf="shown().length">
              <a href="javascript:" (click)="selectShown(true)">{{ 'call_attachment.select_all' | translate }}</a>
              <a href="javascript:" (click)="selectShown(false)">{{ 'call_attachment.select_none' | translate }}</a>
            </div>
            <div *ngIf="!filtered().length" class="alert alert-light mb-0">{{ 'call_attachment.empty' | translate }}</div>
            <ul class="list-unstyled candidates mb-0" *ngIf="filtered().length">
              <li *ngFor="let item of shown(); trackBy: trackItem">
                <label class="d-flex align-items-center gap-2 py-1 px-2">
                  <input type="checkbox" class="form-check-input mt-0" [checked]="selected.has(item.id)" (change)="toggle(item.id)">
                  <span class="me-auto">{{ item.label }}</span>
                  <span *ngIf="item.esclusione" class="badge bg-danger">{{ 'application.esclusione.' + item.esclusione | translate }}</span>
                  <span *ngIf="item.stato === 'P'" class="badge bg-warning text-dark">{{ 'application.state.P' | translate }}</span>
                  <span *ngIf="item.totale !== null" class="small text-success fw-semibold">{{ item.totale }}</span>
                </label>
              </li>
            </ul>
          </ng-container>
          <div class="alert alert-info mt-3 mb-0 small">
            {{ (selected.size ? 'call_attachment.target_selected' : 'call_attachment.target_all') | translate:{ value: selected.size || filtered().length } }}
          </div>
        </div>

        <div class="card shadow-sm rounded p-3">
          <label for="att-file" class="form-label fw-semibold d-block">{{ 'call_attachment.file' | translate }} *</label>
          <input id="att-file" type="file" class="form-control" (change)="onFile($event)">
          <div class="text-end mt-3">
            <button class="btn btn-primary" (click)="submit()" [disabled]="busy || !file || !filtered().length">
              <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-clip"></use></svg>
              {{ 'call_attachment.submit' | translate }}
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .filters-title { font-size: .875rem; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: #5d7083; margin-bottom: .5rem; }
    .candidates { max-height: 26rem; overflow-y: auto; border: 1px solid #e3e8ee; border-radius: 4px; }
    .candidates label { cursor: pointer; margin: 0; }
    .candidates li:nth-child(odd) { background: #f7f9fc; }
  `]
})
export class CallApplicationAttachmentComponent extends CallPageBase {
  public statuses = [
    { value: 'attive', label: 'call_attachment.statuses.attive' },
    { value: 'C', label: 'call_attachment.statuses.C' },
    { value: 'P', label: 'call_attachment.statuses.P' },
    { value: 'escluse', label: 'call_attachment.statuses.escluse' },
    { value: 'tutte', label: 'call_attachment.statuses.tutte' }
  ];
  public status = 'attive';
  public totalFrom: number = null;
  public totalTo: number = null;
  public search = '';
  public items: CandidateItem[];
  public selected = new Set<string>();
  public file: File;
  public busy = false;

  constructor(route: ActivatedRoute, callService: CallService, modalService: ModalService,
              private service: ApplicationOperationsService,
              private translateService: TranslateService,
              private apiMessageService: ApiMessageService) {
    super(route, callService, modalService);
  }

  protected onCallLoaded(): void {
    this.load();
  }

  load(): void {
    this.items = null;
    this.selected.clear();
    this.service.applications(this.callId, this.status).subscribe(items => {
      this.items = items.map(item => ({
        id: item['cmis:objectId'],
        label: ((item['jconon_application:cognome'] || '') + ' ' + (item['jconon_application:nome'] || '')).toUpperCase(),
        stato: item['jconon_application:stato_domanda'],
        esclusione: item['jconon_application:esclusione_rinuncia'],
        totale: this.number(item['jconon_application:totale_punteggio'])
      }));
    });
  }

  /** Domande che rispettano anche il filtro sul totale punteggio (come fa il backend). */
  filtered(): CandidateItem[] {
    const from = this.hasValue(this.totalFrom) ? Number(this.totalFrom) : null;
    const to = this.hasValue(this.totalTo) ? Number(this.totalTo) : null;
    return (this.items || []).filter(item =>
      (from === null || (item.totale !== null && item.totale >= from)) &&
      (to === null || (item.totale !== null && item.totale <= to)));
  }

  /** Domande mostrate nell'elenco: filtrate e cercate per nome. */
  shown(): CandidateItem[] {
    const term = (this.search || '').trim().toUpperCase();
    return this.filtered().filter(item => !term || item.label.includes(term));
  }

  toggle(id: string): void {
    this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id);
  }

  selectShown(select: boolean): void {
    this.shown().forEach(item => select ? this.selected.add(item.id) : this.selected.delete(item.id));
  }

  trackItem(_: number, item: CandidateItem): string {
    return item.id;
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files && input.files.length ? input.files[0] : null;
  }

  submit(): void {
    const count = this.selected.size || this.filtered().length;
    this.confirm(this.translateService.instant('call_attachment.confirm', { file: this.file.name, value: count }), () => {
      this.busy = true;
      const ids = Array.from(this.selected).filter(id => this.filtered().some(item => item.id === id));
      this.service.addAttachment(this.callId, this.file, {
        status: this.status,
        totalFrom: this.hasValue(this.totalFrom) ? Math.ceil(Number(this.totalFrom)) : null,
        totalTo: this.hasValue(this.totalTo) ? Math.floor(Number(this.totalTo)) : null,
        applications: ids
      }).subscribe(result => {
        this.busy = false;
        this.apiMessageService.sendMessage(MessageType.SUCCESS,
          this.translateService.instant('call_attachment.done', { value: result?.numAllegati ?? 0 }));
        this.selected.clear();
      }, () => this.busy = false);
    });
  }

  private hasValue(value: any): boolean {
    return value !== null && value !== undefined && String(value) !== '';
  }

  /** Totale punteggio: numero oppure testo con la virgola decimale (es. "27,5"). */
  private number(value: any): number {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (typeof value === 'number') {
      return value;
    }
    const parsed = Number(String(value).replace(/\./g, '').replace(',', '.'));
    return isNaN(parsed) ? null : parsed;
  }
}
