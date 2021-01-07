import {ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {CommonEditComponent} from '../../common/controller/common-edit.component';
import {ActivatedRoute, Router} from '@angular/router';
import { FormGroup } from '@angular/forms';
import { NavigationService} from '../navigation.service';
import { Application } from './application.model';
import { ApplicationService } from './application.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/model/user.model';
import { CacheService } from '../cache.service';
import { CallService } from '../call/call.service';
import { Call } from '../call/call.model';
import { ApiMessageService, MessageType } from '../api-message.service';

@Component({
  selector: 'manage-application',
  template:
  `
    <app-layout-wait [loaded]="isLoaded()"></app-layout-wait>
    <div *ngIf="isLoaded()">
      <div class="shadow-none p-3 mb-5 px-1 py-3 mx-n3">
        <div class="text-right">
          <span>{{'application.call.title' | translate:{value: call.codice} }}</span>
          <app-show-children-modal 
            [parentId] = "call.objectId" 
            [buttonClass] = "'text-primary'"
            [modal_title]="'call.attach_to' | translate:{value: call.codice}">
          </app-show-children-modal>
        </div>
        <h4 class="text-center">{{ 'application.title' | translate}}</h4>
        <h5 class="text-center" innerHtml="{{translateService.currentLang == 'it'? call.descrizione : call.descrizione_en}}"></h5>
        <h3 *ngIf="entity.stato_domanda != 'I'"> 
          <span class="badge d-block" [ngClass]="{'badge-warning': entity.isProvvisoria(),'badge-success': entity.isConfermata()}">
          {{'application.state.' + entity.stato_domanda|translate|uppercase}}
          </span>
        </h3>
        <h5 class="text-center">
          <span>{{'application.sottoscritto.' + (entity.sesso || 'M') | translate}}</span>
          <span class="pl-1">{{entity.cognome|uppercase}}</span>
          <span class="pl-1">{{entity.nome|uppercase}}</span>
        </h5>
        <h5 class="text-center" *ngIf="call.objectTypeId == 'F:jconon_call_employees:folder'">
          <span>{{'user.matricola_value' | translate:{value: user.matricola} }}</span>
          <span class="pl-1">{{'user.email_value' | translate:{value: user.email} }}</span>
        </h5>
        <h5 class="text-center" *ngIf="call.objectTypeId != 'F:jconon_call_mobility_open:folder'">
          {{'application.richiesta.partecipazione'| translate}}
        </h5>
        <h5 class="text-center" innerHtml="{{translateService.currentLang == 'it'? call.descrizione_ridotta : call.descrizione_ridotta_en}}"></h5>
        <h5 class="text-center" *ngIf="call.sede">{{call.sede}}</h5>
        <h5 class="text-center" *ngIf="call.elenco_settori_tecnologici">{{call.elenco_settori_tecnologici}}</h5>
        <h5 class="text-center" *ngIf="call.elenco_macroaree">{{call.elenco_macroaree}}</h5>
      </div>
      <div class="card-wrapper card-space">
      <div class="card card-bg border-bottom-card">
        <div class="card-header h1">{{'affix.' + call.elenco_sezioni_domanda[affixCompleted] + '.title' | translate}}</div>
        <div class="card-body">  
          <show-affix [form]="form" [cmisObject]="entity" [type]="call.elenco_sezioni_domanda[affixCompleted]"></show-affix>
          <div class="steppers">
            <nav class="steppers-nav">
              <button [ngClass]="{'disabled': affixCompleted == 0}" (click)="affixCompleted = affixCompleted - 1" type="button" class="btn btn-link steppers-btn-prev">
                <svg class="icon icon-primary"><use xlink:href="/assets/vendor/sprite.svg#it-chevron-left"></use></svg>Indietro
              </button>
              <ul class="steppers-dots d-flex">
                <li [ngClass]="{'done': number <= affixCompleted}" 
                    class="btn"
                    *ngFor="let number of affix" 
                    (click)="affixCompleted = number" 
                    tooltip="{{'affix.' + call.elenco_sezioni_domanda[number] + '.title' | translate}}">
                </li>
              </ul>
              <button [ngClass]="{'disabled': affixCompleted == affix.length - 1}" (click)="affixCompleted = affixCompleted + 1" type="button" class="btn btn-link steppers-btn-next">Avanti
                <svg class="icon icon-primary"><use xlink:href="/assets/vendor/sprite.svg#it-chevron-right"></use></svg>
              </button>
            </nav>
          </div>
        </div>
        <div class="card-footer">
          <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-outline-danger btn-lg btn-icon mr-2" tooltip="Stampa domanda">
              <svg class="icon icon-danger"><use xlink:href="/assets/vendor/sprite.svg#it-print"></use></svg>
              <span class="d-none d-md-block">Stampa</span>
            </button>
            <button type="button" class="btn btn-outline-success btn-lg btn-icon mr-2" tooltip="Invia domanda">
            <svg class="icon icon-success"><use xlink:href="/assets/vendor/sprite.svg#it-upload"></use></svg>              
              <span class="d-none d-md-block">Invia</span>
            </button>
            <button type="button" (click)="confirmApplication()" class="btn btn-outline-primary btn-lg btn-icon" tooltip="Conferma domanda">
              <svg class="icon icon-primary"><use xlink:href="/assets/vendor/sprite.svg#it-pencil"></use></svg>              
              <span class="d-none d-md-block">Conferma</span>
            </button>
          </div>     
        </div>
      </div>
      </div>
    </div>  
  `
})
export class ManageApplicationComponent extends CommonEditComponent<Application> implements OnInit {

  public call: Call = undefined;

  public user: User = null;
  cache: any = {};
  public affixCompleted: number;
  public affix: number[];
  public constructor(public service: ApplicationService,
                     public callService: CallService,
                     private apiMessageService: ApiMessageService,
                     private authService: AuthService,
                     private cacheService: CacheService,
                     protected router: Router,
                     protected route: ActivatedRoute,
                     protected changeDetector: ChangeDetectorRef,
                     protected navigationService: NavigationService,
                     protected translateService: TranslateService) {
    super(service, router, route);
  }
  
  public ngOnInit() {
    this.affixCompleted = 0;
    this.route.queryParams.subscribe((queryParams) => {
      this.callService.getById(queryParams['callId']).subscribe((call) => {
        this.call = call;
        this.user = this.authService.getUser();
        this.affix = Array(call.elenco_sezioni_domanda.length).fill(0).map((x,i)=>i);
        this.service.loadApplication(call.objectId, this.user.userName).subscribe((application) => {
          this.setEntity(application);
          this.buildCreateForm();
        });
      });  
    }); 
    this.cacheService.cache().subscribe((cache) => {
      this.cache = cache;
    });
    super.ngOnInit();
  }

  public setEntity(entity: Application) {
    this.entity = entity;
  }

  public buildUpdateForm(id: number, entity: Application) {
    this.form = new FormGroup({

    });
  }
  public buildCreateForm() {
    this.form = new FormGroup({
    });
  }


  public confirmApplication() {
    Object.keys(this.form.controls).forEach(control => {
      if (this.form.controls[control].status === 'INVALID') {
        this.form.controls[control].markAsDirty({onlySelf: true});
      }
    });
    // stop here if form is invalid
    if (this.form.invalid) {
        this.translateService.get('message.form.invalid').subscribe((label) => {
            this.apiMessageService.sendMessage(MessageType.WARNING, label);
        });
    } else {
      this.affixCompleted = this.affixCompleted + 1;
    }
  }

  public buildInstance(): Application {
    return null;
  }
}
