import { ChangeDetectorRef, Component, OnDestroy, ViewChildren } from '@angular/core';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ManageDocumentComponent } from '../../core/document/manage-document.component';
import { Document } from '../../common/model/document.model';
import { ChildrenListComponent } from '../../core/children/children-list.component';
import { ApiMessageService, MessageType } from '../../core/api-message.service';
import { TranslateService } from '@ngx-translate/core';
import { Application } from '../../core/application/application.model';
import { ApplicationService } from '../../core/application/application.service';
import { Subscription } from 'rxjs';
import { LoadingState } from '../../auth/loading-state.enum';

@Component({
    selector: 'affix_tabAllegati',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded() && cache !== undefined" class="pb-2">
        <accordion [isAnimated]="true" [closeOthers]="true" class="shadow">
          <ng-container *ngFor="let attachment of data.call[callProperty]">
            <accordion-group #accordionGroup panelClass="border border-light no-after">
              <div class="d-flex" accordion-heading>
                <h4 class="p-1 text-truncate text-primary" translate>{{attachment}}</h4>
                <span class="badge badge-pill badge-outline-primary d-table ml-n1" [ngClass]="{'badge-outline-danger': childrenlist.count === 0}">{{childrenlist.count}}</span>
                <div class="mr-auto p-1 h4">
                  <button class="btn p-0" [popover]="'new'| translate" triggers="mouseenter:mouseleave" (click)="openModalWithComponent($event, accordionGroup, data.objectId, attachment)">
                    <svg class="icon icon-primary">
                      <use xlink:href="/assets/vendor/sprite.svg#it-plus-circle"></use>
                    </svg>
                  </button>
                </div>
                <div *ngIf="isPrintDicSost(attachment) || isPrintTrattamentoDatiPersonali(attachment)" class="p-1 h4">
                  <button 
                    (click)="printDicSost($event, accordionGroup)"
                    [disabled]="loadingStateDicSost.isStarting()" 
                    *ngIf="isPrintDicSost(attachment)"
                    class="btn btn-link btn-icon p-0" 
                    [popover]="'application.print.dic_sost.popover'| translate" triggers="mouseenter:mouseleave">
                    <span class="pr-1 w-100 text-right d-none d-md-block h6" translate>application.print.dic_sost.button</span>
                    <svg *ngIf="!loadingStateDicSost.isStarting()" class="icon icon-danger h4 "><use xlink:href="/assets/vendor/sprite.svg#it-print"></use></svg>              
                    <div *ngIf="loadingStateDicSost.isStarting()" class="progress-spinner progress-spinner-double size-sm progress-spinner-active">
                      <div class="progress-spinner-inner"></div>
                      <div class="progress-spinner-inner"></div>
                    </div>
                  </button>
                  <button 
                    (click)="printTrattamentoDatiPersonali($event, accordionGroup)" 
                    *ngIf="isPrintTrattamentoDatiPersonali(attachment)"
                    [disabled]="loadingStateDatiPersonali.isStarting()" 
                    class="btn btn-link btn-icon p-0" 
                    [popover]="'application.print.trattamento_dati_personali.popover'| translate" triggers="mouseenter:mouseleave">
                    <span class="pr-1 w-100 text-right d-none d-md-block h6" translate>application.print.trattamento_dati_personali.button</span>
                    <svg *ngIf="!loadingStateDatiPersonali.isStarting()" class="icon icon-danger h4 "><use xlink:href="/assets/vendor/sprite.svg#it-print"></use></svg>              
                    <div *ngIf="loadingStateDatiPersonali.isStarting()" class="progress-spinner progress-spinner-double size-sm progress-spinner-active">
                      <div class="progress-spinner-inner"></div>
                      <div class="progress-spinner-inner"></div>
                    </div>
                  </button>
                </div>
                <div class="p-1">
                  <div class="float-right pull-right">
                    <svg class="icon icon-primary">
                      <use *ngIf="!accordionGroup.isOpen" xlink:href="/assets/vendor/sprite.svg#it-expand"></use>
                      <use *ngIf="accordionGroup.isOpen" xlink:href="/assets/vendor/sprite.svg#it-collapse"></use>
                    </svg>
                  </div>                
                </div>
              </div>
              <children-list #childrenlist [show_date]="true" [parentId]="data.objectId" [typeId]="attachment"></children-list>
            </accordion-group>
          </ng-container>  
        </accordion>
      </form>
    `
  })
export class JcononAffixAllegatiComponent extends DynamicComponent<Application> implements OnDestroy{

  constructor(
      protected applicationService: ApplicationService,
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
      private modalService: BsModalService,
      protected apiMessageService: ApiMessageService,
      protected translateService: TranslateService
    ) {
      super(cacheService, changeDetectorRef);
      this.subscription = this.apiMessageService.loadingEvent$.subscribe((loadingState: LoadingState) => {
        if (loadingState.url) {
          if (loadingState.url.indexOf('dichiarazione_sostitutiva') !== -1) {
            this.loadingStateDicSost = loadingState;
          }
          if (loadingState.url.indexOf('print_trattamento_dati_personali') !== -1) {
            this.loadingStateDatiPersonali = loadingState;
          }
        }
      });  
    }
    cache: any;
    public callProperty: string;
    bsModalRef: BsModalRef;
    public upload: boolean = true;
    @ViewChildren('childrenlist') childrenListComponent: ChildrenListComponent[];
    subscription: Subscription;
    loadingStateDicSost: LoadingState = LoadingState.DEFAULT;
    loadingStateDatiPersonali: LoadingState = LoadingState.DEFAULT;
  
    ngOnInit(): void {
      this.cacheService.cache().subscribe((cache) => {
        this.cache = cache;
      });      
      super.ngOnInit();
    }
    
    public isPrintTrattamentoDatiPersonali(section: string) {
      return this.data.call.print_trattamento_dati_personali && section === 'D:jconon_attachment:trattamento_dati_personali';
    }

    public isPrintDicSost(section: string) {
      return this.data.call.print_dic_sost && section === 'D:jconon_dic_sost:attachment';
    }
    
    printDicSost(event: any, accordion: any) {
      event.stopPropagation(); 
      event.preventDefault(); 
      if (!accordion.isOpen) {
        accordion.toggleOpen();
      }
      this.applicationService.getBlob(
        '/rest/application/dichiarazione_sostitutiva?applicationId=' + this.data.objectId, 
        'Dichiarazione sostitutiva.pdf'
      );
      return false;
    }

    printTrattamentoDatiPersonali(event: any, accordion: any) {
      event.stopPropagation(); 
      event.preventDefault(); 
      if (!accordion.isOpen) {
        accordion.toggleOpen();
      }
      this.applicationService.getBlob(
        '/rest/application/print_trattamento_dati_personali?applicationId=' + this.data.objectId, 
        'Trattamento Dati Personali.pdf'
      );
      return false;
    }

    openModalWithComponent(event: any, accordion: any, parentId: string, typeId: string): boolean { 
      event.stopPropagation(); 
      event.preventDefault(); 
      if (!accordion.isOpen) {
        accordion.toggleOpen();
      }
      const initialState = {
        parentId: parentId,
        typeId: typeId,
        upload: this.upload
      };

      this.bsModalRef = this.modalService.show(ManageDocumentComponent, Object.assign({initialState}, { animated: true, class: 'modal-lg' }));
      this.bsModalRef.content.event.subscribe((document: Document) => {
        this.translateService.get('message.document.upload.success', {value: document.name}).subscribe((label) => {
          this.apiMessageService.sendMessage(MessageType.SUCCESS, label);
        });
        this.childrenListComponent.forEach(comp => comp.loadList());
      });
      return false; 
    }

    ngOnDestroy() {
      this.subscription.unsubscribe();
    }  
}
