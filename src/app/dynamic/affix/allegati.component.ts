import { ChangeDetectorRef, Component, OnDestroy, ViewChildren } from '@angular/core';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { ModalRef, ModalService } from '../../shared/modal/modal.service';
import { ManageDocumentComponent } from '../../core/document/manage-document.component';
import { Document } from '../../common/model/document.model';
import { ChildrenListComponent } from '../../core/children/children-list.component';
import { ApiMessageService, MessageType } from '../../core/api-message.service';
import { TranslateService } from '@ngx-translate/core';
import { Application } from '../../core/application/application.model';
import { ApplicationService } from '../../core/application/application.service';
import { Subscription } from 'rxjs';
import { LoadingState } from '../../auth/loading-state.enum';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { ConfigService } from '../../core/config.service';

@Component({
  standalone: false,
    selector: 'affix_tabAllegati',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded() && cache !== undefined" class="pb-2">
        <app-accordion [isAnimated]="true" [closeOthers]="true" class="shadow">
          <ng-container *ngFor="let attachment of data.call[callProperty]">
            <app-accordion-group #accordionGroup panelClass="border border-light no-after">
              <div class="d-flex align-items-start" accordion-heading>
                <h4 #title class="p-1 text-truncate text-primary" [attr.title]="attachment | translate" translate>{{attachment}}</h4>
                <span class="badge rounded-pill badge-outline-primary d-table ms-n1" [ngClass]="{'badge-outline-danger': childrenlist.count === 0}">{{childrenlist.count}}</span>
                <span *ngIf="uploaded[attachment]" class="badge rounded-pill bg-success upload-ok ms-2 align-self-center" role="status">
                  <svg class="icon icon-xs icon-white me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-check"></use></svg>{{ 'message.document.uploaded' | translate }}
                </span>
                <div class="me-auto p-1 h4">
                  <button *ngIf="data.objectId" class="btn p-0" [itPopover]="'new'| translate" popoverTrigger="hover" (click)="openModalWithComponent($event, accordionGroup, data.objectId, attachment)">
                    <svg class="icon icon-success">
                      <use href="/bootstrap-italia/dist/svg/sprites.svg#it-plus-circle"></use>
                    </svg>
                  </button>
                </div>
                <div *ngIf="isPagopa(attachment) && pagopa" class="p-1 pagopa d-flex flex-wrap align-items-center justify-content-end gap-2">
                  <span *ngIf="pagopa.importo" class="small text-secondary">{{ 'pagopa.amount' | translate }} <strong>{{ pagopa.importo | currency:'EUR':'symbol':'1.2-2':'it' }}</strong></span>
                  <span *ngIf="isPagato()" class="badge bg-success" role="status">{{ 'pagopa.paid' | translate }}</span>
                  <ng-container *ngIf="!isPagato()">
                    <button type="button" class="btn btn-outline-primary btn-xs" [disabled]="pagopaBusy" (click)="scaricaAvviso($event, accordionGroup)">
                      <svg class="icon icon-sm icon-primary me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-download"></use></svg>{{ 'pagopa.notice' | translate }}
                    </button>
                    <button type="button" class="btn btn-primary btn-xs" [disabled]="pagopaBusy" (click)="pagaOnline($event)">
                      <svg class="icon icon-sm icon-white me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-card"></use></svg>{{ 'pagopa.pay' | translate }}
                    </button>
                  </ng-container>
                </div>
                <div *ngIf="isPrintDicSost(attachment) || isPrintTrattamentoDatiPersonali(attachment)" class="p-1 h4">
                  <button 
                    (click)="printDicSost($event, accordionGroup)"
                    [disabled]="loadingStateDicSost.isStarting()" 
                    *ngIf="data.objectId && isPrintDicSost(attachment)"
                    class="btn btn-link btn-icon p-0" 
                    [itPopover]="'application.print.dic_sost.popover'| translate" popoverTrigger="hover">
                    <span class="pe-1 w-100 text-end d-none d-md-block h6" translate>application.print.dic_sost.button</span>
                    <svg *ngIf="!loadingStateDicSost.isStarting()" class="icon icon-danger h4 "><use href="/bootstrap-italia/dist/svg/sprites.svg#it-print"></use></svg>              
                    <div *ngIf="loadingStateDicSost.isStarting()" class="progress-spinner progress-spinner-double size-sm progress-spinner-active">
                      <div class="progress-spinner-inner"></div>
                      <div class="progress-spinner-inner"></div>
                    </div>
                  </button>
                  <button 
                    (click)="printTrattamentoDatiPersonali($event, accordionGroup)" 
                    *ngIf="data.objectId && isPrintTrattamentoDatiPersonali(attachment)"
                    [disabled]="loadingStateDatiPersonali.isStarting()" 
                    class="btn btn-link btn-icon p-0" 
                    [itPopover]="'application.print.trattamento_dati_personali.popover'| translate" popoverTrigger="hover">
                    <span class="pe-1 w-100 text-end d-none d-md-block h6" translate>application.print.trattamento_dati_personali.button</span>
                    <svg *ngIf="!loadingStateDatiPersonali.isStarting()" class="icon icon-danger h4 "><use href="/bootstrap-italia/dist/svg/sprites.svg#it-print"></use></svg>              
                    <div *ngIf="loadingStateDatiPersonali.isStarting()" class="progress-spinner progress-spinner-double size-sm progress-spinner-active">
                      <div class="progress-spinner-inner"></div>
                      <div class="progress-spinner-inner"></div>
                    </div>
                  </button>
                </div>
              </div>
              <div *ngIf="isPagopa(attachment) && pagopa && !isPagato()" class="alert alert-info small mx-3 mt-2" role="note">
                {{ 'pagopa.info' | translate }}
                <span *ngIf="pagopa.numeroAvviso"> {{ 'pagopa.notice_number' | translate }} <strong>{{ pagopa.numeroAvviso }}</strong>.</span>
              </div>
              <children-list #childrenlist [show_date]="true" [parentId]="data.objectId" [typeId]="attachment"></children-list>
            </app-accordion-group>
          </ng-container>  
        </app-accordion>
      </form>
    `
  })
export class JcononAffixAllegatiComponent extends DynamicComponent<Application> implements OnDestroy{

  constructor(
      protected applicationService: ApplicationService,
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
      private modalService: ModalService,
      protected apiMessageService: ApiMessageService,
      protected translateService: TranslateService,
      private http: HttpClient,
      private configService: ConfigService
    ) {
      super(cacheService, changeDetectorRef);
      this.subscription = this.apiMessageService.loadingEvent$.subscribe((loadingState: LoadingState) => {
        if (loadingState.url) {
          if (loadingState.url.indexOf('dichiarazione-sostitutiva') !== -1) {
            this.loadingStateDicSost = loadingState;
          }
          if (loadingState.url.indexOf('trattamento-dati-personali') !== -1) {
            this.loadingStateDatiPersonali = loadingState;
          }
        }
      });  
    }
    cache: any;
    public callProperty: string;
    bsModalRef: ModalRef;
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
      this.loadPagopa();
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
        '/openapi/v1/application/print/dichiarazione-sostitutiva?applicationId=' + encodeURIComponent(this.data.objectId), 
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
        '/openapi/v1/application/print/trattamento-dati-personali?applicationId=' + encodeURIComponent(this.data.objectId), 
        'Trattamento Dati Personali.pdf'
      );
      return false;
    }

    /** Tipi di allegato appena caricati (badge "Caricato" temporaneo). */
    public uploaded: { [type: string]: any } = {};

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
        // conferma visibile anche accanto al tipo di allegato, per qualche secondo
        this.uploaded[typeId] = document.name || true;
        setTimeout(() => delete this.uploaded[typeId], 8000);
        this.childrenListComponent.forEach(comp => comp.loadList());
      });
      return false; 
    }

    /* ---------------- pagoPA: diritti di segreteria ---------------- */

    public static readonly PAGOPA_TYPE = 'D:jconon_pagamenti_diritti_segreteria:attachment';
    public pagopa: { abilitato?: boolean, importo?: any, numeroAvviso?: string, stato?: string };
    public pagopaBusy = false;

    /** Sezione dei pagamenti con pagoPA attivo nel bando e domanda già salvata. */
    isPagopa(attachment: string): boolean {
      return attachment === JcononAffixAllegatiComponent.PAGOPA_TYPE && !!this.data?.call?.pagamento_pagopa && !!this.data?.objectId;
    }

    isPagato(): boolean {
      return !!this.pagopa?.stato && ['ESEGUITA', 'ESEGUITO', 'PAGATA'].includes(String(this.pagopa.stato).toUpperCase());
    }

    private loadPagopa(): void {
      if (!this.data?.call?.pagamento_pagopa || !this.data?.objectId) {
        return;
      }
      this.configService.getApiBase().pipe(
        switchMap(apiBase => this.http.get<any>(apiBase + '/v1/application/' + encodeURIComponent(this.data.objectId) + '/pagopa'))
      ).subscribe(result => this.pagopa = result, () => this.pagopa = { abilitato: true });
    }

    /** Avviso di pagamento in PDF (la pendenza viene creata al primo download). */
    scaricaAvviso(event: any, accordion: any): void {
      event.stopPropagation();
      event.preventDefault();
      if (!accordion.isOpen) {
        accordion.toggleOpen();
      }
      this.pagopaBusy = true;
      this.configService.getApiBase().pipe(
        switchMap(apiBase => this.http.get(apiBase + '/v1/application/' + encodeURIComponent(this.data.objectId) + '/pagopa/avviso',
          { responseType: 'blob' }))
      ).subscribe(blob => {
        this.pagopaBusy = false;
        saveAs(blob, 'Avviso pagoPA.pdf');
        this.loadPagopa();
      }, error => {
        this.pagopaBusy = false;
        this.pagopaError(error);
      });
    }

    /** Pagamento online sul portale pagoPA, con ritorno a questa pagina della domanda. */
    pagaOnline(event: any): void {
      event.stopPropagation();
      event.preventDefault();
      this.pagopaBusy = true;
      this.configService.getApiBase().pipe(
        switchMap(apiBase => this.http.get<{ redirect: string }>(apiBase + '/v1/application/' + encodeURIComponent(this.data.objectId) + '/pagopa/paga',
          { params: new HttpParams().set('returnUrl', window.location.href) }))
      ).subscribe(result => {
        if (result?.redirect) {
          window.location.href = result.redirect;
        } else {
          this.pagopaBusy = false;
        }
      }, error => {
        this.pagopaBusy = false;
        this.pagopaError(error);
      });
    }

    /** Messaggio restituito da GovPay o dal backend (anche quando la risposta attesa era un PDF). */
    private pagopaError(error: HttpErrorResponse): void {
      const show = (message: string) => this.apiMessageService.sendMessage(MessageType.ERROR,
        message || this.translateService.instant('pagopa.error'));
      if (error.error instanceof Blob) {
        error.error.text().then(text => {
          try {
            show(JSON.parse(text).message);
          } catch (e) {
            show(null);
          }
        });
      } else {
        show(error.error?.message);
      }
    }
  
    ngOnDestroy() {
      this.subscription.unsubscribe();
    }  
}
