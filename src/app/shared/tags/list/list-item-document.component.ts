import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Document } from '../../../common/model/document.model';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ShowMetadataComponent } from '../show/show-metadata.component';
import { CmisObject } from '../../../common/model/cmisobject.model';

@Component({
  selector: 'app-list-item-document',
  template:
     `
     <div *ngIf="item">
         <div class="row pt-2 pb-2">
           <ng-content></ng-content>

           <a class="ddd" aria-haspopup="true" role="button" tabIndex="0">
            <div class="btn-group border rounded" role="group" dropdown [ngStyle]="buttonStyle()">
              <button class="btn text-dark p-2" [disabled]="!item.hasId()"
                  (click)="openModalWithComponent(item)" tooltip="{{'show' | translate}}">
                  <i class="fa fa-fw fa-eye text-primary"></i>
              </button>
              <button class="btn text-primary p-2" *ngIf="item.canEdit()" [disabled]="!item.hasId()"
                  (click)="edit(item)" tooltip="{{'edit' | translate}}">
                  <i class="fa fa-fw fa-edit text-primary"></i>
              </button>
              <button class="btn text-danger p-2" *ngIf="item.canDelete()" [disabled]="!item.hasId()"
                  (click)="delete(item)" tooltip="{{'delete' | translate}}">
                  <i class="fa fa-fw fa-trash text-danger"></i>
              </button>
        
              <button id="button-basic" dropdownToggle class="btn text-dark p-2" aria-controls="button-animated" tooltip="{{'more.actions' | translate}}">
                <i class="fa fa-fw fa-ellipsis-v"></i>
              </button>
              <ul id="dropdown-basic" *dropdownMenu class="dropdown-menu dropdown-menu-right border" role="menu" aria-labelledby="button-animated">
                  <li role="menuitem"><a class="dropdown-item" href="#">Action</a></li>
                  <li role="menuitem"><a class="dropdown-item" href="#">Another action</a></li>
                  <li role="menuitem"><a class="dropdown-item" href="#">Something else here</a></li>
                  <li class="divider dropdown-divider"></li>
                  <li role="menuitem"><a class="dropdown-item" href="#">Separated link</a></li>
              </ul>
            </div>
          </a>
    </div>
    `,
  styles:
      [
        '.ddd { display: none; }',
        'div.row:hover .ddd, div.row:active .ddd, div.row:focus .ddd { display: block; }',
        '.dropdown-menu:before { left: unset; right: 11px;border-left:1px solid #b1b1b3 !important; border-top: 1px solid #b1b1b3 !important; top: -10px}'
      ]
})
export class ListItemDocumentComponent {

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private modalService: BsModalService
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
  
  bsModalRef: BsModalRef;

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
