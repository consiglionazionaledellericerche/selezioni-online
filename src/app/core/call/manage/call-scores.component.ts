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
      </div>
      <div *ngIf="!rows.length" class="alert alert-light">{{ 'call_scores.empty' | translate }}</div>
      <div class="table-responsive scores" *ngIf="rows.length">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              <th scope="col" class="sticky-col"><span class="row-number">#</span>{{ 'call_scores.candidate' | translate }}</th>
              <th scope="col" *ngFor="let field of fields" class="text-end score-col" [title]="field.label">
                <div class="text-truncate">{{ field.label }}</div>
                <small class="fw-normal text-secondary">
                  <span *ngIf="hasValue(field.min)">min {{ field.min }}</span>
                  <span *ngIf="hasValue(field.max)"> max {{ field.max }}</span>
                </small>
              </th>
              <th scope="col" class="text-end text-success">{{ 'call_scores.total' | translate }}</th>
              <th scope="col" class="text-end">{{ 'call_scores.position' | translate }}</th>
              <th scope="col">{{ 'call_scores.outcome' | translate }}</th>
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
                <select class="form-select form-select-sm" [(ngModel)]="row.values[ESITO]" [disabled]="row.esitoLocked"
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
    .scores input[readonly] { background: #f2f2f2; }
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
      this.rows = items.map(item => this.toRow(item)).sort((a, b) => this.compare(a, b));
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

  /** Posizione in graduatoria (le domande senza posizione in fondo), poi cognome e nome. */
  private compare(a: ScoreRow, b: ScoreRow): number {
    const ga = this.hasValue(a.values[GRADUATORIA]) ? Number(a.values[GRADUATORIA]) : Number.MAX_SAFE_INTEGER;
    const gb = this.hasValue(b.values[GRADUATORIA]) ? Number(b.values[GRADUATORIA]) : Number.MAX_SAFE_INTEGER;
    return ga - gb || a.cognome.localeCompare(b.cognome) || a.nome.localeCompare(b.nome);
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
