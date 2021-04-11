import { ChangeDetectorRef, Component, ComponentFactoryResolver, Input } from '@angular/core';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ManageDocumentComponent } from '../../core/document/manage-document.component';
import { Document } from '../../common/model/document.model';

@Component({
    selector: 'affix_tabAllegati',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded() && cache !== undefined" class="pb-2">
        <accordion [isAnimated]="true" [closeOthers]="true" class="shadow">
          <ng-container *ngFor="let attachment of data.call[callProperty]">
            <accordion-group #accordionGroup panelClass="border border-light no-after">
              <div class="d-flex" accordion-heading>
                <h4 class="p-1 text-truncate text-primary" translate>{{attachment}}</h4>
                <div class="p-1 h4">
                  <button class="btn p-0" (click)="openModalWithComponent($event, accordionGroup, data.objectId, attachment)">
                    <svg class="icon icon-primary">
                      <use xlink:href="/assets/vendor/sprite.svg#it-plus-circle"></use>
                    </svg>
                  </button>
                </div>
                <div class="ml-auto p-1">
                  <h4 class="float-right pull-right">
                    <svg class="icon icon-primary">
                      <use *ngIf="!accordionGroup.isOpen" xlink:href="/assets/vendor/sprite.svg#it-expand"></use>
                      <use *ngIf="accordionGroup.isOpen" xlink:href="/assets/vendor/sprite.svg#it-collapse"></use>
                    </svg>
                  </h4>                
                </div>
              </div>
              <children-list [show_date]="true" [parentId]="data.objectId" [typeId]="attachment"></children-list>
            </accordion-group>
          </ng-container>  
        </accordion>
      </form>
    `
  })
export class JcononAffixAllegatiComponent extends DynamicComponent<Document> {

  constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
      private modalService: BsModalService,
      private componentFactoryResolver: ComponentFactoryResolver
    ) {
      super(cacheService, changeDetectorRef);
    }
    cache: any;
    public callProperty: string;
    bsModalRef: BsModalRef;
    
    ngOnInit(): void {
      this.cacheService.cache().subscribe((cache) => {
        this.cache = cache;
      });
      super.ngOnInit();
    }
    
    openModalWithComponent(event: any, accordion: any, parentId: string, typeId: string): boolean { 
      event.stopPropagation(); 
      event.preventDefault(); 
      if (!accordion.isOpen) {
        accordion.toggleOpen();
      }
      const initialState = {
        parentId: parentId,
        typeId: typeId
      };

      this.bsModalRef = this.modalService.show(ManageDocumentComponent, Object.assign({initialState}, { animated: true, class: 'modal-lg' }));
      return false; 
    }
}