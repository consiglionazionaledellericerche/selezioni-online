import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonEditComponent } from '../../common/controller/common-edit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { NavigationService } from '../navigation.service';
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
import { ModalInfoComponent } from '../../shared/tags/wizard/modal-info.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LoadingState } from '../../auth/loading-state.enum';
import { Subscription } from 'rxjs';
import { ModalConfirmComponent } from '../../shared/tags/wizard/modal-confirm.component';
import { UserService } from '../../auth/edit/user.service';
import { PrintApplicationComponent } from './print-application.component';

@Component({
  selector: 'manage-application',
  template:
  `
    <app-layout-wait *ngIf="!isEntityError" [loaded]="isLoaded()"></app-layout-wait>
    <div *ngIf="isEntityError" class="alert alert-danger">
      <strong innerHtml="{{entityError | translate}}"></strong>
    </div>
    <div *ngIf="isLoaded() && !isEntityError">
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
          <span>{{'user.matricola_value' | translate:{value: user.matricola||''} }}</span>
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
          <div class="h1 flex-grow-1">{{call.elenco_sezioni_domanda[affixCompleted] | translate}}</div>
          <div class="h4">{{affixCompleted + 1}}/{{affix.length}}</div>
        </div>
        <div class="card-body mt-2">  
          <show-affix #affixComponent [form]="form" [cmisObject]="entity" [type]="call.elenco_sezioni_domanda[affixCompleted]"></show-affix>
          <div class="steppers">
            <nav class="steppers-nav px-0">
              <a [ngClass]="{'disabled': (affixCompleted == 0 || !form.pristine) || isDisableConfirm}" 
                (click)="affixCompleted = affixCompleted - 1;scroll(cardApplication);" 
                class="btn btn-link text-primary steppers-btn-prev px-1">
                <svg class="icon icon-primary"><use xlink:href="/assets/vendor/sprite.svg#it-chevron-left"></use></svg>
                <span>Indietro</span>
              </a>
              <ul class="steppers-dots d-flex">
                <li *ngFor="let number of affix" 
                  [ngClass]="{'done': number < entity.last_section_completed, 'bg-light': !form.pristine && !isDisableConfirm}"
                  [popover]="call.elenco_sezioni_domanda[number] | translate"
                  triggers="mouseenter:mouseleave">
                  <a [ngClass]="{'disabled': !form.pristine && !isDisableConfirm}" 
                    class="btn"                   
                    (click)="affixCompleted = number;scroll(cardApplication);"></a>
                </li>
              </ul>
              <a [ngClass]="{'disabled': (affixCompleted == affix.length - 1 || !form.pristine) || isDisableConfirm}" 
                (click)="affixCompleted = affixCompleted + 1;scroll(cardApplication);" 
                class="btn btn-link text-primary steppers-btn-next px-1">
                <span>Avanti</span>
                <svg class="icon icon-primary"><use xlink:href="/assets/vendor/sprite.svg#it-chevron-right"></use></svg>
              </a>
            </nav>
          </div>
        </div>
        <div class="card-footer rounded-bottom">
          <div class="d-flex justify-content-end">
            <div class="form-group text-left mr-auto">
              <button 
                [disabled]="!form.pristine"
                (click)="deleteApplication($event)" 
                class="btn btn-outline-danger btn-lg btn-icon mr-2" 
                tooltip="{{'application.delete'| translate}}">
                <span class="d-none d-md-block pr-1" translate>application.delete</span>
                <svg class="icon icon-danger"><use xlink:href="/assets/vendor/sprite.svg#it-delete"></use></svg>
              </button>
            </div>
            <div class="form-group text-right">
              <button 
                *ngIf="entity.isProvvisoria()"
                [disabled]="!form.pristine"
                (click)="printApplication($event)" 
                class="btn btn-outline-danger btn-lg btn-icon mr-2" 
                tooltip="{{'application.print.application'| translate}}">
                <span class="d-none d-md-block pr-1" translate>application.print.application</span>
                <svg class="icon icon-danger"><use xlink:href="/assets/vendor/sprite.svg#it-print"></use></svg>
              </button>
            </div>
            <div *ngIf="affixCompleted == affix.length - 1" class="form-group text-right">  
              <button (click)="sendApplication($event)" 
                #sendApplicationButton 
                [disabled]="isDisableConfirm || loadingStateSend.isStarting()"
                class="btn btn-primary btn-block btn-lg btn-icon mr-2 rounded" 
                tooltip="{{'application.send' | translate}}">
                <span class="pr-1 w-100 text-right" translate>application.send</span>
                <svg *ngIf="!loadingStateSend.isStarting()" class="icon icon-white"><use xlink:href="/assets/vendor/sprite.svg#it-upload"></use></svg>              
                <div *ngIf="loadingStateSend.isStarting()" class="progress-spinner progress-spinner-double size-sm progress-spinner-active">
                  <div class="progress-spinner-inner"></div>
                  <div class="progress-spinner-inner"></div>
                </div>
              </button>
              <div *ngIf="isDisableConfirm" class="text-danger"><small translate>message.validation.application.section_not_confirmed</small></div>
            </div>  
            <div *ngIf="affixCompleted < affix.length - 1" class="form-group text-right">
              <button (click)="confirmApplication($event);"
                #confirmApplicationButton 
                [disabled]="isDisableConfirm || loadingStateConfirm.isStarting()"
                class="btn btn-primary btn-block btn-lg btn-icon rounded" 
                tooltip="{{'application.confirm' | translate}}">
                <span class="pr-1 w-100 text-right" translate>application.confirm</span>
                <svg *ngIf="!loadingStateConfirm.isStarting()" class="icon icon-white"><use xlink:href="/assets/vendor/sprite.svg#it-arrow-right-circle"></use></svg>
                <div *ngIf="loadingStateConfirm.isStarting()" class="progress-spinner progress-spinner-double size-sm progress-spinner-active">
                  <div class="progress-spinner-inner"></div>
                  <div class="progress-spinner-inner"></div>
                </div>
              </button>
              <div *ngIf="isDisableConfirm" class="text-danger"><small translate>message.validation.application.section_not_confirmed</small></div>
            </div>  
          </div>
        </div>
      </div>
    </div>  
  `
})
export class ManageApplicationComponent extends CommonEditComponent<Application> implements OnInit, OnDestroy {

  public call: Call = undefined;

  public user: User = null;
  cache: any = {};
  public affixCompleted: number = 0;
  public affix: number[];
  bsModalRefSend: BsModalRef;
  bsModalRefDelete: BsModalRef;

  subscription: Subscription;
  loadingStateConfirm: LoadingState = LoadingState.DEFAULT;
  loadingStateSend: LoadingState = LoadingState.DEFAULT;
  touch1 = {
    x:0,
    y:0,
    time:0
  };
  @ViewChild('affixComponent', {static: false}) affixComponent: ShowAffixComponent;
  @ViewChild('cardApplication', {static: false}) cardApplication: ElementRef;
  @ViewChild('confirmApplicationButton', {static: false}) confirmApplicationButton: ElementRef;
  @ViewChild('sendApplicationButton', {static: false}) sendApplicationButton: ElementRef;

  public constructor(public service: ApplicationService,
                     public callService: CallService,
                     private apiMessageService: ApiMessageService,
                     private modalService: BsModalService,
                     private authService: AuthService,
                     protected userService: UserService,
                     private cacheService: CacheService,
                     protected router: Router,
                     private el: ElementRef,
                     protected route: ActivatedRoute,
                     protected changeDetector: ChangeDetectorRef,
                     protected navigationService: NavigationService,
                     protected translateService: TranslateService) {
    super(service, router, route);
    this.subscription = this.apiMessageService.loadingEvent$.subscribe((loadingState: LoadingState) => {
      if (loadingState.url) {
        if (loadingState.url.indexOf('/save') !== -1) {
          this.loadingStateConfirm = loadingState;
        }
        if (loadingState.url.indexOf('/send') !== -1 || loadingState.url.indexOf('/save') !== -1) {
          this.loadingStateSend = loadingState;
        }
      }
    });
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
          if (call.objectTypeId == 'F:jconon_call_employees:folder' && this.user.userName !== application.user) {
            this.userService.getUser(application.user).subscribe((user: User) => {
              this.user = user;
            }); 
          }
          this.buildCreateForm();
        }, error => {
          this.entityError = error;
        });
        this.translateService.reloadLang('it').subscribe((res) => {
          this.callService.loadLabels(call.objectId).subscribe((labels) => {
            if (labels) {
              this.translateService.setTranslation('it', Helpers.convertProperties(labels), true);
            }
          });  
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
  
  private aspects(): string[] {
    var result =[
      ...this.entity.call.elenco_aspects||[], 
      ...this.entity.call.elenco_aspects_sezione_cnr||[], 
      ...this.entity.call.elenco_aspects_ulteriori_dati||[]
    ];
    result.map((aspect, i) => {
      if (aspect === 'P:jconon_application:aspect_condanne_penali_rapporto_lavoro' || 
          aspect === 'P:jconon_application:aspect_condanne_penali_required'){
        result[i] = 'P:jconon_application:aspect_condanne_penali';
      }
    });
    return result;
  }

  public buildCreateForm() {
    this.form = new FormGroup({
      'jconon_application:nome': new FormControl(this.entity.nome),
      'jconon_application:cognome': new FormControl(this.entity.cognome),
      'jconon_application:user': new FormControl(this.entity.user),
      'cmis:objectTypeId': new FormControl(this.entity.objectTypeId),
      'cmis:objectId': new FormControl(this.entity.objectId),
      'jconon_application:last_section_completed': new FormControl(this.affixCompleted),
      'aspect': new FormControl(this.aspects())
    });
  }

  @HostListener('touchstart', ['$event'])
  @HostListener('touchend', ['$event'])
  @HostListener('touchcancel', ['$event'])
  handleTouch(ev){
    var touch = ev.touches[0] || ev.changedTouches[0];
    if (ev.type === 'touchstart'){
      this.touch1.x = touch.pageX;
      this.touch1.y = touch.pageY;
      this.touch1.time = ev.timeStamp;
    } else if (ev.type === 'touchend'){
      var dx = touch.pageX - this.touch1.x;
      var dy = touch.pageY - this.touch1.y;
      var dt = ev.timeStamp - this.touch1.time;
      if (dt < 500){
        if (Math.abs(dx) > 60){
          if (dx > 0){
            this.doSwipeLeft();
          } else {
            this.doSwipeRight();
          }
        }
      }
    }  
  }

  private doSwipeLeft() {
    if (this.affixCompleted !== 0 && this.form.pristine) {
      this.affixCompleted = this.affixCompleted - 1;
      setTimeout(() => {
        this.scroll(this.cardApplication.nativeElement);
      }, 1000);  
    }
  }

  private doSwipeRight() {
    if (this.affixCompleted !== this.affix.length - 1 && this.form.pristine) {
      this.affixCompleted = this.affixCompleted + 1;
      setTimeout(() => {
        this.scroll(this.cardApplication.nativeElement);
      }, 1000);  
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event) {
      const checkInside = this.el.nativeElement.contains(event.target);
      if (!checkInside) {
        if (event.key === 'ArrowRight') {
          this.doSwipeRight();
        }
        if (event.key === 'ArrowLeft') {
          this.doSwipeLeft();  
        }  
      }
  }

  ngAfterContentChecked() : void {
    this.changeDetector.detectChanges();
  }

  @HostListener('document:keydown.enter', ['$event'])  
  handleEnterEvent(event) {
    console.log(event.target.type);
    if (event.target.type !== 'textarea') {
      this.confirmApplication(event);
    }
  }

  public confirmApplication(event: Event) {
    if (!this.isDisableConfirm && this.isFormValid && this.confirmApplicationButton) {
      this.form.controls['jconon_application:last_section_completed'].patchValue(this.affixCompleted + 1);
      this.service.saveApplication(this.buildInstance()).subscribe((application) => {
        application.call = this.call;
        this.setEntity(application);
        this.buildCreateForm();
        this.affixCompleted++;
        this.scroll(this.cardApplication.nativeElement);
      });  
    }
  }
  public printApplication(event: Event) {
    const initialState = {
      'application': this.entity
    };
    this.modalService.show(PrintApplicationComponent, Object.assign({initialState}, { animated: true, class: 'modal-dialog-left' }));
  }

  public deleteApplication(event: Event) {
    this.translateService.get('message.application.delete.question').subscribe((label) => {
      const initialState = {
        'body': label
      };
      this.bsModalRefDelete = this.modalService.show(ModalConfirmComponent, Object.assign({initialState}, { animated: true, class: 'modal-dialog-centered' }));
      this.bsModalRefDelete.content.confirm.subscribe(() => {
        this.service.deleteApplication(this.entity.objectId).subscribe((result) => {
          this.translateService.get('message.application.delete.success', {'callcode': this.entity.call.codice}).subscribe((label) => {
            this.apiMessageService.sendMessage(MessageType.SUCCESS, label);
            this.router.navigate(['/'],{relativeTo: this.route,});
          });
        });  
      });      
    });
  }

  public sendApplication(event: Event) {
    if (this.isFormValid) {
      this.form.controls['jconon_application:last_section_completed'].patchValue(this.affixCompleted);
      this.service.saveApplication(this.buildInstance()).subscribe((application) => {
        application.aspect = this.aspects();
        this.service.sendApplication(application).subscribe((result) => {
          this.translateService.get('message.application.send', {email: result.email_comunicazione}).subscribe((label) => {
            const initialState = {
              'body': label
            };        
            this.bsModalRefSend = this.modalService.show(ModalInfoComponent, Object.assign({ initialState}, { animated: true, class: 'modal-dialog-centered' }));
            this.bsModalRefSend.content.close.subscribe(() => {
              this.router.navigate(['/my-applications'],{relativeTo: this.route,});
            });
          });  
        });
      });
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
        const invalidControl = this.el.nativeElement.querySelector('input.is-invalid,textarea.invalid,select.is-invalid');
        const invalidFormControl = document.querySelector('[formcontrolname="' + control + '"], .is-invalid');
        if (invalidControl) {
          invalidControl.focus();
        } else if (invalidFormControl) {
          var inv = invalidFormControl.querySelector('input, textarea')[0];
          if (inv) {
            inv.focus();
          }
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
