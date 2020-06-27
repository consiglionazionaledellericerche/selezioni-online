import {Component, Input, TemplateRef} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Interpolation } from '@angular/compiler';

@Component({
  selector: 'app-show-children-modal',
  template: `
    
    <button class="btn {{buttonClass}}" (click)="openModal(template)" tooltip="{{'attach' | translate}}">
        <i class="fa fa-fw fa-download"></i>
    </button>

    <ng-template #template>
      <div class="modal-header">
        <h2 class="modal-title pull-left text-primary"><i class="fa fa-info-circle"></i> {{modal_title}}</h2>
        <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
         <children-list [show_date]="show_date" [parentId]="parentId" [type]="type"></children-list>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-primary" (click)="modalRef.hide()">{{'close' | translate}}</button>
      </div>
    </ng-template>
  `
})
export class ShowChildrenModalComponent {

  @Input() parentId;  
  @Input() buttonClass = 'text-dark';
  @Input() label;
  @Input() value;
  @Input() type;  
  @Input() modal_title;
  @Input() show_date = 'false';
  modalRef: BsModalRef;
  constructor(private modalService: BsModalService) {}
 
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'modal-lg' }));
    return false;
  }
}
