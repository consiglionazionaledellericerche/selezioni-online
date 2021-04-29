import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-info',
  template: `

      <div class="modal-header border-bottom">
        <h4 class="modal-title pull-left text-primary pb-2" translate><i class="fa fa-info-circle"></i> modal.title.info</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="onClose()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" innerHtml="{{body | translate}}"></div>
      <div class="modal-footer">
        <div class="container">
          <div class="row mt-2">
            <div class="col">
              <button class="btn btn-outline-primary btn-block"
                      [disabled]="disable"
                      (click)="onClose()">
                {{'button.ok'|translate}}
              </button>
            </div>  
          </div>
        </div>  
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
      public modalRef: BsModalRef
  ) {}

  onClose() {
    this.close.emit();
    this.modalRef.hide();
  }
  
  ngOnDestroy(){
    this.close.next(); 
  }
}
