import {Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-button-confirm',
  template: `
    <button type="button"
            class="btn" [ngClass]="classes"
            (click)="openModal(template)"
            [ngStyle]="style">
      <i *ngIf="fa" class="fa fa-{{fa}}"></i> <span *ngIf="showLabel"> {{ buttonLabel | translate }}</span>
    </button>

    <ng-template #template>
      <div class="modal-header">
        <h4 class="modal-title pull-left text-info"><i class="fa fa-info-circle"></i>  {{'modal.title.confirm'|translate}}</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" innerHtml="{{body}}"></div>
      <div class="modal-footer">
        <div class="container">
          <div class="row mt-2">
            <div class="col-md-6">
              <button class="btn btn-outline-danger btn-block"
                (click)="modalRef.hide()">
                {{'button.cancel'|translate}}
              </button>
            </div>
            <div class="col-md-6">
              <button class="btn btn-outline-primary btn-block"
                      [disabled]="disable"
                      (click)="onConfirm()">
                {{'button.confirm'|translate}}
              </button>
            </div>  
          </div>
        </div>  
     </div>
    </ng-template>
  `
})
export class ButtonConfirmComponent {

  @Input() disable = false;

  @Input() style = {};

  @Input() classes = {};

  @Input() showLabel = false;

  @Input() body: string = '';

  @Input() fa: string;

  @Input() buttonLabel: string = 'confirm.button';

  @Output() confirm = new EventEmitter();

  modalRef: BsModalRef;

  constructor(private modalService: BsModalService) {}

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {'class': 'modal-dialog-centered'});
  }

  onConfirm() {
    this.confirm.emit();
    this.modalRef.hide();
  }

}
