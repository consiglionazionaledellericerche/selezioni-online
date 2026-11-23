import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ModalRef } from '../../../shared/modal/modal.service';
import { ApiMessageService, MessageType } from '../../api-message.service';
import { Application } from '../application.model';
import { ApplicationOperationsService, ESITI, ScoreField, callScoreFields } from '../application-operations.service';

/**
 * Punteggi di una domanda (ex "Punteggi" del menu Operazioni): solo le voci configurate nel bando,
 * con minimo e limite massimo; il totale viene ricalcolato dal backend.
 */
@Component({
  selector: 'app-application-scores-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, UpperCasePipe],
  template: `
    <div class="modal-header">
      <h2 class="modal-title h5 no_toc d-flex align-items-center">
        <svg class="icon icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-star-outline"></use></svg>
        {{ 'application_operations.scores.title' | translate }}
      </h2>
      <button class="btn-close" type="button" [attr.aria-label]="'layout.close' | translate" (click)="modalRef.hide()">
        <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
      </button>
    </div>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <div class="modal-body pt-3">
        <div class="candidate mb-3">
          <span class="small text-secondary d-block">{{ 'application_operations.candidate' | translate }}</span>
          <strong>{{ application.cognome | uppercase }} {{ application.nome | uppercase }}</strong>
          @if (application.totale_punteggio !== null && application.totale_punteggio !== undefined) {
            <span class="badge bg-success ms-2">{{ 'application_operations.scores.total' | translate }} {{ application.totale_punteggio }}</span>
          }
        </div>
        @if (!fields.length) {
          <div class="alert alert-warning">{{ 'application_operations.scores.no_fields' | translate }}</div>
        }
        <div class="row g-3">
          @for (field of fields; track field.property) {
            <div class="col-md-6">
              <label class="form-label d-block fw-semibold" [for]="'score-' + field.index">{{ field.label }}</label>
              <div class="input-group">
                @if (hasValue(field.min)) {
                  <span class="input-group-text small">min {{ field.min }}</span>
                }
                <input [id]="'score-' + field.index" type="text" inputmode="decimal" class="form-control text-end"
                       [formControlName]="field.property">
                @if (hasValue(field.max)) {
                  <span class="input-group-text small">max {{ field.max }}</span>
                }
              </div>
            </div>
          }
          <div class="col-md-3">
            <label for="score-grad" class="form-label d-block fw-semibold">{{ 'application_operations.scores.ranking' | translate }}</label>
            <input id="score-grad" type="number" min="1" class="form-control text-end" formControlName="jconon_application:graduatoria">
          </div>
          <div class="col-md-3">
            <label for="score-esito" class="form-label d-block fw-semibold">{{ 'application_operations.scores.outcome' | translate }}</label>
            <select id="score-esito" class="form-select" formControlName="jconon_application:esito_call">
              <option value=""></option>
              @for (esito of esiti; track esito) {
                <option [value]="esito">{{ 'application_operations.esito.' + esito | translate }}</option>
              }
            </select>
          </div>
          <div class="col-12">
            <label for="score-note" class="form-label d-block fw-semibold">{{ 'application_operations.scores.notes' | translate }}</label>
            <textarea id="score-note" rows="3" class="form-control" formControlName="jconon_application:punteggio_note"></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary btn-sm" (click)="modalRef.hide()">{{ 'button.cancel' | translate }}</button>
        <button type="submit" class="btn btn-primary btn-sm" [disabled]="busy">{{ 'save' | translate }}</button>
      </div>
    </form>
  `,
  styles: [`
    .candidate { padding: .6rem .9rem; background: #f0f6fc; border-left: 4px solid var(--app-primary); border-radius: 4px; }
  `]
})
export class ApplicationScoresModalComponent implements OnInit {
  public application: Application;
  @Output() done = new EventEmitter<void>();

  public form: FormGroup;
  public fields: ScoreField[] = [];
  public esiti = ESITI;
  public busy = false;

  public readonly modalRef = inject(ModalRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly service = inject(ApplicationOperationsService);
  private readonly apiMessageService = inject(ApiMessageService);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.fields = callScoreFields(this.application.call);
    const source: any = this.application;
    const controls: { [key: string]: any } = {
      'jconon_application:graduatoria': [source.graduatoria ?? ''],
      'jconon_application:esito_call': [source.esito_call || ''],
      'jconon_application:punteggio_note': [source.punteggio_note || '']
    };
    this.fields.forEach(field => controls[field.property] = [this.format(source[field.property.split(':')[1]])]);
    this.form = this.formBuilder.group(controls);
  }

  hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  submit(): void {
    this.busy = true;
    this.service.saveScores(this.application.objectId, this.form.value).subscribe(result => {
      this.busy = false;
      // il backend segnala i punteggi sotto il minimo o oltre il limite nel messaggio
      const warning = (result?.message || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const message = this.translateService.instant('application_operations.scores.saved') + (warning ? ' ' + warning : '');
      this.apiMessageService.sendMessage(warning ? MessageType.WARNING : MessageType.SUCCESS, message);
      this.done.emit();
      this.modalRef.hide();
    }, () => this.busy = false);
  }

  /** Valori decimali con la virgola, come li accetta il backend (Utility.FORMATBigDecimal). */
  private format(value: any): string {
    return value === null || value === undefined ? '' : String(value).replace('.', ',');
  }
}
