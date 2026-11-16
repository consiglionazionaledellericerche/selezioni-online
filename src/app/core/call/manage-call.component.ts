import { invalidFieldsMessage } from '../../common/helpers/form-errors';
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
import { ModalRef, ModalService } from '../../shared/modal/modal.service';
import { LoadingState } from '../../auth/loading-state.enum';
import { of as observableOf, Observable, Subscription } from 'rxjs';
import { ModalConfirmComponent } from '../../shared/tags/wizard/modal-confirm.component';
import { UserService } from '../../auth/edit/user.service';
import { ManageCallService } from './manage-call.service';
import { CreateChildCallComponent } from './manage/create-child-call.component';
import { ExportApplicationsComponent } from './shared/export-applications.component';

@Component({
  standalone: false,
  selector: 'manage-call',
  template:
  `
    <app-layout-wait *ngIf="!isEntityError" [loaded]="isLoaded()"></app-layout-wait>
    <div *ngIf="isEntityError" class="alert alert-danger">
      <strong innerHtml="{{entityError | translate}}"></strong>
    </div>
    <div *ngIf="isLoaded() && !isEntityError">
      <div class="pb-3" #cardCall>
        <app-call-header *ngIf="entity?.objectId" [call]="entity" page="call_manage.edit_title"></app-call-header>
        <div *ngIf="copyFrom" class="alert alert-info py-2 mt-3" translate>call_manage.copy.info</div>
        <div class="d-flex flex-wrap align-items-center gap-2 mt-3 pb-2 border-bottom manage-head">
          <h1 class="h3 mb-0 text-primary me-2">{{ callType | translate }}</h1>
          <span *ngIf="entity?.objectId" class="badge rounded-pill" [ngClass]="entity.pubblicato ? 'bg-success' : 'bg-secondary'">
            {{ (entity.pubblicato ? 'call_manage.published' : 'call_manage.not_published') | translate }}
          </span>
          <div *ngIf="entity?.objectId" class="ms-auto d-flex flex-wrap align-items-center gap-2">
            <a class="btn btn-outline-primary btn-sm" [routerLink]="['/call-detail']" [queryParams]="{callCode: entity.codice}">
              <svg class="icon icon-primary icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-file"></use></svg>
              {{ 'call_manage.view_detail' | translate }}
            </a>
            <a class="btn btn-outline-primary btn-sm" [routerLink]="['/manage-application']" [queryParams]="{callId: entity.objectId, preview: true}">
              <svg class="icon icon-primary icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-password-visible"></use></svg>
              {{ 'call_manage.preview' | translate }}
            </a>
            <it-dropdown mode="button" color="primary" class="manage-actions">
              <span button class="d-inline-flex align-items-center">{{ 'call_manage.actions' | translate }}</span>
              <ng-container list>
                <li><a class="dropdown-item list-item" href="javascript:" [class.disabled]="publishing" (click)="onPublish()">
                  <svg class="icon icon-sm icon-primary me-2"><use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + (entity.pubblicato ? 'it-password-invisible' : 'it-password-visible')"></use></svg>{{ (entity.pubblicato ? 'call_manage.unpublish' : 'call_manage.publish') | translate }}</a></li>
                <li><a class="dropdown-item list-item" [routerLink]="['/call-commission']" [queryParams]="{callId: entity.objectId}">
                  <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-user"></use></svg>{{ 'call_manage.commission.title' | translate }}</a></li>
                <li><a class="dropdown-item list-item" [routerLink]="['/call-labels']" [queryParams]="{callId: entity.objectId}">
                  <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-bookmark"></use></svg>{{ 'call_manage.labels.title' | translate }}</a></li>
                <li><a class="dropdown-item list-item" [routerLink]="['/call-communications']" [queryParams]="{callId: entity.objectId, kind: 'convocazioni'}">
                  <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-calendar"></use></svg>{{ 'communications.kind.convocazioni' | translate }}</a></li>
                <li><a class="dropdown-item list-item" [routerLink]="['/call-communications']" [queryParams]="{callId: entity.objectId, kind: 'esclusioni'}">
                  <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-ban"></use></svg>{{ 'communications.kind.esclusioni' | translate }}</a></li>
                <li><a class="dropdown-item list-item" [routerLink]="['/call-communications']" [queryParams]="{callId: entity.objectId, kind: 'comunicazioni'}">
                  <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-mail"></use></svg>{{ 'communications.kind.comunicazioni' | translate }}</a></li>
                <li><a class="dropdown-item list-item" href="javascript:" (click)="onExport()">
                  <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-download"></use></svg>{{ 'export.menu' | translate }}</a></li>
                <li *ngIf="isConcorsi()"><a class="dropdown-item list-item" [routerLink]="['/call-permissions']" [queryParams]="{callId: entity.objectId}">
                  <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-locked"></use></svg>{{ 'call_manage.permissions.title' | translate }}</a></li>
                <ng-container *ngIf="isMacroCall()">
                  <li><a class="dropdown-item list-item" href="javascript:" (click)="onCreateChild()">
                    <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-plus-circle"></use></svg>{{ 'call_manage.child.title' | translate }}</a></li>
                  <li><a class="dropdown-item list-item" [routerLink]="['/call-children']" [queryParams]="{callId: entity.objectId}">
                    <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-folder"></use></svg>{{ 'call_manage.children.title' | translate }}</a></li>
                </ng-container>
                <li><a class="dropdown-item list-item" href="javascript:" (click)="onCopy()">
                  <svg class="icon icon-sm icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-copy"></use></svg>{{ 'call_manage.copy.button' | translate }}</a></li>
                <li><span class="divider"></span></li>
                <li><a class="dropdown-item list-item text-danger" href="javascript:" (click)="onDelete()">
                  <svg class="icon icon-sm icon-danger me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-delete"></use></svg>{{ 'delete' | translate }}</a></li>
              </ng-container>
            </it-dropdown>
          </div>
        </div>
      </div>
      <div class="card card-bg border-bottom-card">
        <div class="card-header p-0 section-tabs-wrapper">
          <ul class="nav nav-tabs section-tabs" role="tablist">
            <li class="nav-item" *ngFor="let number of affix" role="presentation">
              <a class="nav-link" href="javascript:void(0)" role="tab"
                 [class.active]="number === affixCompleted"
                 [class.disabled]="number !== affixCompleted && !form.pristine && !isDisableConfirm"
                 [attr.aria-selected]="number === affixCompleted"
                 [itTooltip]="(number !== affixCompleted && !form.pristine && !isDisableConfirm) ? ('layout.save_before_switch' | translate) : ''"
                 (click)="(number === affixCompleted || form.pristine || isDisableConfirm) && (affixCompleted = number) !== undefined && scroll(cardCall);">
                <span class="section-number" [class.done]="number < affixCompleted">
                  <svg *ngIf="number < affixCompleted" class="icon icon-xs icon-white"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-check"></use></svg>
                  <span *ngIf="!(number < affixCompleted)">{{ number + 1 }}</span>
                </span>
                <span class="section-name">{{ tabLabel(affixCall[number]) }}</span>
              </a>
            </li>
          </ul>
        </div>
        <div class="card-body mt-2">  
          <show-affix #affixComponent [form]="form" [cmisObject]="entity" [type]="affixCall[affixCompleted]"></show-affix>
          <div class="steppers">
            <nav class="steppers-nav px-0">
              <a [ngClass]="{'disabled': (affixCompleted == 0 || !form.pristine) && !isDisableConfirm}" 
                (click)="affixCompleted = affixCompleted - 1;scroll(cardCall);" 
                class="btn btn-link text-primary steppers-btn-prev px-1">
                <svg class="icon icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-chevron-left"></use></svg>
                <span translate>previous</span>
              </a>
              <span class="small text-secondary">{{ 'layout.section_of' | translate:{current: affixCompleted + 1, total: affix.length} }}</span>
              <a [ngClass]="{'disabled': affixCompleted == affix.length - 1 || !form.pristine}" 
                (click)="affixCompleted = affixCompleted + 1;scroll(cardCall);" 
                class="btn btn-link text-primary steppers-btn-next px-1">
                <span translate>next</span>
                <svg class="icon icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-chevron-right"></use></svg>
              </a>
            </nav>
          </div>
        </div>
        <div class="card-footer rounded-bottom">
          <div class="d-flex justify-content-end">
            <div class="form-group text-start me-auto">

            </div>
            <div *ngIf="affixCompleted == affix.length - 1" class="form-group text-end">
              <button (click)="confirmCall($event, false)"
                [disabled]="loadingStateConfirm.isStarting()"
                class="btn btn-primary w-100 btn-lg btn-icon me-2 rounded">
                <span class="pe-1 w-100 text-end" translate>save</span>
                <svg class="icon icon-white"><use href="/assets/bootstrap-italia/svg/sprites.svg#it-check-circle"></use></svg>
              </button>
            </div>
            <div *ngIf="affixCompleted < affix.length - 1" class="form-group text-end">
              <button (click)="confirmCall($event);"
                #confirmCallButton 
                [disabled]="isDisableConfirm || loadingStateConfirm.isStarting()"
                class="btn btn-primary w-100 btn-lg btn-icon rounded" 
                [itTooltip]="'application.confirm' | translate">
                <span class="pe-1 w-100 text-end" translate>application.confirm</span>
                <svg *ngIf="!loadingStateConfirm.isStarting()" class="icon icon-white"><use href="/assets/bootstrap-italia/svg/sprites.svg#it-arrow-right-circle"></use></svg>
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
  bsModalRefSend: ModalRef;
  bsModalRefDelete: ModalRef;

  subscription: Subscription;
  loadingStateConfirm: LoadingState = LoadingState.DEFAULT;
  loadingStateSend: LoadingState = LoadingState.DEFAULT;
  touch1 = {
    x:0,
    y:0,
    time:0
  };
  affixCall = [
    'affix_tabCallDetail',
    'affix_tabCallSettings',
    'affix_tabCallAspirantDetail',
    'affix_tabCallScore',
    'affix_tabCallAccountable',
    'affix_tabCallHelpDesk',
    'affix_tabCallAttachments'
  ];
  callType: string;
  objectId: string;
  copyFrom: string;
  publishing = false;
  @ViewChild('affixComponent') affixComponent: ShowAffixComponent;
  @ViewChild('cardCall') cardCall: ElementRef;
  @ViewChild('confirmCallButton') confirmCallButton: ElementRef;

  public constructor(public service: CallService,
                     public callService: CallService,
                     private apiMessageService: ApiMessageService,
                     private modalService: ModalService,
                     private authService: AuthService,
                     protected userService: UserService,
                     private cacheService: CacheService,
                     protected router: Router,
                     private el: ElementRef,
                     protected route: ActivatedRoute,
                     protected changeDetector: ChangeDetectorRef,
                     protected navigationService: NavigationService,
                     protected translateService: TranslateService,
                     protected manageCallService: ManageCallService) {
    super(service, router, route);
    this.subscription = this.apiMessageService.loadingEvent$.subscribe((loadingState: LoadingState) => {
      if (loadingState.url) {
        if (loadingState.url.indexOf('/save') !== -1 || loadingState.url.indexOf('/update') !== -1) {
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
      this.objectId = queryParams['cmis:objectId'];
      this.copyFrom = queryParams['copyFrom'];
      this.affix = Array(this.affixCall.length).fill(0).map((x,i)=>i);
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
      } else if (this.copyFrom) {
        // Copia: il nuovo bando parte dai dati dell'originale, senza identificativo, codice e pubblicazione
        this.callService.getById(this.copyFrom).subscribe((call) => {
          call.objectId = undefined;
          call.codice = undefined;
          call.pubblicato = false;
          (call as any).rdp = undefined;
          call.commissione = undefined;
          this.entity = call;
          this.callType = call.objectTypeId;
          this.user = this.authService.getUser();
          this.buildCreateForm();
        });
      } else {
        this.entity = new Call(); 
        this.entity.objectTypeId = this.callType;       
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
      'cmis:objectId': new FormControl(this.objectId),
      'cmis:objectTypeId': new FormControl(this.callType),
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

  public confirmCall(event: Event, next = true) {
    if (!this.isFormValid) {
      return;
    }
    const isNew = !this.entity || !this.entity.objectId;
    this.manageCallService.saveCall(this.form.value, this.entity).subscribe((call) => {
      this.setEntity(call);
      this.objectId = call.objectId;
      this.buildCreateForm();
      if (next && this.affixCompleted < this.affix.length - 1) {
        this.affixCompleted++;
      }
      if (isNew) {
        if (this.copyFrom) {
          this.manageCallService.copyLabels(call.objectId, this.copyFrom).subscribe();
        }
        this.copyFrom = undefined;
        this.router.navigate([], {
          relativeTo: this.route,
          replaceUrl: true,
          queryParams: { 'call-type': call.objectTypeId, 'cmis:objectId': call.objectId }
        });
      }
    });
  }

  public isConcorsi(): boolean {
    return ManageCallService.isConcorsi(this.authService.getUser());
  }

  public isMacroCall(): boolean {
    return ManageCallService.isMacroCall(this.entity);
  }

  public onPublish() {
    const publish = !this.entity.pubblicato;
    this.confirm(publish ? 'call_manage.confirm_publish' : 'call_manage.confirm_unpublish', () => {
      this.publishing = true;
      this.manageCallService.publish(this.entity.objectId, publish).subscribe(() => {
        this.publishing = false;
        this.apiMessageService.sendMessage(MessageType.SUCCESS,
          publish ? 'call_manage.published_done' : 'call_manage.unpublished_done');
        this.callService.getById(this.entity.objectId).subscribe(call => {
          this.entity = call;
          this.buildCreateForm();
        });
      }, () => this.publishing = false);
    });
  }

  public onDelete() {
    this.confirm('call_manage.confirm_delete', () => {
      this.manageCallService.deleteCall(this.entity.objectId).subscribe(() => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, 'call_manage.deleted');
        this.router.navigate(['/']);
      });
    });
  }

  public onExport() {
    this.modalService.show(ExportApplicationsComponent, { initialState: { call: this.entity }, class: 'modal-lg' });
  }

  public onCopy() {
    this.router.navigate(['/manage-call'], {
      queryParams: { 'call-type': this.entity.objectTypeId, 'copyFrom': this.entity.objectId }
    });
  }

  public onCreateChild() {
    const modalRef = this.modalService.show(CreateChildCallComponent,
      Object.assign({ initialState: { parent: this.entity } }, { animated: true, class: 'modal-lg' }));
    modalRef.content.created.subscribe((childId: string) => {
      this.router.navigate(['/manage-call'], {
        queryParams: { 'call-type': this.entity.objectTypeId, 'cmis:objectId': childId }
      });
    });
  }

  private confirm(body: string, action: () => void) {
    const modalRef = this.modalService.show(ModalConfirmComponent,
      Object.assign({ initialState: { body } }, { animated: true, class: 'modal-dialog-centered' }));
    modalRef.content.confirm.subscribe(() => action());
  }

  get isFormValid() : boolean {
    Object.keys(this.form.controls).forEach(control => {
      if (this.form.controls[control].status === 'INVALID') {
        this.form.controls[control].markAsDirty({onlySelf: true});
        this.form.controls[control].markAsTouched({onlySelf: true});
        this.form.controls[control].patchValue(this.form.controls[control].value || null);
        const invalidControl = this.el.nativeElement.querySelector('input.is-invalid,textarea.invalid,select.is-invalid');
        const invalidFormControl = document.querySelector('[formcontrolname="' + control + '"], .is-invalid');
        if (invalidControl) {
          invalidControl.focus();
        } else if (invalidFormControl) {
          var inv = invalidFormControl.querySelector('input, textarea');
          if (inv) {
            inv[0].focus();
          }
        }
      }      
    });
    if (this.form.invalid) {
        this.apiMessageService.sendMessage(MessageType.ERROR,
          invalidFieldsMessage(this.form, this.translateService, this.el.nativeElement));
    }
    return !this.form.invalid;
  }

  public buildInstance(): Call {
    return this.service.buildInstance(this.form.value);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /** Nome della sezione nella scheda, senza il prefisso "Sezione I - " (il numero è già nel cerchio). */
  public tabLabel(key: string): string {
    const label = this.translateService.instant(key || '') || key;
    const text = String(label)
      .replace(/^\s*(sezione|section)\s+[ivxlcdm\d]+\s*[-–:.]\s*/i, '')
      .replace(/^\s*(sezione|section)\s+/i, '');
    // nomi tutti in maiuscolo: in forma normale, più leggibili e meno larghi nelle schede
    return text.length > 3 && text === text.toUpperCase() && /[A-Z]/.test(text)
      ? text.charAt(0) + text.slice(1).toLowerCase()
      : text;
  }
}
