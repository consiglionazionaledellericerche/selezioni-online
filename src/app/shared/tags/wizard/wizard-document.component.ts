import {Component, Input, TemplateRef} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-wizard-document',
  template: `
    
    <button class="btn p-0" (click)="openModal(template)">
        <svg class="icon icon-primary">
            <use xlink:href="/assets/vendor/sprite.svg#it-plus-circle"></use>
        </svg>
    </button>

    <ng-template #template>
      <div class="modal-header">
        <h4 class="modal-title pull-left text-primary" translate><i class="fa fa-info-circle"></i> {{typeId}}</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-primary" (click)="modalRef.hide()">{{'close' | translate}}</button>
      </div>
    </ng-template>
  `
})
export class WizardDocumentModalComponent {

  @Input() objectId;  
  @Input() buttonClass;
  @Input() typeId;
  modalRef: BsModalRef;
  constructor(private modalService: BsModalService) {}
 
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'modal-lg' }));
    return false;
  }
}
