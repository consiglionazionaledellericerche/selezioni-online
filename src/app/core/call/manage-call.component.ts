import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonEditComponent } from '../../common/controller/common-edit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { NavigationService } from '../navigation.service';
import { Call } from './call.model';
import { CallService } from './call.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/model/user.model';
import { CacheService } from '../cache.service';
import { ApiMessageService, MessageType } from '../api-message.service';
import { ShowAffixComponent } from '../../shared/tags/show/show-affix.component';
import { Helpers } from '../../common/helpers/helpers';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LoadingState } from '../../auth/loading-state.enum';
import { of as observableOf, Observable, Subscription } from 'rxjs';
import { ModalConfirmComponent } from '../../shared/tags/wizard/modal-confirm.component';
import { UserService } from '../../auth/edit/user.service';

@Component({
  selector: 'manage-call',
  template:
  `
    <app-layout-wait *ngIf="!isEntityError" [loaded]="isLoaded()"></app-layout-wait>
    <div *ngIf="isEntityError" class="alert alert-danger">
      <strong innerHtml="{{entityError | translate}}"></strong>
    </div>
    <div *ngIf="isLoaded() && !isEntityError">
      <div class="pb-3" #cardCall>
        <h1 class="text-monospace text-primary">{{callType | translate}}</h1>
      </div>
      <div class="card card-bg border-bottom-card">
        <div class="card-header d-flex">
          <div class="h1 flex-grow-1">{{affixCall[affixCompleted] | translate}}</div>
          <div class="h4">{{affixCompleted + 1}}/{{affix.length}}</div>
        </div>
        <div class="card-body mt-2">  
          <show-affix #affixComponent [form]="form" [cmisObject]="entity" [type]="affixCall[affixCompleted]"></show-affix>
          <div class="steppers">
            <nav class="steppers-nav px-0">
              <a [ngClass]="{'disabled': (affixCompleted == 0 || !form.pristine) && !isDisableConfirm}" 
                (click)="affixCompleted = affixCompleted - 1;scroll(cardCall);" 
                class="btn btn-link text-primary steppers-btn-prev px-1">
                <svg class="icon icon-primary"><use xlink:href="/assets/vendor/sprite.svg#it-chevron-left"></use></svg>
                <span translate>previous</span>
              </a>
              <ul class="steppers-dots d-flex">
                <li *ngFor="let number of affix" 
                  [popover]="affixCall[number] | translate"
                  triggers="mouseenter:mouseleave">
                  <a [ngClass]="{'disabled': !form.pristine && !isDisableConfirm}" 
                    class="btn"                   
                    (click)="affixCompleted = number;scroll(cardCall);"></a>
                </li>
              </ul>
              <a [ngClass]="{'disabled': affixCompleted == affix.length - 1 || !form.pristine}" 
                (click)="affixCompleted = affixCompleted + 1;scroll(cardCall);" 
                class="btn btn-link text-primary steppers-btn-next px-1">
                <span translate>next</span>
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
export class ManageCallComponent extends CommonEditComponent<Call> implements OnInit, OnDestroy {

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
  affixCall = [
    'affix_tabCallDettagli',
    'affix_tabCallImpostazioni',
    'affix_tabCallDettagliCandidato',
    'affix_tabCallPunteggi',
    'affix_tabCallResponsabili',
    'affix_tabCallHelpDesk',
    'affix_tabCallAttachments'
  ];
  callType: string;
  @ViewChild('affixComponent') affixComponent: ShowAffixComponent;
  @ViewChild('cardCall') cardCall: ElementRef;
  @ViewChild('confirmApplicationButton') confirmApplicationButton: ElementRef;
  @ViewChild('sendApplicationButton') sendApplicationButton: ElementRef;

  public constructor(public service: CallService,
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
      this.callType = queryParams['call-type']; 
      this.affix = Array(this.affixCall.length).map((x,i)=>i);
      if (queryParams['cmis:objectId']) {
        this.callService.getById(queryParams['cmis:objectId']).subscribe((call) => {
          this.entity = call;
          this.user = this.authService.getUser();
          this.translateService.reloadLang('it').subscribe((res) => {
            this.callService.loadLabels(call.objectId).subscribe((labels) => {
              if (labels) {
                this.translateService.setTranslation('it', Helpers.convertProperties(labels), true);
              }
            });  
          });
          this.buildCreateForm();
        });
      } else {
        this.entity = new Call();        
        this.buildCreateForm();
      }
    }); 
    this.cacheService.cache().subscribe((cache) => {
      this.cache = cache;
    });
    super.ngOnInit();
  }
  
  public buildCreateForm() {
    this.form = new FormGroup({
    });
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({
      behavior:"smooth"
    });
  }
  
  public setEntity(entity: Call) {
    this.entity = entity;
  }

  public buildUpdateForm(id: number, entity: Call) {
    this.form = new FormGroup({
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
        this.scroll(this.cardCall.nativeElement);
      }, 1000);  
    }
  }

  private doSwipeRight() {
    if (this.affixCompleted !== this.affix.length - 1 && this.form.pristine) {
      this.affixCompleted = this.affixCompleted + 1;
      setTimeout(() => {
        this.scroll(this.cardCall.nativeElement);
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
      //this.confirmApplication(event);
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

  public buildInstance(): Call {
    return this.service.buildInstance(this.form.value);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
