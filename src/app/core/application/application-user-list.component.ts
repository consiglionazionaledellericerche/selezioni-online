import { ModalService } from '../../shared/modal/modal.service';
import { ExportCallsComponent } from '../call/shared/export-calls.component';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonListComponent } from '../../common/controller/common-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { NavigationService } from '../navigation.service';
import { Application } from './application.model';
import { ApplicationUserService } from './application-user.service';
import { TranslateService } from '@ngx-translate/core';
import { Select2Template } from '../../common/template/select2-template';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/model/user.model';
import { CallService } from '../call/call.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Call } from '../call/call.model';
import { Helpers } from '../../common/helpers/helpers';
import { ModalRef } from '../../shared/modal/modal.service';

@Component({
  standalone: false,
  selector: 'application-user-list',
  template:
  `
    <app-layout-title [title]="'layout.applications_user_title'" [subTitle]="'layout.applications_user_subtitle'">
      <button type="button" class="btn btn-success" (click)="openExport()">
        <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-file-xlsx"></use></svg>
        {{ 'export_calls.button' | translate }}
      </button>
    </app-layout-title>
    <app-application-summary *ngIf="filterForm" class="d-block mt-4" scope="all" layout="tiles"
      [active]="filterForm.value.applicationStatus" [filters]="filterForm.value" [service]="service"
      (selected)="filterForm.controls['applicationStatus'].setValue($event)"></app-application-summary>
    <div class="row mt-4" *ngIf="filterForm">
      <aside class="col-lg-3 mb-4">
        <div class="filters-sticky">
          <form class="filters card shadow-sm rounded p-3" [formGroup]="filterForm" role="search">
            <h2 class="filters-title">{{ 'layout.filter_candidate' | translate }}</h2>
            <div class="form-group mb-3">
              <app-autocomplete [path]="service.getSelect2Mapping()" resultName="people" resultId="userName"
                [display]="userDisplay" [placeholder]="'layout.search_user'" formControlName="user"></app-autocomplete>
            </div>
            <div class="form-group mb-3">
              <app-control-text formControlName="firstname" [inline]="true" type="search" [showValidation]="false"
                [label]="'user.firstname'| translate"></app-control-text>
            </div>
            <div class="form-group mb-3">
              <app-control-text formControlName="lastname" [inline]="true" type="search" [showValidation]="false"
                [label]="'user.lastname'| translate"></app-control-text>
            </div>
            <div class="form-group mb-4">
              <app-control-text formControlName="codicefiscale" [inline]="true" inputClass="text-uppercase" type="search"
                [showValidation]="false" [label]="'user.codicefiscale'| translate"></app-control-text>
            </div>
            <h2 class="filters-title">{{ 'layout.filter_call' | translate }}</h2>
            <div class="form-group mb-4">
              <app-autocomplete [path]="callService.getSelect2Mapping()" resultName="items" resultId="cmis:objectId"
                [display]="callDisplay" [placeholder]="'layout.search_call'" [displayText]="callSearch?.codice" formControlName="callId"></app-autocomplete>
            </div>
            <app-sort-control class="d-block mb-4" [form]="filterForm" [options]="sortOptions"></app-sort-control>
            <h2 class="filters-title">{{ 'layout.filter_application_state' | translate }}</h2>
            <app-segmented [vertical]="true" [options]="applicationStates" formControlName="applicationStatus"></app-segmented>
          </form>
        </div>
      </aside>
      <section class="col-lg-9">
        <app-grid-layout [loading]="loading" [items]="items" [showPage]="false" [infiniteScroll]="true"
                         [page]="getPage()" [showTotalOnTop]="true" [count]="count"
                         (onChangePage)="onChangePage($event)" (loadMore)="onScroll()" [page_offset]="service.getPageOffset()">
          <div class="row" infiniteScroll [infiniteScrollThrottle]="300" [infiniteScrollDistance]="1" (scrolled)="onScroll()">
            <div *ngFor="let item of items" class="col-12">
            <app-list-item-application [item]="item" [user]="user" (changed)="loadList()">
              <h3 class="h5 mb-1">
                <span class="text-primary">{{ item.cognome | uppercase }} {{ item.nome | uppercase }}</span>
              </h3>
              <div class="small text-secondary d-flex flex-wrap gap-3 mb-2">
                <span *ngIf="item.codice_fiscale">{{ 'label.jconon_application.codice_fiscale' | translate }} <strong>{{ item.codice_fiscale }}</strong></span>
                <span *ngIf="item.data_nascita">{{ 'label.jconon_application.data_nascita' | translate }} <strong>{{ item.data_nascita | date:'dd/MM/yyyy' }}</strong></span>
                <app-show-user-modal [label]="'utente.show'" [username]="item.user" [groups]="true"></app-show-user-modal>
              </div>
              <p class="mb-1">
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
export class ApplicationUserListComponent extends CommonListComponent<Application> implements OnInit {
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


  public userSelect2 = Select2Template.user;

  public userDisplay = (person: any) => ({
    title: [person.lastName, person.firstName].filter(v => !!v).join(' ') || person.userName,
    subtitle: [person.userName, person.email].filter(v => !!v).join(' · ')
  });

  public callDisplay = (call: any) => ({
    title: call['jconon_call:codice'],
    subtitle: [call['jconon_call:profilo'], call['jconon_call:sede']].filter(v => !!v).join(' — ')
  });
  
  public callSelect2 = Select2Template.call;

  public items: Application[] = [];
  public user: User;
  protected callId: string;
  protected callSearch: Call;
  bsModalRef: ModalRef;
  public collapse: boolean = true;

  public constructor(public service: ApplicationUserService,
                     private modalService: ModalService,
                     private authService: AuthService,
                     public callService: CallService,                     
                     private formBuilder: FormBuilder,
                     protected route: ActivatedRoute,
                     protected router: Router,
                     protected changeDetector: ChangeDetectorRef,
                     protected navigationService: NavigationService,
                     protected translateService: TranslateService) {
    super(service, route, router, changeDetector, navigationService);
  }
  
  public beforeOnInit(): Observable<any> {
    this.route.queryParams.subscribe((queryParams) => {
      this.callId = queryParams['callId'];
      this.collapse = (this.callId == undefined || this.callId == '');
    }); 
    if (this.authService.isAuthenticated()) {
      this.user = Helpers.buildInstance(this.authService.getUser(), User);
    }
    if (this.callId) {
      return this.callService.getById(this.callId).pipe(switchMap((call) => {
        this.callSearch = call;
        return of(null);
      }));
    } else {
      return of(null);
    }
  }

  public setItems(items: Application[]) {
    this.items = items;
  }

  public getItems(): Application[] {
    return this.items;
  }

  public buildFilterForm(): FormGroup {
    return this.formBuilder.group({
      user: new FormControl(''),
      fetchCall: new FormControl(true),
      orderBy: new FormControl('modifica'),
      orderDirection: new FormControl('desc'),
      applicationStatus: new FormControl(this.route.snapshot.queryParams['applicationStatus'] || 'all'),
      firstname: new FormControl(''),
      lastname: new FormControl(''),
      codicefiscale: new FormControl(''),
      callId: new FormControl(this.callId || ''),
    });
  }

  protected isScrollTopOnPageChange(): boolean {
    return true;
  }


  /** Scroll infinito: pagina successiva accodata all'elenco. */
  public onScroll(): void {
    this.loadMoreItems();
  }

  /** Estrazione Excel delle domande filtrate (stessi filtri dell'elenco). */
  public openExport(): void {
    this.modalService.show(ExportCallsComponent, {
      initialState: {
        filters: this.filterForm.value,
        endpoint: '/v1/application/export/filtered',
        title: 'export_applications.title',
        info: 'export_applications.info',
        options: [
          { type: 'application', icon: 'it-folder' },
          { type: 'score', icon: 'it-star-outline' },
          { type: 'istruttoria', icon: 'it-list' }
        ]
      },
      class: 'modal-lg'
    });
  }
}
