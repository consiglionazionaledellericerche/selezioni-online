import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Document } from '../../../common/model/document.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalRef, ModalService } from '../../modal/modal.service';
import { ShowMetadataComponent } from '../show/show-metadata.component';
import { CmisObject } from '../../../common/model/cmisobject.model';

@Component({
  standalone: false,
  selector: 'app-list-item-document',
  template:
     `
     <div *ngIf="item">
        <div class="row pt-2 pb-2" tabindex="0">
          <ng-content></ng-content>

          <a class="ddd" aria-haspopup="true" role="button">
            <div class="btn-group border rounded" role="group" [ngStyle]="buttonStyle()">
              <button class="btn text-dark p-2" [disabled]="!item.hasId()"
                  (click)="openModalWithComponent(item)" [itTooltip]="'show' | translate">
                  <i class="fa fa-fw fa-eye text-primary"></i>
              </button>
              <button class="btn text-primary p-2" *ngIf="item.canEdit()" [disabled]="!item.hasId()"
                  (click)="edit(item)" [itTooltip]="'edit' | translate">
                  <i class="fa fa-fw fa-edit text-primary"></i>
              </button>
              <button class="btn text-danger p-2" *ngIf="item.canDelete()" [disabled]="!item.hasId()"
                  (click)="delete(item)" [itTooltip]="'delete' | translate">
                  <i class="fa fa-fw fa-trash text-danger"></i>
              </button>
            </div>
          </a>
        </div>
    </div>
    `,
  styles:
      [
        '.ddd { display: none; }',
        '.row:hover .ddd, .row:active .ddd, .row:focus .ddd { display: block; }',
      ]
})
export class ListItemDocumentComponent {

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private modalService: ModalService
  ) {}

  @Input() item: Document = null;

  @Input() showRoute = 'show/';

  @Input() editRoute = 'edit/';

  @Input() deleteRoute = 'delete/';

  @Input() editValiditaRoute = 'editvalidita/';

  @Input() hasEditValidita = false;

  @Input() noEdit = false;

  @Output() onDelete = new EventEmitter();

  @Output() onEdit = new EventEmitter();

  @Input() filterForm;

  @Input() page;
  
  bsModalRef: ModalRef;

  public navigateShow() {
    this.router.navigate([this.showRoute + this.item.getObjectId()],
      {
        relativeTo: this.route,
        queryParams: { page: 'prova'}
      });
  }

  buttonStyle() {
    return {
      'position': 'absolute',
      'top': '5px',
      'right': '5px',
      'background-color': '#FEFEFE',
    };
  }

  delete(cmisObject: CmisObject) {
    this.onDelete.emit(cmisObject);
  }

  edit(cmisObject: CmisObject) {
    this.onEdit.emit(cmisObject);
  }

  openModalWithComponent(cmisObject: CmisObject) {
    const initialState = {
      cmisObject: cmisObject
    };
    this.bsModalRef = this.modalService.show(ShowMetadataComponent, Object.assign({initialState}, { class: 'modal-lg' }));
    return false;
  }
}
