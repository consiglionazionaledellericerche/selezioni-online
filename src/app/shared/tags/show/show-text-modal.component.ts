import {Component, Input, TemplateRef} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-show-text-modal',
  template: `
    <span *ngIf="value" class="mr-1">
      <span>{{ label | translate }}</span>
      <a class="ml-1" [ngClass]="{'font-weight-bold': strong}" href="" (click)="openModal(template)">{{ value }}</a>
    </span>
    <ng-template #template>
      <div class="modal-header">
        <h4 class="modal-title pull-left text-info"><i class="fa fa-info-circle"></i> {{modal_title}}</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" innerHtml="{{modal_text}}"></div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-primary" (click)="modalRef.hide()">Close</button>
      </div>
    </ng-template>
  `
})
export class ShowTextModalComponent {

  @Input() label;
  @Input() value;
  @Input() modal_title;
  @Input() modal_text;
  @Input() strong = true;
  modalRef: BsModalRef;
  constructor(private modalService: BsModalService) {}
 
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'modal-lg' }));
    return false;
  }
}
