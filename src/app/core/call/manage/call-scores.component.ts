import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ModalService } from '../../../shared/modal/modal.service';
import { CallService } from '../call.service';
import { ManageCallService } from '../manage-call.service';
import { ApiMessageService, MessageType } from '../../api-message.service';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../auth/model/user.model';
import { Helpers } from '../../../common/helpers/helpers';
import { ApplicationOperationsService, ESITI, ScoreField, callScoreFields } from '../../application/application-operations.service';
import { CallPageBase } from './call-pages.component';
import { padProtocollo } from '../../../common/helpers/protocollo';

const GRADUATORIA = 'jconon_application:graduatoria';
const ESITO = 'jconon_application:esito_call';
const NOTE = 'jconon_application:punteggio_note';
const PROT_NUM_GRAD = 'jconon_application:protocollo_numero_graduatoria';
const PROT_DATA_GRAD = 'jconon_application:protocollo_data_graduatoria';
const PROT_NUM_IDONEO = 'jconon_application:protocollo_numero_assunzione_idoneo';
const PROT_DATA_IDONEO = 'jconon_application:protocollo_data_assunzione_idoneo';

interface ScoreRow {
  id: string;
  cognome: string;
  nome: string;
  totale: any;
  values: { [property: string]: any };
  /** Esito già assegnato quando la graduatoria è generata: non più modificabile (come nel legacy). */
  esitoLocked: boolean;
}

/**
 * Punteggi delle domande attive di un bando (ex pagina carica-punteggi del frontend legacy): una riga per
 * candidato con le voci di punteggio configurate nel bando, totale, posizione e esito in graduatoria, note
 * e protocolli. Si salvano solo le righe modificate; graduatoria, Excel e protocolli con le API del bando.
 */
@Component({
  standalone: false,
  selector: 'call-scores',
  template: `
    <app-call-header [call]="call" page="call_scores.title"></app-call-header>
    <div class="d-flex flex-wrap align-items-center gap-2 mt-3 mb-2">
      <h2 class="text-primary mb-0 me-auto">{{ 'call_scores.title' | translate }}</h2>
      <button class="btn btn-primary btn-sm" (click)="save()" [disabled]="busy || !dirtyCount()">
        <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-check"></use></svg>
        {{ 'call_scores.save' | translate }}<span *ngIf="dirtyCount()"> ({{ dirtyCount() }})</span>
      </button>
      <button *ngIf="canRanking()" class="btn btn-outline-primary btn-sm" (click)="ranking()" [disabled]="busy || locked || dirtyCount() > 0">
        <svg class="icon icon-primary icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-chart-line"></use></svg>
        {{ 'call_scores.ranking' | translate }}
      </button>
      <it-dropdown mode="button" color="secondary" class="more-actions more-actions--label">
        <span button class="d-inline-flex align-items-center">
          <svg class="icon icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-more-items"></use></svg>
          <span>{{ 'call_scores.more' | translate }}</span>
        </span>
        <ng-container list>
          <li><a class="dropdown-item list-item" href="javascript:" (click)="exportXls()">
            <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-download"></use></svg>{{ 'call_scores.export' | translate }}</a></li>
          <li><a class="dropdown-item list-item" href="javascript:" (click)="exportAsync()">
            <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-mail"></use></svg>{{ 'call_scores.export_async' | translate }}</a></li>
          <li *ngIf="canRanking() && !locked"><a class="dropdown-item list-item" href="javascript:" (click)="fileInput.click()">
            <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-upload"></use></svg>{{ 'call_scores.import' | translate }}</a></li>
          <li *ngIf="canProtocol()"><a class="dropdown-item list-item" href="javascript:" (click)="protocol()">
            <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-file"></use></svg>{{ 'call_scores.protocol' | translate }}</a></li>
          <li *ngIf="canUnlock()"><a class="dropdown-item list-item text-danger" href="javascript:" (click)="unlock()">
            <svg class="icon icon-sm icon-danger me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-unlocked"></use></svg>{{ 'call_scores.unlock' | translate }}</a></li>
        </ng-container>
      </it-dropdown>
      <input #fileInput type="file" class="d-none" accept=".xls,application/vnd.ms-excel" (change)="importXls($event)">
    </div>
    <p class="small text-secondary">{{ 'call_scores.info' | translate }}</p>

    <div *ngIf="locked" class="alert alert-info">{{ 'call_scores.locked' | translate }}</div>
    <div *ngIf="call && !fields.length" class="alert alert-warning">{{ 'call_scores.no_fields' | translate }}</div>

    <app-layout-wait [loaded]="!!rows"></app-layout-wait>
    <ng-container *ngIf="rows">
      <div class="d-flex flex-wrap align-items-center gap-3 mb-2">
        <div class="search">
          <input type="search" class="form-control form-control-sm" [placeholder]="'call_scores.filter' | translate"
                 [(ngModel)]="filter" [attr.aria-label]="'call_scores.filter' | translate">
        </div>
        <span class="small text-secondary">{{ 'call_scores.count' | translate:{ value: visibleRows().length, total: rows.length } }}</span>
        <button *ngIf="sortKey" type="button" class="btn btn-link btn-sm p-0 d-inline-flex align-items-center" (click)="clearSort()">
          <svg class="icon icon-xs icon-primary me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
          {{ 'call_scores.sort_clear' | translate }}
        </button>
      </div>
      <div *ngIf="!rows.length" class="alert alert-light">{{ 'call_scores.empty' | translate }}</div>
      <div class="table-responsive scores" *ngIf="rows.length">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              <th scope="col" class="sticky-col" [attr.aria-sort]="ariaSort('candidate')">
                <span class="row-number">#</span>
                <button type="button" class="sort-btn" (click)="sortBy('candidate')"
                        [attr.aria-label]="'call_scores.sort_by' | translate:{ value: ('call_scores.candidate' | translate) }">
                  {{ 'call_scores.candidate' | translate }}
                  <ng-container *ngTemplateOutlet="sortIcon; context: { $implicit: 'candidate' }"></ng-container>
                </button>
              </th>
              <th scope="col" *ngFor="let field of fields" class="text-end score-col" [title]="field.label" [attr.aria-sort]="ariaSort(field.property)">
                <button type="button" class="sort-btn justify-content-end w-100" (click)="sortBy(field.property)"
                        [attr.aria-label]="'call_scores.sort_by' | translate:{ value: field.label }">
                  <span class="text-truncate">{{ field.label }}</span>
                  <ng-container *ngTemplateOutlet="sortIcon; context: { $implicit: field.property }"></ng-container>
                </button>
                <small class="fw-normal text-secondary">
                  <span *ngIf="hasValue(field.min)">min {{ field.min }}</span>
                  <span *ngIf="hasValue(field.max)"> max {{ field.max }}</span>
                </small>
              </th>
              <th scope="col" class="text-end text-success" [attr.aria-sort]="ariaSort('totale')">
                <button type="button" class="sort-btn" (click)="sortBy('totale')"
                        [attr.aria-label]="'call_scores.sort_by' | translate:{ value: ('call_scores.total' | translate) }">
                  {{ 'call_scores.total' | translate }}
                  <ng-container *ngTemplateOutlet="sortIcon; context: { $implicit: 'totale' }"></ng-container>
                </button>
              </th>
              <th scope="col" class="text-end" [attr.aria-sort]="ariaSort(GRADUATORIA)">
                <button type="button" class="sort-btn" (click)="sortBy(GRADUATORIA)"
                        [attr.aria-label]="'call_scores.sort_by' | translate:{ value: ('call_scores.position' | translate) }">
                  {{ 'call_scores.position' | translate }}
                  <ng-container *ngTemplateOutlet="sortIcon; context: { $implicit: GRADUATORIA }"></ng-container>
                </button>
              </th>
              <th scope="col" class="esito-col" [attr.aria-sort]="ariaSort(ESITO)">
                <button type="button" class="sort-btn" (click)="sortBy(ESITO)"
                        [attr.aria-label]="'call_scores.sort_by' | translate:{ value: ('call_scores.outcome' | translate) }">
                  {{ 'call_scores.outcome' | translate }}
                  <ng-container *ngTemplateOutlet="sortIcon; context: { $implicit: ESITO }"></ng-container>
                </button>
              </th>
              <th scope="col" class="note-col">{{ 'call_scores.notes' | translate }}</th>
              <th scope="col">{{ 'call_scores.prot_graduatoria' | translate }}</th>
              <th scope="col">{{ 'call_scores.prot_scorrimento' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of visibleRows(); let i = index; trackBy: trackRow" [class.table-warning]="isDirty(row)">
              <th scope="row" class="sticky-col text-nowrap">
                <span class="row-number">{{ i + 1 }}</span>{{ row.cognome | uppercase }} {{ row.nome | uppercase }}
              </th>
              <td *ngFor="let field of fields">
                <input type="text" inputmode="decimal" class="form-control form-control-sm text-end score-input"
                       [(ngModel)]="row.values[field.property]" [readonly]="locked" [attr.aria-label]="field.label">
              </td>
              <td class="text-end fw-bold text-success fs-6">{{ row.totale }}</td>
              <td>
                <input type="number" min="1" class="form-control form-control-sm text-end pos-input"
                       [(ngModel)]="row.values[GRADUATORIA]" [readonly]="locked" [attr.aria-label]="'call_scores.position' | translate">
              </td>
              <td>
                <select class="form-select form-select-sm esito-select" [(ngModel)]="row.values[ESITO]" [disabled]="row.esitoLocked"
                        [attr.aria-label]="'call_scores.outcome' | translate">
                  <option value=""></option>
                  <option *ngFor="let esito of esiti" [value]="esito">{{ esito }} - {{ 'application_operations.esito.' + esito | translate }}</option>
                </select>
              </td>
              <td><textarea rows="1" class="form-control form-control-sm" [(ngModel)]="row.values[NOTE]"
                            [attr.aria-label]="'call_scores.notes' | translate"></textarea></td>
              <td>
                <div class="d-flex gap-1">
                  <input type="text" class="form-control form-control-sm prot-num" [(ngModel)]="row.values[PROT_NUM_GRAD]" (blur)="row.values[PROT_NUM_GRAD] = pad(row.values[PROT_NUM_GRAD])"
                         [placeholder]="'call_scores.number' | translate">
                  <input type="date" class="form-control form-control-sm" [(ngModel)]="row.values[PROT_DATA_GRAD]">
                </div>
              </td>
              <td>
                <div class="d-flex gap-1">
                  <input type="text" class="form-control form-control-sm prot-num" [(ngModel)]="row.values[PROT_NUM_IDONEO]" (blur)="row.values[PROT_NUM_IDONEO] = pad(row.values[PROT_NUM_IDONEO])"
                         [placeholder]="'call_scores.number' | translate">
                  <input type="date" class="form-control form-control-sm" [(ngModel)]="row.values[PROT_DATA_IDONEO]">
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>
    <!-- freccia di ordinamento: piena sulla colonna attiva, tenue sulle altre -->
    <ng-template #sortIcon let-key>
      <svg class="icon icon-xs sort-icon flex-shrink-0" [class.active]="sortKey === key" aria-hidden="true">
        <use *ngIf="sortKey !== key || sortDir > 0" href="/bootstrap-italia/dist/svg/sprites.svg#it-arrow-up-triangle"></use>
        <use *ngIf="sortKey === key && sortDir < 0" href="/bootstrap-italia/dist/svg/sprites.svg#it-arrow-down-triangle"></use>
      </svg>
    </ng-template>
  `,
  styles: [`
    .search { min-width: 260px; }
    .row-number { display: inline-block; min-width: 2rem; margin-right: .5rem; text-align: right; font-weight: 400; color: #5d7083; }
    .scores { max-height: calc(100vh - 16rem); overflow: auto; border: 1px solid #e3e8ee; border-radius: 4px; }
    .scores thead th { position: sticky; top: 0; background: #f7f9fc; z-index: 2; vertical-align: bottom; font-size: .85rem; }
    .scores .sticky-col { position: sticky; left: 0; background: #fff; z-index: 1; }
    .scores thead .sticky-col { z-index: 3; background: #f7f9fc; }
    .score-col { max-width: 9rem; }
    .score-input { width: 6rem; margin-left: auto; }
    .pos-input { width: 5rem; }
    .prot-num { width: 6rem; }
    .note-col { min-width: 14rem; }
    .esito-col { min-width: 18rem; }
    .esito-select { min-width: 18rem; }
    .scores input[readonly] { background: #f2f2f2; }
    .sort-btn { display: inline-flex; align-items: center; gap: .15rem; max-width: 100%; padding: 0; border: 0; background: none;
      color: inherit; font: inherit; font-weight: 600; text-align: inherit; cursor: pointer; }
    .sort-btn:hover { text-decoration: underline; }
    .sort-icon { fill: currentColor; opacity: .25; }
    .sort-icon.active { opacity: 1; }
  `]
})
export class CallScoresComponent extends CallPageBase {
  public readonly GRADUATORIA = GRADUATORIA;
  public readonly ESITO = ESITO;
  public readonly NOTE = NOTE;
  public readonly PROT_NUM_GRAD = PROT_NUM_GRAD;
  public readonly PROT_DATA_GRAD = PROT_DATA_GRAD;
  public readonly PROT_NUM_IDONEO = PROT_NUM_IDONEO;
  public readonly PROT_DATA_IDONEO = PROT_DATA_IDONEO;

  public fields: ScoreField[] = [];
  public esiti = ESITI;
  public rows: ScoreRow[];
  public filter = '';
  public busy = false;
  /**
   * Colonna di ordinamento scelta: 'candidate', 'totale', una voce di punteggio, posizione o esito;
   * null = ordine predefinito (posizione in graduatoria, poi cognome e nome).
   */
  public sortKey: string = null;
  public sortDir: 1 | -1 = 1;
  private snapshot: { [id: string]: string } = {};
  private user: User;

  constructor(route: ActivatedRoute, callService: CallService, modalService: ModalService,
              private service: ApplicationOperationsService,
              private authService: AuthService,
              private translateService: TranslateService,
              private apiMessageService: ApiMessageService) {
    super(route, callService, modalService);
    if (this.authService.isAuthenticated()) {
      this.user = Helpers.buildInstance(this.authService.getUser(), User);
    }
  }

  get locked(): boolean {
    return !!(this.call && this.call.graduatoria);
  }

  protected onCallLoaded(): void {
    this.fields = callScoreFields(this.call);
    this.loadRows();
  }

  private loadRows(): void {
    this.rows = null;
    this.service.activeApplications(this.callId).subscribe(items => {
      this.rows = items.map(item => this.toRow(item));
      this.applySort();
      this.snapshot = {};
      this.rows.forEach(row => this.snapshot[row.id] = JSON.stringify(row.values));
    });
  }

  private toRow(item: any): ScoreRow {
    const values: { [property: string]: any } = {};
    this.fields.forEach(field => values[field.property] = this.text(item[field.property]));
    values[GRADUATORIA] = item[GRADUATORIA] ?? null;
    values[ESITO] = item[ESITO] || '';
    values[NOTE] = item[NOTE] || '';
    values[PROT_NUM_GRAD] = item[PROT_NUM_GRAD] || '';
    values[PROT_DATA_GRAD] = this.isoDate(item[PROT_DATA_GRAD]);
    values[PROT_NUM_IDONEO] = item[PROT_NUM_IDONEO] || '';
    values[PROT_DATA_IDONEO] = this.isoDate(item[PROT_DATA_IDONEO]);
    return {
      id: item['cmis:objectId'],
      cognome: item['jconon_application:cognome'] || '',
      nome: item['jconon_application:nome'] || '',
      totale: item['jconon_application:totale_punteggio'],
      values,
      esitoLocked: this.locked && !!item[ESITO]
    };
  }

  /**
   * Clic sull'intestazione: primo verso, verso opposto, poi nessun ordinamento (ordine predefinito).
   * Il totale parte dal più alto, le altre colonne dal valore più basso (o dalla A).
   */
  sortBy(key: string): void {
    const first: 1 | -1 = key === 'totale' ? -1 : 1;
    if (this.sortKey !== key) {
      this.sortKey = key;
      this.sortDir = first;
    } else if (this.sortDir === first) {
      this.sortDir = first > 0 ? -1 : 1;
    } else {
      this.sortKey = null;
      this.sortDir = 1;
    }
    this.applySort();
  }

  /** Torna all'ordine predefinito. */
  clearSort(): void {
    this.sortKey = null;
    this.sortDir = 1;
    this.applySort();
  }

  ariaSort(key: string): string {
    return this.sortKey === key ? (this.sortDir > 0 ? 'ascending' : 'descending') : null;
  }

  /** Riordina le righe solo su richiesta (caricamento o clic): mentre si scrive un punteggio le righe restano ferme. */
  private applySort(): void {
    if (this.rows) {
      this.rows = [...this.rows].sort((a, b) => this.compare(a, b));
    }
  }

  /**
   * Colonna scelta nel verso scelto, con i valori vuoti sempre in fondo; a parità, posizione in graduatoria
   * e poi cognome e nome.
   */
  private compare(a: ScoreRow, b: ScoreRow): number {
    if (!this.sortKey) {
      return this.compareBy(GRADUATORIA, a, b, 1) || this.compareBy('candidate', a, b, 1);
    }
    const byKey = this.compareBy(this.sortKey, a, b, this.sortDir);
    if (byKey || this.sortKey === 'candidate') {
      return byKey;
    }
    return (this.sortKey !== GRADUATORIA ? this.compareBy(GRADUATORIA, a, b, 1) : 0) || this.compareBy('candidate', a, b, 1);
  }

  private compareBy(key: string, a: ScoreRow, b: ScoreRow, dir: number): number {
    if (key === 'candidate') {
      const name = (row: ScoreRow) => (row.cognome + ' ' + row.nome).trim();
      return dir * name(a).localeCompare(name(b), 'it', { sensitivity: 'base' });
    }
    const va = this.sortValue(key, a);
    const vb = this.sortValue(key, b);
    if (va === null || vb === null) {
      return va === vb ? 0 : va === null ? 1 : -1;
    }
    if (typeof va === 'number' && typeof vb === 'number') {
      return dir * (va - vb);
    }
    return dir * String(va).localeCompare(String(vb), 'it', { numeric: true, sensitivity: 'base' });
  }

  /** Valore della colonna per l'ordinamento: numeri per punteggi, totale e posizione (anche con la virgola), null se vuoto. */
  private sortValue(key: string, row: ScoreRow): number | string {
    const value = key === 'totale' ? row.totale : row.values[key];
    if (!this.hasValue(value)) {
      return null;
    }
    if (key === ESITO) {
      return String(value);
    }
    const number = Number(String(value).trim().replace(',', '.'));
    return isNaN(number) ? String(value) : number;
  }

  visibleRows(): ScoreRow[] {
    const term = (this.filter || '').trim().toLowerCase();
    return !term ? this.rows : this.rows.filter(row => (row.cognome + ' ' + row.nome).toLowerCase().includes(term));
  }

  trackRow(_: number, row: ScoreRow): string {
    return row.id;
  }

  isDirty(row: ScoreRow): boolean {
    return this.snapshot[row.id] !== JSON.stringify(row.values);
  }

  dirtyCount(): number {
    return (this.rows || []).filter(row => this.isDirty(row)).length;
  }

  /** Numero di protocollo a 7 cifre con gli zeri iniziali. */
  pad(value: any): any {
    return padProtocollo(value);
  }

  hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  canRanking(): boolean {
    return !!this.call && !!this.user && this.user.isRdP(this.call.rdp);
  }

  canProtocol(): boolean {
    return !!this.call && !!this.user && (this.user.isRdP(this.call.rdp) || ManageCallService.isConcorsi(this.user));
  }

  canUnlock(): boolean {
    return this.locked && ManageCallService.isConcorsi(this.user);
  }

  save(): void {
    const rows = this.rows.filter(row => this.isDirty(row)).map(row => {
      const json: { [key: string]: any } = { 'cmis:objectId': row.id };
      Object.keys(row.values).forEach(key => {
        const value = key === PROT_NUM_GRAD || key === PROT_NUM_IDONEO ? padProtocollo(row.values[key]) : row.values[key];
        json[key] = value === null || value === undefined ? '' : String(value);
      });
      return json;
    });
    this.busy = true;
    this.service.saveAllScores(this.callId, rows).subscribe(result => {
      this.busy = false;
      this.apiMessageService.sendMessage(MessageType.SUCCESS,
        this.translateService.instant('call_scores.saved', { value: result?.righe ?? rows.length }));
      this.loadRows();
    }, () => this.busy = false);
  }

  ranking(): void {
    this.confirm(this.translateService.instant('call_scores.confirm_ranking', { value: this.call.codice }), () => {
      this.busy = true;
      this.service.ranking(this.callId).subscribe(() => {
        this.busy = false;
        this.apiMessageService.sendMessage(MessageType.SUCCESS, this.translateService.instant('call_scores.ranking_done'));
        this.reloadCall();
      }, () => this.busy = false);
    });
  }

  unlock(): void {
    this.confirm(this.translateService.instant('call_scores.confirm_unlock', { value: this.call.codice }), () => {
      this.service.unlockRanking(this.callId).subscribe(() => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, this.translateService.instant('call_scores.unlocked'));
        this.reloadCall();
      });
    });
  }

  protocol(): void {
    this.confirm(this.translateService.instant('call_scores.confirm_protocol', { value: this.call.codice }), () => {
      this.service.protocol(this.callId).subscribe(() => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, this.translateService.instant('call_scores.protocol_done'));
        this.loadRows();
      });
    });
  }

  exportXls(): void {
    this.busy = true;
    this.service.exportScores(this.callId).subscribe(() => this.busy = false, () => this.busy = false);
  }

  exportAsync(): void {
    this.service.exportScoresAsync(this.callId).subscribe(result =>
      this.apiMessageService.sendMessage(MessageType.SUCCESS,
        this.translateService.instant('call_scores.export_async_done', { email: result?.email || '' })));
  }

  importXls(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    input.value = '';
    if (!file) {
      return;
    }
    this.busy = true;
    this.service.importScores(this.callId, file).subscribe(result => {
      this.busy = false;
      this.apiMessageService.sendMessage(MessageType.SUCCESS,
        this.translateService.instant('call_scores.imported', { value: result?.righe ?? 0 }));
      this.loadRows();
    }, () => this.busy = false);
  }

  private reloadCall(): void {
    this.callService.getById(this.callId).subscribe(call => {
      this.call = call;
      this.onCallLoaded();
    });
  }

  private text(value: any): string {
    return value === null || value === undefined ? '' : String(value);
  }

  /** Date dei protocolli per input type="date" (yyyy-MM-dd, ora locale). */
  private isoDate(value: any): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }
}
