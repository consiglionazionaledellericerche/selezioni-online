import { Component, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalRef } from '../../shared/modal/modal.service';
import { Call } from '../../core/call/call.model';

/**
 * Sezioni della modifica del bando aperte dall'elenco dei bandi da chi può modificarlo, con la stessa gestione
 * delle tab: "Allegati" (tipologie, ricerca, caricamento con i metadati obbligatori) e "Responsabili" (RdP).
 */
@Component({
  standalone: false,
  selector: 'app-call-attachments-modal',
  template: `
    <div class="modal-header">
      <h2 class="modal-title h5 no_toc">
        {{ (section === 'accountable' ? 'call_manage.rdp.title' : 'call.attach_to') | translate:{ value: call?.codice } }}
        <small *ngIf="section === 'accountable'" class="text-secondary"> — {{ call?.codice }}</small>
      </h2>
      <button type="button" class="btn-close" [attr.aria-label]="'layout.close' | translate" (click)="modalRef.hide()">
        <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
      </button>
    </div>
    <div class="modal-body pt-3">
      <affix_tabCallAttachments *ngIf="section !== 'accountable'" [data]="call" [form]="form"></affix_tabCallAttachments>
      <!-- stessa gestione della tab "Responsabili" della modifica del bando -->
      <affix_tabCallAccountable *ngIf="section === 'accountable'" [data]="call" [form]="form"></affix_tabCallAccountable>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-primary btn-sm" (click)="modalRef.hide()">{{ 'close' | translate }}</button>
    </div>
  `
})
export class CallAttachmentsModalComponent {
  public call: Call;
  /** Sezione della modifica del bando da mostrare: allegati (predefinita) o responsabili del procedimento. */
  public section: 'attachments' | 'accountable' = 'attachments';
  public form: FormGroup = new FormGroup({});
  public readonly modalRef = inject(ModalRef);
}
