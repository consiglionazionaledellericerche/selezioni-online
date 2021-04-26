import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {CommonEditComponent} from '../../common/controller/common-edit.component';
import {ActivatedRoute, Router} from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
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
import { ShowAffixComponent } from '../../shared/tags/show/show-affix.component';
import { Helpers } from '../../common/helpers/helpers';

@Component({
  selector: 'manage-application',
  template:
  `
    <app-layout-wait [loaded]="isLoaded()"></app-layout-wait>
    <div *ngIf="isLoaded()">
      <div class="shadow-none p-3 px-1 py-3 mx-n3" #cardApplication>
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
          <span class="pl-1">{{'user.email_value' | translate:{value: entity.email_comunicazioni} }}</span>
        </h5>
        <h5 class="text-center" *ngIf="call.objectTypeId != 'F:jconon_call_mobility_open:folder'">
          {{'application.richiesta.partecipazione'| translate}}
        </h5>
        <h5 class="text-center" innerHtml="{{translateService.currentLang == 'it'? call.descrizione_ridotta : call.descrizione_ridotta_en}}"></h5>
        <h5 class="text-center" *ngIf="call.sede">{{call.sede}}</h5>
        <h5 class="text-center" *ngIf="call.elenco_settori_tecnologici">{{call.elenco_settori_tecnologici}}</h5>
        <h5 class="text-center" *ngIf="call.elenco_macroaree">{{call.elenco_macroaree}}</h5>
      </div>
      <div class="card card-bg border-bottom-card" >
        <div class="card-header d-flex">
          <div class="h1 flex-grow-1">{{'affix.' + call.elenco_sezioni_domanda[affixCompleted] + '.title' | translate}}</div>
          <div class="h4">{{affixCompleted + 1}}/{{affix.length}}</div>
        </div>
        <div class="card-body mt-2">  
          <show-affix #affixComponent [form]="form" [cmisObject]="entity" [type]="call.elenco_sezioni_domanda[affixCompleted]"></show-affix>
          <div class="steppers">
            <nav class="steppers-nav px-0">
              <a [ngClass]="{'disabled': affixCompleted == 0}" 
                (click)="affixCompleted = affixCompleted - 1;scroll(cardApplication);" 
                class="btn btn-link text-primary steppers-btn-prev px-1">
                <svg class="icon icon-primary"><use xlink:href="/assets/vendor/sprite.svg#it-chevron-left"></use></svg>
                <span>Indietro</span>
              </a>
              <ul class="steppers-dots d-flex">
                <li [ngClass]="{'done': number <= affixCompleted}" 
                    class="btn"
                    *ngFor="let number of affix" 
                    (click)="affixCompleted = number;scroll(cardApplication);"
                    [popover]="'affix.' + call.elenco_sezioni_domanda[number] + '.title' | translate"
                    triggers="mouseenter:mouseleave">
                </li>
              </ul>
              <a [ngClass]="{'disabled': affixCompleted == affix.length - 1}" 
                (click)="affixCompleted = affixCompleted + 1;scroll(cardApplication);" 
                class="btn btn-link text-primary steppers-btn-next px-1">
                <span>Avanti</span>
                <svg class="icon icon-primary"><use xlink:href="/assets/vendor/sprite.svg#it-chevron-right"></use></svg>
              </a>
            </nav>
          </div>
        </div>
        <div class="card-footer">
          <div class="d-flex justify-content-end">
            <div class="form-group text-right">
              <button class="btn btn-outline-danger btn-lg btn-icon mr-2" tooltip="{{'application.print'| translate}}">
                <span class="d-none d-md-block pr-1" translate>application.print</span>
                <svg class="icon icon-danger"><use xlink:href="/assets/vendor/sprite.svg#it-print"></use></svg>
              </button>
            </div>
            <div *ngIf="affixCompleted == affix.length - 1" class="form-group text-right">  
              <button (click)="sendApplication()" 
                [disabled]="isDisableConfirm"
                class="btn btn-success btn-lg btn-block btn-icon mr-2" 
                tooltip="{{'application.send' | translate}}">
                <span class="pr-1 w-100 text-right" translate>application.send</span>
                <svg class="icon icon-white"><use xlink:href="/assets/vendor/sprite.svg#it-upload"></use></svg>              
              </button>
              <div *ngIf="isDisableConfirm" class="text-danger"><small translate>message.validation.application.section_not_confirmed</small></div>
            </div>  
            <div *ngIf="affixCompleted < affix.length - 1" class="form-group text-right">
              <button (click)="confirmApplication()" 
                [disabled]="isDisableConfirm"
                class="btn btn-primary btn-block btn-lg btn-icon" 
                tooltip="{{'application.confirm' | translate}}">
                <span class="pr-1 w-100 text-right" translate>application.confirm</span>
                <svg class="icon icon-white"><use xlink:href="/assets/vendor/sprite.svg#it-arrow-right-circle"></use></svg>
              </button>
              <div *ngIf="isDisableConfirm" class="text-danger"><small translate>message.validation.application.section_not_confirmed</small></div>
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
  public affixCompleted: number = 0;
  public affix: number[];

  @ViewChild('affixComponent', {static: false}) affixComponent: ShowAffixComponent;

  public constructor(public service: ApplicationService,
                     public callService: CallService,
                     private apiMessageService: ApiMessageService,
                     private authService: AuthService,
                     private cacheService: CacheService,
                     protected router: Router,
                     private el: ElementRef,
                     protected route: ActivatedRoute,
                     protected changeDetector: ChangeDetectorRef,
                     protected navigationService: NavigationService,
                     protected translateService: TranslateService) {
    super(service, router, route);
  }
  
  public ngOnInit() {
    this.route.queryParams.subscribe((queryParams) => {
      this.callService.getById(queryParams['callId']).subscribe((call) => {
        this.call = call;
        this.user = this.authService.getUser();
        this.affix = Array(call.elenco_sezioni_domanda.length).fill(0).map((x,i)=>i);
        this.service.loadApplication(call.objectId, queryParams['applicationId']||'', this.user.userName).subscribe((application) => {
          application.call = call;
          this.setEntity(application);
          this.affixCompleted = this.entity.last_section_completed || 0;
          this.buildCreateForm();
        });
        this.translateService.reloadLang('it');
        this.callService.loadLabels(call.objectId).subscribe((labels) => {
          if (labels) {
            this.translateService.setTranslation('it', Helpers.convertProperties(labels), true);
          }
        });
      });  
    }); 
    this.cacheService.cache().subscribe((cache) => {
      this.cache = cache;
    });    
    super.ngOnInit();
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({
      behavior:"smooth"
    });
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
      'jconon_application:user': new FormControl(this.entity.user),
      'cmis:objectTypeId': new FormControl(this.entity.objectTypeId),
      'cmis:objectId': new FormControl(this.entity.objectId),
      'jconon_application:last_section_completed': new FormControl(this.affixCompleted),
      'aspect': new FormControl([
        ...this.entity.call.elenco_aspects||[], 
        ...this.entity.call.elenco_aspects_sezione_cnr||[], 
        ...this.entity.call.elenco_aspects_ulteriori_dati||[]
      ])
    });
  }

  public confirmApplication() {
    if (this.isFormValid) {
      this.form.controls['jconon_application:last_section_completed'].patchValue(this.affixCompleted + 1);
      this.service.saveApplication(this.buildInstance()).subscribe((application) => {
        application.call = this.call;
        this.setEntity(application);
        this.buildCreateForm();
        this.affixCompleted++;
      });  
    }
  }

  public sendApplication() {
    if (this.isFormValid) {
    }
  }

  get isFormValid() : boolean {
    var invalidControls = [];
    Object.keys(this.form.controls).forEach(control => {
      if (this.form.controls[control].status === 'INVALID') {
        this.form.controls[control].markAsDirty({onlySelf: true});
        this.form.controls[control].markAsTouched({onlySelf: true});
        this.form.controls[control].patchValue(this.form.controls[control].value || null);
        this.translateService.get('label.'+ control.replace(':', '.')).subscribe((label) => {
          invalidControls.push('<li class="font-weight-bold pt-2">' + label + '</li>');
        });
        const invalidControl = this.el.nativeElement.querySelector('input.is-invalid,textarea.invalid,select.is-invalid') || 
        document
          .querySelector('[formcontrolname="' + control + '"], .is-invalid')
          .querySelector('input,textarea');
        if (invalidControl) {
          invalidControl.focus();
        }
      }      
    });
    if (this.form.invalid) {
        if (invalidControls.length > 3) {
          invalidControls = invalidControls.slice(0, 3);
          invalidControls.push('<li class="font-weight-bold pt-2">ecc...</li>');
        }
        this.translateService.get('message.form.invalid').subscribe((label) => {
            this.apiMessageService.sendMessage(MessageType.WARNING, label + '<ul class="list-unstyled">' + invalidControls.join('') + '</ul>');
        });
    }
    return !this.form.invalid;
  }

  get isDisableConfirm() : boolean {
    return this.entity.last_section_completed < this.affixCompleted;
  }
  public buildInstance(): Application {
    return this.service.buildInstance(this.form.value);
  }
}
