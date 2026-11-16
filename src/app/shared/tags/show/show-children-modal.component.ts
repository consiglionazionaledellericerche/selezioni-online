import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { ModalRef, ModalService } from '../../modal/modal.service';

@Component({
  standalone: false,
  selector: 'app-show-children-modal',
  template: `
    
    <button *ngIf="variant === 'icon'" type="button" class="btn btn-outline-primary btn-sm btn-action" (click)="openModal(template)" [itTooltip]="'attach' | translate">
      <svg class="icon icon-sm icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-clip"></use></svg>
      <span class="visually-hidden">{{ 'attach' | translate }}</span>
    </button>
    <a *ngIf="variant === 'link'" href="javascript:void(0)" class="action-link" (click)="openModal(template)">
      <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-clip"></use></svg>{{ (linkLabel || 'attach') | translate }}
    </a>

    <ng-template #template let-modal>
      <div class="modal-header">
        <h2 class="modal-title h5 no_toc">{{modal_title}}</h2>
        <button #close type="button" class="btn-close" aria-label="Close" (click)="modalRef.hide()">
          <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
        </button>
      </div>
      <div class="modal-body">
         <children-list [show_date]="show_date" [parentId]="parentId" [typeId]="typeId" [queryName]="queryName"></children-list>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-primary" (click)="modalRef.hide()">{{'close' | translate}}</button>
      </div>
    </ng-template>
  `
})
export class ShowChildrenModalComponent {
  /** 'icon' = pulsante quadrato con sola icona; 'link' = voce di elenco con icona e testo. */
  @Input() variant: 'icon' | 'link' = 'icon';
  @Input() linkLabel: string;


  @Input() parentId;  
  @Input() buttonClass = 'text-dark p-1';
  @Input() label;
  @Input() value;
  @Input() typeId;
  @Input() queryName;
  @Input() modal_title;
  @Input() show_date = 'false';
  @ViewChild('close', {static: true}) close: ElementRef;
  modalRef: ModalRef;

  constructor(private modalService: ModalService) {}
 
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'modal-xl' }));      
    return false;
  }

}
