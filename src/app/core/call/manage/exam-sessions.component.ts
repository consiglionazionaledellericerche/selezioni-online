import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { CallPageBase } from './call-pages.component';
import { CallService } from '../call.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { ConfigService } from '../../config.service';
import { ApiMessageService, MessageType } from '../../api-message.service';

/**
 * Sessioni d'esame relative alle convocazioni inviate (ex pagina exam-sessions del legacy): per ogni sessione
 * (luogo e data della convocazione) l'elenco dei candidati con i dati del documento di riconoscimento, con
 * l'esportazione in CSV e quella per Moodle (candidati e commissari).
 */
@Component({
  standalone: false,
  selector: 'app-exam-sessions',
  template: `
    <app-call-header [call]="call" page="exam_sessions.title"></app-call-header>
    <app-layout-wait [loaded]="sessions"></app-layout-wait>
    <ng-container *ngIf="sessions">
      <div *ngIf="!names.length" class="alert alert-warning mt-4">{{ 'exam_sessions.none' | translate }}</div>
      <ng-container *ngIf="names.length">
        <div class="row align-items-end g-3 mt-4 mb-3">
          <div class="col-lg-6">
            <div class="select-wrapper">
              <label for="es-session">{{ 'exam_sessions.session' | translate }}</label>
              <select id="es-session" [(ngModel)]="session">
                <option *ngFor="let name of names" [value]="name">{{ name }} ({{ sessions[name].length }})</option>
              </select>
            </div>
          </div>
          <div class="col-lg-6 d-flex flex-wrap gap-2 justify-content-lg-end">
            <button type="button" class="btn btn-outline-primary btn-sm" [disabled]="busy" (click)="export(false)">
              <svg class="icon icon-sm icon-primary me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-download"></use></svg>{{ 'exam_sessions.export' | translate }}
            </button>
            <button type="button" class="btn btn-success btn-sm" [disabled]="busy" (click)="export(true)">
              <svg class="icon icon-sm icon-white me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-download"></use></svg>{{ 'exam_sessions.export_moodle' | translate }}
            </button>
          </div>
        </div>
        <div class="table-responsive">
          <!-- come nel legacy: in rosso i documenti scaduti alla data della sessione (bordo a sinistra); il numero scarica il documento -->
          <table class="table table-sm table-hover align-middle" appContentLinks>
            <thead>
              <tr>
                <th>#</th>
                <th>{{ 'exam_sessions.first_name' | translate }}</th>
                <th>{{ 'exam_sessions.last_name' | translate }}</th>
                <th>{{ 'exam_sessions.fiscal_code' | translate }}</th>
                <th>{{ 'exam_sessions.birthdate' | translate }}</th>
                <th>{{ 'exam_sessions.document_type' | translate }}</th>
                <th>{{ 'exam_sessions.document_number' | translate }}</th>
                <th>{{ 'exam_sessions.document_date' | translate }}</th>
                <th>{{ 'exam_sessions.issued_by' | translate }}</th>
                <th>{{ 'exam_sessions.uid' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of sessions[session]; let i = index" [ngClass]="expired(c) ? 'row-expired' : 'row-valid'">
                <td>{{ i + 1 }}</td>
                <td>{{ c.firstName }}</td>
                <td>{{ c.lastName }}</td>
                <td>{{ c.fiscalCode }}</td>
                <td>{{ c.birthdate }}</td>
                <td>{{ c.documentType }}</td>
                <td>
                  <a *ngIf="c.documentId; else plainNumber" [attr.href]="'rest/content?nodeRef=' + c.documentId"
                     [attr.title]="'exam_sessions.download' | translate">{{ c.documentNumber }}</a>
                  <ng-template #plainNumber>{{ c.documentNumber }}</ng-template>
                </td>
                <td class="text-nowrap">
                  {{ c.documentDate }}
                  <span *ngIf="expired(c)" class="badge bg-danger ms-1">{{ 'exam_sessions.expired' | translate }}</span>
                </td>
                <td>{{ c.documentIssuedBy }}</td>
                <td>{{ c.uid }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>
    </ng-container>
  `,
  styles: [`
    tr.row-valid > td:first-child { box-shadow: inset 4px 0 0 #008758; }
    tr.row-expired > td:first-child { box-shadow: inset 4px 0 0 #d9364f; }
    tr > td:first-child { padding-left: .9rem; }
  `]
})
export class ExamSessionsComponent extends CallPageBase {
  public sessions: { [name: string]: any[] };
  public names: string[] = [];
  public session: string;
  public busy = false;

  constructor(route: ActivatedRoute, callService: CallService, modalService: ModalService,
              private http: HttpClient, private configService: ConfigService,
              private apiMessageService: ApiMessageService) {
    super(route, callService, modalService);
  }

  protected onCallLoaded(): void {
    this.configService.getApiBase().pipe(
      switchMap(apiBase => this.http.get<{ [name: string]: any[] }>(apiBase + '/v1/call/exam-sessions/' + encodeURIComponent(this.callId)))
    ).subscribe(sessions => {
      this.sessions = sessions || {};
      this.names = Object.keys(this.sessions);
      this.session = this.names[0];
    }, () => {
      this.sessions = {};
      this.names = [];
    });
  }

  /** Documento scaduto alla data della sessione (come il legacy: data sessione > scadenza del documento). */
  expired(candidate: any): boolean {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(candidate?.documentDate || '');
    if (!m || candidate?.date === undefined || candidate?.date === null) {
      return false;
    }
    const expiry = new Date(+m[3], +m[2] - 1, +m[1]);
    const session = new Date(candidate.date);
    return !isNaN(session.getTime()) && session > expiry;
  }

  /** CSV della sessione scelta: candidati, oppure (Moodle) candidati e commissari. */
  export(moodle: boolean): void {
    if (!this.session) {
      return;
    }
    this.busy = true;
    const path = moodle ? '/v1/call/exam-moodle-sessions/' : '/v1/call/exam-sessions/';
    this.configService.getApiBase().pipe(
      switchMap(apiBase => this.http.post(apiBase + path + encodeURIComponent(this.callId),
        new HttpParams().set('session', this.session), { responseType: 'blob' }))
    ).subscribe(blob => {
      this.busy = false;
      saveAs(blob, (moodle ? 'moodle_' : '') + 'utenti.csv');
    }, () => {
      this.busy = false;
      this.apiMessageService.sendMessage(MessageType.ERROR, 'admin.error.generic');
    });
  }
}
