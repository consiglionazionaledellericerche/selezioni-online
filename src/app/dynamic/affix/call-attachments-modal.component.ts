import { Component, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalRef } from '../../shared/modal/modal.service';
import { Call } from '../../core/call/call.model';

/**
 * Allegati del bando aperti dall'elenco dei bandi da chi può modificarlo: la stessa gestione della tab
 * "Allegati" della modifica del bando (tipologie, ricerca, caricamento con i metadati obbligatori).
 */
@Component({
  standalone: false,
  selector: 'app-call-attachments-modal',
  template: `
    <div class="modal-header">
      <h2 class="modal-title h5 no_toc">{{ 'call.attach_to' | translate:{ value: call?.codice } }}</h2>
      <button type="button" class="btn-close" [attr.aria-label]="'layout.close' | translate" (click)="modalRef.hide()">
        <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
      </button>
    </div>
    <div class="modal-body pt-3">
      <affix_tabCallAttachments [data]="call" [form]="form"></affix_tabCallAttachments>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-primary btn-sm" (click)="modalRef.hide()">{{ 'close' | translate }}</button>
    </div>
  `
})
export class CallAttachmentsModalComponent {
  public call: Call;
  public form: FormGroup = new FormGroup({});
  public readonly modalRef = inject(ModalRef);
}
