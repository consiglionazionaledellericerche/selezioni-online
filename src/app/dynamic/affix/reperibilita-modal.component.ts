import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ModalRef } from '../../shared/modal/modal.service';
import { ApiMessageService, MessageType } from '../../core/api-message.service';
import { Application } from '../../core/application/application.model';
import { ApplicationOperationsService } from '../../core/application/application-operations.service';

/**
 * Reperibilità del candidato modificata da RdP o CONCORSI (ex "Reperibilità" del menu Operazioni):
 * stessa sezione del form della domanda, salvata con PUT /v1/application/{id}/reperibilita.
 */
@Component({
  standalone: false,
  selector: 'app-reperibilita-modal',
  template: `
    <div class="modal-header">
      <h2 class="modal-title h5 no_toc d-flex align-items-center">
        <svg class="icon icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-map-marker-circle"></use></svg>
        {{ 'application_operations.reperibilita.title' | translate }}
      </h2>
      <button class="btn-close" type="button" [attr.aria-label]="'layout.close' | translate" (click)="modalRef.hide()">
        <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
      </button>
    </div>
    <div class="modal-body pt-3">
      <div class="candidate mb-4">
        <span class="small text-secondary d-block">{{ 'application_operations.candidate' | translate }}</span>
        <strong>{{ application.cognome | uppercase }} {{ application.nome | uppercase }}</strong>
      </div>
      <affix_tabReperibilita [form]="form" [data]="application"></affix_tabReperibilita>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary btn-sm" (click)="modalRef.hide()">{{ 'button.cancel' | translate }}</button>
      <button type="button" class="btn btn-primary btn-sm" [disabled]="busy || form.invalid" (click)="save()">{{ 'save' | translate }}</button>
    </div>
  `,
  styles: [`
    .candidate { padding: .6rem .9rem; background: #f0f6fc; border-left: 4px solid var(--app-primary); border-radius: 4px; }
  `]
})
export class ReperibilitaModalComponent {
  public application: Application;
  @Output() done = new EventEmitter<void>();

  public form: FormGroup = new FormGroup({});
  public busy = false;

  public readonly modalRef = inject(ModalRef);
  private readonly service = inject(ApplicationOperationsService);
  private readonly apiMessageService = inject(ApiMessageService);
  private readonly translateService = inject(TranslateService);

  save(): void {
    const properties: { [key: string]: any } = {};
    Object.keys(this.form.controls)
      .filter(key => key.startsWith('jconon_application:') && key.endsWith('_comunicazioni'))
      .forEach(key => {
        const value = this.form.controls[key].value;
        // il comune italiano arriva dalla select come oggetto Comune
        properties[key] = value && typeof value === 'object' ? (value.id || null) : (value ?? null);
      });
    this.busy = true;
    this.service.reperibilita(this.application.objectId, properties).subscribe(() => {
      this.busy = false;
      Object.keys(properties).forEach(key => (this.application as any)[key.split(':')[1]] = properties[key]);
      this.apiMessageService.sendMessage(MessageType.SUCCESS, this.translateService.instant('application_operations.reperibilita.done'));
      this.done.emit();
      this.modalRef.hide();
    }, () => this.busy = false);
  }
}
