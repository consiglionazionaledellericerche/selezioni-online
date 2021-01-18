import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Input, SimpleChanges} from '@angular/core';
import {CommonListComponent} from '../../common/controller/common-list.component';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {NavigationService} from '../navigation.service';
import { Application } from './application.model';
import { ApplicationUserService } from './application-user.service';
import {TranslateService} from '@ngx-translate/core';
import { Select2Template } from '../../common/template/select2-template';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/model/user.model';
import { CallService } from '../call/call.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Call } from '../call/call.model';
import { Helpers } from '../../common/helpers/helpers';

@Component({
  selector: 'application-user-list',
  template:
  `
    <app-layout-title [title]="'application.user.title'" [titleClass]="'main-title'"></app-layout-title>
    <form *ngIf="filterForm" class="clearfix" [formGroup]="filterForm">
      <div class="form-row col-md-12">
        <div class="form-group col-md-4">        
          <app-control-select-model
            [path]="service.getSelect2Mapping()"
            [template]="userSelect2"
            [noLabel]="true"
            [inline]="'false'"
            [placeholder]="'Seleziona utente'"
            [resultName]="'people'"
            [resultId]="'userName'"
            [allowClear]="'true'"
            formControlName="user">
          </app-control-select-model>
        </div>
        <div class="form-group col-md-2">
          <app-control-text 
            formControlName="firstname"
            [inline]="true"
            type="search"
            [showValidation]="false"
            [prepend]="'user-circle-o'"
            [ttip]="'user.firstname'| translate"
            [label]="'user.firstname'| translate">
          </app-control-text>
        </div>
        <div class="form-group col-md-3">
          <app-control-text 
            formControlName="lastname"
            [inline]="true"
            type="search"
            [showValidation]="false"
            [prepend]="'user-circle'"
            [ttip]="'user.lastname'| translate"
            [label]="'user.lastname'| translate">
          </app-control-text>
        </div>
        <div class="form-group col-md-3">
          <app-control-text 
            formControlName="codicefiscale"
            [inline]="true"
            type="search"
            [showValidation]="false"
            [prepend]="'address-card'"
            [ttip]="'user.codicefiscale'| translate"
            [label]="'user.codicefiscale'| translate">
          </app-control-text>
        </div>
      </div>
      <div class="form-row col-md-12">
        <div class="form-group col-md-6">        
          <app-control-select-model
            [path]="callService.getSelect2Mapping()"
            [template]="callSelect2"
            [noLabel]="true"
            [inline]="'false'"
            [resultName]="'items'"
            [resultId]="'cmis:objectId'"
            [placeholder]="'Seleziona bando'"
            [allowClear]="'true'"
            formControlName="call">
          </app-control-select-model>
        </div>
        <div class="form-group col-md-6">
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
    <app-list-layout [loading]="loading" [items]="items" [page]="getPage()"
                     [count]="count" (onChangePage)="onChangePage($event)">
      <li *ngFor="let item of items" [ngClass]="listItemClasses()">
        <app-list-item-application [item]="item" [user]="user" (onDelete)="onDelete(item.getId())">
          <div class="col-sm-12 h5">
            <span class="badge" [ngClass]="{'badge-warning' : item.isProvvisoria(), 'badge-success' : !item.isProvvisoria()}">
              <span>{{'application.state.' + item.stato_domanda | translate}}</span>
              <span *ngIf="item.isProvvisoria()">{{'application.date.modified' | translate:{value: item.lastModificationDate| date:'dd/MM/yyyy HH:mm:ss' } }}</span>
              <span *ngIf="!item.isProvvisoria()">{{'application.date.send' | translate:{value: item.data_domanda| date:'dd/MM/yyyy HH:mm:ss' } }}</span>              
            </span>
          </div>
          <div class="col-sm-12">
            <app-show-text [label]="'application.firstname'" [value]="item.nome | uppercase" [strong]="true"></app-show-text>
            <app-show-text [label]="'application.lastname'"  [value]="item.cognome | uppercase" [strong]="true"></app-show-text>
            <app-show-user-modal [label]="'utente.show'" [username]="item.user" [groups]="'true'"></app-show-user-modal>
          </div>
          <div class="col-sm-12">
            <app-show-text [label]="'application.codice_fiscale'" [value]="item.codice_fiscale" [strong]="false"></app-show-text>
            <app-show-text 
                [label]="'application.data_nascita'" 
                [value]="item.data_nascita | date:'dd/MM/yyyy'">
            </app-show-text>
          </div>
          <div class="col-sm-12">
            <app-show-text [label]="'call.profilo'" [value]="item.call.profilo" [strong]="false"></app-show-text>
          </div>
          <div class="col-sm-12">
            <app-show-text-modal 
              [label]="'call.codice'" 
              [value]="item.call.codice" 
              [modal_title]="'Info'" 
              [modal_text]="translateService.currentLang == 'it'? item.call.descrizione: item.call.descrizione_en">
            </app-show-text-modal>
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
export class ApplicationUserListComponent extends CommonListComponent<Application> implements OnInit {

  public userSelect2 = Select2Template.user;
  
  public callSelect2 = Select2Template.call;

  public items: Application[] = [];
  public user: User;
  protected callId: string;
  protected callSearch: Call;

  public constructor(public service: ApplicationUserService,
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
      applicationStatus: new FormControl('all'),
      firstname: new FormControl(''),
      lastname: new FormControl(''),
      codicefiscale: new FormControl(''),
      call: new FormControl(this.callSearch),
    });
  }
}
