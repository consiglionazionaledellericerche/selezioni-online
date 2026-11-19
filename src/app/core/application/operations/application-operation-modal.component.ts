import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ModalRef } from '../../../shared/modal/modal.service';
import { ApiMessageService, MessageType } from '../../api-message.service';
import { DocumentService } from '../../document/document.service';
import { padProtocollo } from '../../../common/helpers/protocollo';
import { Application } from '../application.model';
import { ApplicationOperation, ApplicationOperationsService } from '../application-operations.service';

/**
 * Operazione su una domanda che richiede un documento (provvedimento o comunicazione): file e protocollo,
 * più lo stato per l'esclusione. Il backend allega il documento alla domanda ed esegue l'operazione.
 */
@Component({
  selector: 'app-application-operation-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, UpperCasePipe],
  template: `
    <div class="modal-header">
      <h2 class="modal-title h5 no_toc d-flex align-items-center">
        <svg class="icon me-2" [class.icon-danger]="danger" [class.icon-primary]="!danger">
          <use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + icon"></use>
        </svg>
        {{ 'application_operations.' + operation + '.title' | translate }}
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
          @if (application.call?.codice) {
            <span class="small text-secondary"> — {{ application.call.codice }}</span>
          }
        </div>
        <p class="small text-secondary">{{ 'application_operations.' + operation + '.info' | translate }}</p>
        <div class="mb-4">
          <label for="op-file" class="form-label d-block fw-semibold">{{ 'application_operations.file' | translate }} *</label>
          <input id="op-file" type="file" class="form-control" accept=".pdf,.p7m,application/pdf" (change)="onFile($event)">
          @if (file) {
            <small class="text-secondary">{{ file.name }}</small>
          }
        </div>
        <div class="row g-3">
          <div class="col-md-6">
            <label for="op-data" class="form-label d-block fw-semibold">{{ 'application_operations.protocol_date' | translate }} *</label>
            <input id="op-data" type="date" class="form-control" formControlName="data">
          </div>
          <div class="col-md-6">
            <label for="op-numero" class="form-label d-block fw-semibold">{{ 'application_operations.protocol_number' | translate }} *</label>
            <input id="op-numero" type="text" inputmode="numeric" class="form-control" formControlName="numero" (blur)="padNumero()">
          </div>
          @if (operation === 'esclusione') {
            <div class="col-md-6">
              <label for="op-stato" class="form-label d-block fw-semibold">{{ 'application_operations.state' | translate }}</label>
              <select id="op-stato" class="form-select" formControlName="stato">
                @for (stato of stati; track stato) {
                  <option [value]="stato">{{ 'application_operations.states.' + stato | translate }}</option>
                }
              </select>
            </div>
          }
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary btn-sm" (click)="modalRef.hide()">{{ 'button.cancel' | translate }}</button>
        <button type="submit" class="btn btn-sm" [class.btn-danger]="danger" [class.btn-primary]="!danger"
                [disabled]="busy || form.invalid || !file">
          {{ 'application_operations.' + operation + '.confirm' | translate }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .candidate { padding: .6rem .9rem; background: #f0f6fc; border-left: 4px solid #0066cc; border-radius: 4px; }
  `]
})
export class ApplicationOperationModalComponent implements OnInit {
  public application: Application;
  public operation: ApplicationOperation;
  @Output() done = new EventEmitter<void>();

  public form: FormGroup;
  public file: File;
  public busy = false;
  public stati = ['GENERATO', 'FIRMATO', 'SPEDITO', 'CONSEGNATO'];

  public readonly modalRef = inject(ModalRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly service = inject(ApplicationOperationsService);
  private readonly apiMessageService = inject(ApiMessageService);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      data: [new Date().toISOString().substring(0, 10), Validators.required],
      numero: ['', Validators.required],
      stato: ['SPEDITO']
    });
  }

  get danger(): boolean {
    return ['esclusione', 'ritiro', 'rinuncia'].includes(this.operation);
  }

  get icon(): string {
    return {
      esclusione: 'it-ban', riammissione: 'it-check-circle', ritiro: 'it-arrow-down-circle', rinuncia: 'it-minus-circle',
      comunicazione: 'it-mail', convocazione: 'it-calendar'
    }[this.operation] || 'it-file';
  }

  /** Numero di protocollo a 7 cifre con gli zeri iniziali. */
  padNumero(): void {
    const control = this.form.get('numero');
    control.setValue(padProtocollo(control.value), { emitEvent: false });
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files && input.files.length ? input.files[0] : null;
  }

  submit(): void {
    if (this.form.invalid || !this.file) {
      return;
    }
    const value = this.form.value;
    const properties: { [key: string]: any } = {
      'jconon_protocollo:data': DocumentService.toCmisDate(new Date(value.data + 'T00:00:00')),
      'jconon_protocollo:numero': padProtocollo(value.numero)
    };
    if (this.operation === 'esclusione') {
      properties['stato'] = value.stato;
    }
    this.busy = true;
    this.service.operation(this.application.objectId, this.operation, this.file, properties).subscribe(() => {
      this.busy = false;
      this.apiMessageService.sendMessage(MessageType.SUCCESS,
        this.translateService.instant('application_operations.' + this.operation + '.done'));
      this.done.emit();
      this.modalRef.hide();
    }, () => this.busy = false);
  }
}
