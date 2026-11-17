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
     <div *ngIf="item" class="doc-row">
        <div class="doc-content">
          <ng-content></ng-content>
        </div>
        <div class="doc-actions" role="group" [attr.aria-label]="'actions' | translate">
          <button type="button" class="doc-action" [disabled]="!item.hasId()"
              (click)="openModalWithComponent(item)" [itTooltip]="'show' | translate" [attr.aria-label]="'show' | translate">
            <svg class="icon icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-password-visible"></use></svg>
          </button>
          <button type="button" class="doc-action" *ngIf="item.canEdit()" [disabled]="!item.hasId()"
              (click)="edit(item)" [itTooltip]="'edit' | translate" [attr.aria-label]="'edit' | translate">
            <svg class="icon icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-pencil"></use></svg>
          </button>
          <button type="button" class="doc-action doc-action-danger" *ngIf="item.canDelete()" [disabled]="!item.hasId()"
              (click)="delete(item)" [itTooltip]="'delete' | translate" [attr.aria-label]="'delete' | translate">
            <svg class="icon icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-delete"></use></svg>
          </button>
        </div>
    </div>
    `,
  styles: [`
    .doc-row { display: flex; align-items: center; gap: 1rem; padding: .85rem 0; }
    .doc-content { flex: 1; min-width: 0; }
    .doc-actions { display: flex; gap: .25rem; flex-shrink: 0; }
    .doc-action { display: inline-flex; align-items: center; justify-content: center; width: 2.25rem; height: 2.25rem;
      border: 0; border-radius: 6px; background: transparent; }
    .doc-action .icon { fill: #5d7083; }
    .doc-action:hover:not(:disabled), .doc-action:focus-visible { background: #e6f0fa; }
    .doc-action:hover:not(:disabled) .icon, .doc-action:focus-visible .icon { fill: #0066cc; }
    .doc-action-danger:hover:not(:disabled), .doc-action-danger:focus-visible { background: #fdecee; }
    .doc-action-danger:hover:not(:disabled) .icon, .doc-action-danger:focus-visible .icon { fill: #d9364f; }
    .doc-action:disabled { opacity: .4; }
  `]
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
