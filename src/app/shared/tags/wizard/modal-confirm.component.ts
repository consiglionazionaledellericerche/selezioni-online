import {Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-confirm',
  template: `

      <div class="modal-header border-bottom">
        <h4 class="modal-title pull-left text-warning pb-2"><i class="fa fa-info-circle"></i>  {{'modal.title.confirm'|translate}}</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" innerHtml="{{body | translate}}"></div>
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
      private modalService: BsModalService,
      public modalRef: BsModalRef
  ) {}

  onConfirm() {
    this.confirm.emit();
    this.modalRef.hide();
  }

}
