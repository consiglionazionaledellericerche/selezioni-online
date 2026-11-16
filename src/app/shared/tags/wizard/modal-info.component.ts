import {Component, EventEmitter, Input, Output} from '@angular/core';
import { ModalRef } from '../../modal/modal.service';

@Component({
  standalone: false,
  selector: 'modal-info',
  template: `
      <div class="modal-header">
        <h2 class="modal-title h5 no_toc">{{'modal.title.info'|translate}}</h2>
        <button class="btn-close" type="button" aria-label="Chiudi finestra modale" (click)="onClose()">
          <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
        </button>
      </div>
      <div class="modal-body pt-3" [innerHtml]="body | translate"></div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary ms-auto" [disabled]="disable" (click)="onClose()">{{'button.ok'|translate}}</button>
      </div>
  `
})
export class ModalInfoComponent {

  @Input() disable = false;

  @Input() style = {};

  @Input() classes = {};

  @Input() showLabel = false;

  @Input() body: string = '';

  @Input() fa: string;

  @Output() close = new EventEmitter();

  constructor(
      public modalRef: ModalRef
  ) {}

  onClose() {
    this.close.emit();
    this.modalRef.hide();
  }
  
  ngOnDestroy(){
    this.close.next(true); 
  }
}
