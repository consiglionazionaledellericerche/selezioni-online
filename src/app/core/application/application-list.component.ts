import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonListComponent } from '../../common/controller/common-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder} from '@angular/forms';
import { NavigationService } from '../navigation.service';
import { Application } from './application.model';
import { ApplicationService } from './application.service';
import { TranslateService} from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/model/user.model';
import { CacheService } from '../cache.service';
import { Helpers } from '../../common/helpers/helpers';
import { Observable, of } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalConfirmComponent } from '../../shared/tags/wizard/modal-confirm.component';

@Component({
  selector: 'application-list',
  template:
  `
    <app-layout-title [title]="'application.mine.title'" [titleClass]="'main-title'" [isCollapsable]="'true'" (collapseEvent)="collapse = $event"></app-layout-title>
    <form *ngIf="filterForm" class="clearfix" [formGroup]="filterForm" [ngClass]="{'d-none': collapse, 'd-block': !collapse}">
      <div class="form-row col-md-12">
        <div class="form-group col-md-4">
            <app-control-select-model
                [inline]="true"
                [noLabel]="true"
                [types]="cache.jsonlistCallType"
                [showValidation]="false"
                [allowClear]="true"
                [placeholder]="'call.search.type'| translate"
                [ttip]="'call.search.type'| translate"
                formControlName="type">
            </app-control-select-model>
        </div>
        <div class="form-group col-md-4">
          <div class="btn-group btn-block btn-group-toggle" btnRadioGroup formControlName="filterType">
              <span class="btn btn-primary btn-toggle text-truncate" btnRadio="active" tooltip="{{'call.attivi' | translate}}">{{'call.attivi' | translate}}</span>
              <span class="btn btn-primary btn-toggle text-truncate" btnRadio="expire" tooltip="{{'call.scaduti' | translate}}">{{'call.scaduti' | translate}}</span>
              <span class="btn btn-primary btn-toggle text-truncate" btnRadio="all" tooltip="{{'call.tutti' | translate}}">{{'call.tutti' | translate}}</span>
          </div>
        </div>
        <div class="form-group col-md-4">
            <app-control-text 
                formControlName="callCode"
                [inline]="true"
                type="search"
                [showValidation]="false"
                [prepend]="'cube'"
                [label]="'call.search.code'| translate">
            </app-control-text>
        </div>
      </div>
      <div class="form-row col-md-12">
        <div class="form-group col-md-2">
            <app-control-datepicker
                type="search"
                [inline]="true" 
                [showValidation]="false"
                [label]="'call.search.scadenza.inizio'| translate" 
                [ttip]="'call.search.scadenza.inizio'| translate" 
                formControlName="inizioScadenza">            
            </app-control-datepicker>
        </div>
        <div class="form-group col-md-2">
            <app-control-datepicker
                type="search"
                [inline]="true" 
                [showValidation]="false"
                [label]="'call.search.scadenza.fine'| translate" 
                [ttip]="'call.search.scadenza.fine'| translate" 
                formControlName="fineScadenza">            
            </app-control-datepicker>    
        </div>
        <div class="form-group col-md-8">
          <!--Rounded checkbox buttons-->
          <div class="btn-group btn-block btn-group-toggle" btnRadioGroup formControlName="applicationStatus">
              <span class="btn btn-primary btn-toggle text-truncate" btnRadio="P" tooltip="{{'application.status.temporary' | translate}}">{{'application.status.temporary' | translate}}</span>
              <span class="btn btn-primary btn-toggle text-truncate" btnRadio="C" tooltip="{{'application.status.confirmed' | translate}}">{{'application.status.confirmed' | translate}}</span>
              <span class="btn btn-primary btn-toggle text-truncate" btnRadio="all" tooltip="{{'application.status.all' | translate}}">{{'application.status.all' | translate}}</span>
              <span class="btn btn-primary btn-toggle text-truncate" btnRadio="active" tooltip="{{'application.status.active' | translate}}">{{'application.status.active' | translate}}</span>
              <span class="btn btn-primary btn-toggle text-truncate" btnRadio="excluded" tooltip="{{'application.status.excluded' | translate}}">{{'application.status.excluded' | translate}}</span>
          </div>
        </div>
      </div>
    </form>
    <!-- List -->
    <app-list-layout [loading]="loading" [items]="items" [page]="getPage()" [page_offset]="service.getPageOffset()"
                     [count]="count" (onChangePage)="onChangePage($event)">
      <li *ngFor="let item of items" [ngClass]="listItemClasses()" class="hover-shadow">
        <app-list-item-application [item]="item" [user]="user" (onReopen)="onReopen(item)">
          <div class="col-sm-12 h5">
            <span class="badge" [ngClass]="{'badge-warning' : item.isProvvisoria(), 'badge-success' : !item.isProvvisoria()}">
              <span>{{'application.state.' + item.stato_domanda | translate}}</span>
              <span *ngIf="item.isProvvisoria()">{{'application.date.modified' | translate:{value: item.lastModificationDate| date:'dd/MM/yyyy HH:mm:ss' } }}</span>
              <span *ngIf="!item.isProvvisoria()">{{'application.date.send' | translate:{value: item.data_domanda| date:'dd/MM/yyyy HH:mm:ss' } }}</span>              
            </span>
          </div>
          <div class="col-sm-12">
            <app-show-text [label]="'call.profilo'" [value]="item.call.profilo" [strong]="false"></app-show-text>
          </div>
          <div class="col-sm-12">
            <ng-template #popTemplate>
              <h5 class="font-weight-semibold">
                <svg class="icon icon-secondary"><use xlink:href="/assets/vendor/sprite.svg#it-info-circle"></use></svg> Info
              </h5>
              <hr>
              <div [innerHtml]="translateService.currentLang == 'it'? item.call.descrizione: item.call.descrizione_en"></div>
            </ng-template>      
            <app-show-text 
              [label]="'call.codice'" 
              [value]="item.call.codice">
            </app-show-text>
            <a class="btn btn-sm btn-link p-0 mb-3 ml-n1" [popover]="popTemplate" [outsideClick]="true">
              <svg class="icon icon-xs icon-primary"><use xlink:href="/assets/vendor/sprite.svg#it-info-circle"></use></svg>
            </a>
            <app-show-text [label]="'call.numero_gu'" [value]="item.call.numero_gu" [strong]="false"></app-show-text>
            <app-show-text [label]="'call.data_gu'" [value]="item.call.data_gu | date:'dd/MM/yyyy'" [strong]="false"></app-show-text>
            <app-show-text 
              [label]="'call.data_fine_invio_domande'" 
              [value]="item.call.data_fine_invio_domande | date:'dd/MM/yyyy HH:mm'">
            </app-show-text>
          </div>
          <div class="col-sm-12">
            <app-show-text [label]="'call.elenco_settori_tecnologici'" [value]="item.call.elenco_settori_tecnologici" ></app-show-text>
          </div>  
          <div class="col-sm-12">
            <app-show-text-modal 
              [label]="'call.elenco_titoli_studio'" 
              [value]="translateService.currentLang == 'it'? item.call.requisiti_link: item.call.requisiti_link_en" 
              [modal_title]="'Info'" 
              [modal_text]="translateService.currentLang == 'it'? item.call.requisiti: item.call.requisiti_en"
              [strong]="false">
            </app-show-text-modal>
          </div>
          <div class="col-sm-12 h5" *ngIf="item.isShowEsclusioneRiununcia(user)">
            <span class="badge" [ngClass]="{'badge-warning' : item.isSospesa(), 'badge-danger' : !item.isSospesa()}">
              <span>{{'application.esclusione.' + item.esclusione_rinuncia | translate}}</span>
            </span>
          </div>
        </app-list-item-application>
      </li>
    </app-list-layout>
  `
})
export class ApplicationListComponent extends CommonListComponent<Application> implements OnInit {
  public items: Application[] = [];
  public user: User = null;
  cache: any = {};
  protected applicationStatus: string;
  bsModalRef: BsModalRef;
  public collapse: boolean = true;
  
  public constructor(public service: ApplicationService,
                     private authService: AuthService,
                     private formBuilder: FormBuilder,
                     private cacheService: CacheService,
                     private modalService: BsModalService,
                     protected router: Router,
                     protected route: ActivatedRoute,
                     protected changeDetector: ChangeDetectorRef,
                     protected navigationService: NavigationService,
                     protected translateService: TranslateService) {
    super(service, route, router, changeDetector, navigationService);
    
  }

  public ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.user = Helpers.buildInstance(this.authService.getUser(), User);
    }
    this.cacheService.cache().subscribe((cache) => {
      this.cache = cache;
    });
    super.ngOnInit();
  }

  public beforeOnInit(): Observable<any> {
    this.route.queryParams.subscribe((queryParams) => {
      this.applicationStatus = queryParams['applicationStatus'];
    }); 
    return of(null);
  }

  public setItems(items: Application[]) {
    this.items = items;
  }

  public getItems(): Application[] {
    return this.items;
  }

  public buildFilterForm(): FormGroup {
    return this.formBuilder.group({
      user: new FormControl(this.user.userName),
      fetchCall: new FormControl(true),
      callCode: new FormControl(''),
      filterType: new FormControl('all'),
      type: new FormControl(''),
      inizioScadenza: new FormControl(''),
      fineScadenza: new FormControl(''),
      applicationStatus: new FormControl(this.applicationStatus||'all'),
    });
  }

  public onReopen(application: Application) {
    const initialState = {
      'body': 'message.application.reopen'
    };

    this.bsModalRef = this.modalService.show(ModalConfirmComponent, Object.assign({initialState}, { animated: true, class: 'modal-dialog-centered' }));
    this.bsModalRef.content.confirm.subscribe(() => {
      this.service.reopenApplication(application.objectId).subscribe(result => {
        this.router.navigate(['/manage-application'],
        {
          relativeTo: this.route,
          queryParams: { 
            callId: application.call.getObjectId(), 
            applicationId: application.getObjectId()
          }
        });
      });  
    });
  }

  protected isScrollTopOnPageChange(): boolean {
    return true;
  }

}
