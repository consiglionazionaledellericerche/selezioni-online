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
import { ModalRef, ModalService } from '../../shared/modal/modal.service';
import { ModalConfirmComponent } from '../../shared/tags/wizard/modal-confirm.component';
import { CopyApplicationComponent } from './copy-application.component';

@Component({
  standalone: false,
  selector: 'application-list',
  template:
  `
    <app-layout-title [title]="'layout.applications_mine_title'" [subTitle]="'layout.applications_mine_subtitle'"></app-layout-title>
    <app-application-summary *ngIf="filterForm" class="d-block mt-4" scope="mine" layout="tiles"
      [active]="filterForm.value.applicationStatus" [filters]="filterForm.value" [service]="service"
      (selected)="filterForm.controls['applicationStatus'].setValue($event)"></app-application-summary>
    <div class="row mt-4" *ngIf="filterForm">
      <aside class="col-lg-3 mb-4">
        <div class="filters-sticky">
          <form class="filters card shadow-sm rounded p-3" [formGroup]="filterForm" role="search">
            <div class="form-group mb-4">
              <app-control-text formControlName="callCode" [inline]="true" type="search" [showValidation]="false"
                [label]="'call.search.code'| translate"></app-control-text>
            </div>
            <h2 class="filters-title">{{ 'layout.call_state' | translate }}</h2>
            <app-segmented class="d-block mb-4" [options]="callStates" formControlName="filterType"></app-segmented>
            <app-sort-control class="d-block mb-4" [form]="filterForm" [options]="sortOptions"></app-sort-control>
            <h2 class="filters-title">{{ 'layout.filter_application_state' | translate }}</h2>
            <app-segmented class="d-block mb-4" [vertical]="true" [options]="applicationStates" formControlName="applicationStatus"></app-segmented>
            <h2 class="filters-title">{{ 'layout.call_type' | translate }}</h2>
            <div class="form-group mb-4">
              <app-control-select-model [inline]="true" [noLabel]="true" [types]="cache.jsonlistCallType" [showValidation]="false"
                [allowClear]="true" [placeholder]="'call.search.type'| translate" formControlName="type">
              </app-control-select-model>
            </div>
            <h2 class="filters-title">{{ 'layout.filter_deadline' | translate }}</h2>
            <div class="form-group mb-3">
              <app-control-datepicker type="search" [inline]="true" [showValidation]="false"
                [label]="'call.search.scadenza.inizio'| translate" formControlName="inizioScadenza"></app-control-datepicker>
            </div>
            <div class="form-group mb-0">
              <app-control-datepicker type="search" [inline]="true" [showValidation]="false"
                [label]="'call.search.scadenza.fine'| translate" formControlName="fineScadenza"></app-control-datepicker>
            </div>
          </form>
        </div>
      </aside>
      <section class="col-lg-9">
        <app-grid-layout [loading]="loading" [items]="items" [showPage]="false" [infiniteScroll]="true"
                         [page]="getPage()" [showTotalOnTop]="true" [count]="count"
                         (onChangePage)="onChangePage($event)" (loadMore)="onScroll()" [page_offset]="service.getPageOffset()">
          <div class="row" infiniteScroll [infiniteScrollThrottle]="300" [infiniteScrollDistance]="1" (scrolled)="onScroll()">
            <div *ngFor="let item of items" class="col-12">
            <app-list-item-application [item]="item" [user]="user" [canCopy]="true" (onReopen)="onReopen(item)" (onCopy)="onCopy(item)">
              <p class="mb-1 h5">
              <a class="fw-bold text-primary text-decoration-none" [routerLink]="['/call-detail']" [queryParams]="{ callCode: item.call.codice }">{{ item.call.codice }}</a>
              <button *ngIf="item.call.descrizione" type="button" class="btn btn-link p-0 ms-1 align-baseline"
                [itPopover]="translateService.currentLang == 'it' ? item.call.descrizione : item.call.descrizione_en"
                popoverTitle="Info" [popoverHtml]="true" popoverTrigger="focus" popoverPlacement="bottom" aria-label="Info">
                <svg class="icon icon-xs icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-info-circle"></use></svg>
              </button>
              <span *ngIf="item.call.profilo"> — {{ item.call.profilo }}</span>
            </p>
            <div class="small text-secondary d-flex flex-wrap gap-3">
              <span *ngIf="item.call.sede">{{ item.call.sede }}</span>
              <span *ngIf="item.call.numero_gu">G.U. n. {{ item.call.numero_gu }}<span *ngIf="item.call.data_gu"> del {{ item.call.data_gu | date:'dd/MM/yyyy' }}</span></span>
              <app-show-text-modal *ngIf="item.call.requisiti_link || item.call.requisiti_link_en"
                [label]="'call.elenco_titoli_studio'"
                [value]="translateService.currentLang == 'it' ? item.call.requisiti_link : item.call.requisiti_link_en"
                [modal_title]="'Info'"
                [modal_text]="translateService.currentLang == 'it' ? item.call.requisiti : item.call.requisiti_en"
                [strong]="false">
              </app-show-text-modal>
            </div>
            </app-list-item-application>
            </div>
          </div>
        </app-grid-layout>
      </section>
    </div>
  `,
  styles: [`
    .filters { margin-top: 1.6rem; }
    .filters-title { font-size: .875rem; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: #5d7083; margin-bottom: .5rem; }
    li.app-item { list-style: none; }
    .filters ::ng-deep app-control-text, .filters ::ng-deep app-control-datepicker, .filters ::ng-deep app-form-layout { display: block; width: 100%; }
    .filters ::ng-deep .form-control { width: 100% !important; }
  `]
})
export class ApplicationListComponent extends CommonListComponent<Application> implements OnInit {
  public sortOptions = [
    { value: 'modifica', label: 'layout.sort.modified' },
    { value: 'cognome', label: 'layout.sort.surname' },
    { value: 'invio', label: 'layout.sort.sent' },
    { value: 'creazione', label: 'layout.sort.created' }
  ];

  public applicationStates = [
    { value: 'P', label: 'application.status.temporary' },
    { value: 'C', label: 'application.status.confirmed' },
    { value: 'active', label: 'application.status.active' },
    { value: 'excluded', label: 'application.status.excluded' },
    { value: 'all', label: 'application.status.all' }
  ];

  public callStates = [
    { value: 'active', label: 'layout.state_open' },
    { value: 'expire', label: 'layout.state_closed' },
    { value: 'all', label: 'layout.state_all' }
  ];

  public items: Application[] = [];
  public user: User = null;
  cache: any = {};
  protected applicationStatus: string;
  bsModalRef: ModalRef;
  public collapse: boolean = true;
  
  public constructor(public service: ApplicationService,
                     private authService: AuthService,
                     private formBuilder: FormBuilder,
                     private cacheService: CacheService,
                     private modalService: ModalService,
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
      // link dal menu utente quando la pagina e' gia' aperta
      if (this.filterForm && this.applicationStatus && this.filterForm.value.applicationStatus !== this.applicationStatus) {
        this.filterForm.controls['applicationStatus'].setValue(this.applicationStatus);
      }
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
      orderBy: new FormControl('modifica'),
      orderDirection: new FormControl('desc'),
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

  public onCopy(application: Application) {
    const initialState = {
      'application': application
    };
    this.bsModalRef = this.modalService.show(CopyApplicationComponent, Object.assign({initialState}, { animated: true, class: 'modal-lg' }));
    this.bsModalRef.content.copied.subscribe((result: {callId: string, applicationId: string}) => {
      this.router.navigate(['/manage-application'],
      {
        relativeTo: this.route,
        queryParams: {
          callId: result.callId,
          applicationId: result.applicationId
        }
      });
    });
  }

  protected isScrollTopOnPageChange(): boolean {
    return true;
  }


  /** Scroll infinito: pagina successiva accodata all'elenco. */
  public onScroll(): void {
    this.loadMoreItems();
  }
}
