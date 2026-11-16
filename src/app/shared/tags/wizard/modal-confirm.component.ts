import {Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import { ModalRef, ModalService } from '../../modal/modal.service';

@Component({
  standalone: false,
  selector: 'modal-confirm',
  template: `
      <div class="modal-header">
        <h2 class="modal-title h5 no_toc">{{'modal.title.confirm'|translate}}</h2>
        <button class="btn-close" type="button" aria-label="Chiudi finestra modale" (click)="modalRef.hide()">
          <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
        </button>
      </div>
      <div class="modal-body pt-3"><p class="mb-4" style="white-space: pre-line" [innerHtml]="body | translate"></p></div>
      <div class="modal-footer">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 w-100">
          <button type="button" class="btn btn-outline-secondary" (click)="modalRef.hide()">{{'button.cancel'|translate}}</button>
          <button type="button" class="btn btn-primary" [disabled]="disable" (click)="onConfirm()">{{'button.confirm'|translate}}</button>
        </div>
      </div>
  `
})
export class ModalConfirmComponent {

  @Input() disable = false;

  @Input() style = {};

  @Input() classes = {};

  @Input() showLabel = false;

  @Input() body: string = '';

  @Input() fa: string;

  @Input() buttonLabel: string = 'confirm.button';

  @Output() confirm = new EventEmitter();

  constructor(
      private modalService: ModalService,
      public modalRef: ModalRef
  ) {}

  onConfirm() {
    this.confirm.emit();
    this.modalRef.hide();
  }

}
