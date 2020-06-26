import {Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {CmisObject} from '../../../common/model/cmisobject.model';
import {AllowableAction} from '../../../common/model/allowableaction.enum';

@Component({
  selector: 'app-button-delete',
  template: `
    <button type="button"
            class="btn btn-danger btn-sm" [ngClass]="classes"
            [disabled]="!canDelete()"
            (click)="openModal(template)"
            [ngStyle]="style"
    >
      <i class="fa fa-trash"></i> <span *ngIf="showLabel"> {{ 'delete' | translate }}</span>
    </button>

    <ng-template #template>
      <div class="modal-header">
        <h4 class="modal-title pull-left">Attenzione</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        Vuoi confermare l'eliminazione di <strong>{{ entity.getLabel() }}</strong>?
        <div class="container text-center mt-2">
          <button class="btn btn-danger btn-sm"
                  [disabled]="disable"
                  (click)="onConfirm()"
          >
            Conferma
          </button>
        </div>
     </div>
    </ng-template>
  `
})
export class ButtonDeleteComponent {

  @Input() disable = false;

  @Input() entity: CmisObject;

  @Input() style = {};

  @Input() classes = {};

  @Input() showLabel = false;

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

  canDelete() {
    return this.entity.hasAllowableActions(AllowableAction.CAN_DELETE_OBJECT);
  }

}

