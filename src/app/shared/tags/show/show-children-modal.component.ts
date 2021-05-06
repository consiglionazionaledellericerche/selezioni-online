import {Component, ElementRef, Input, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-show-children-modal',
  template: `
    
    <button class="btn {{buttonClass}}" (click)="openModal(template)" tooltip="{{'attach' | translate}}">
      <svg class="icon">
        <use xlink:href="/assets/vendor/sprite.svg#it-download"></use>
      </svg>
    </button>

    <ng-template #template let-modal>
      <div class="modal-header">
        <h4 class="modal-title pull-left text-primary"><i class="fa fa-info-circle"></i> {{modal_title}}</h4>
        <button #close type="button" class="close pull-right" aria-label="Close" (click)="modal.dismiss()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
         <children-list [show_date]="show_date" [parentId]="parentId" [typeId]="typeId" [queryName]="queryName"></children-list>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-primary" (click)="modal.dismiss()">{{'close' | translate}}</button>
      </div>
    </ng-template>
  `
})
export class ShowChildrenModalComponent {

  @Input() parentId;  
  @Input() buttonClass = 'text-dark p-1';
  @Input() label;
  @Input() value;
  @Input() typeId;
  @Input() queryName;
  @Input() modal_title;
  @Input() show_date = 'false';
  @ViewChild('close', {static: true}) close: ElementRef;

  constructor(private modalService: NgbModal) {}
 
  openModal(template: TemplateRef<any>) {
    this.modalService.open(template, {ariaLabelledBy: 'modal-basic-title', size: 'xl'});
    return false;
  }

}
