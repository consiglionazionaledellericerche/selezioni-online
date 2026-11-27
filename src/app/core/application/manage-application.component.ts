import { invalidFieldsMessage } from '../../common/helpers/form-errors';
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
import { ModalRef, ModalService } from '../../shared/modal/modal.service';
import { LoadingState } from '../../auth/loading-state.enum';
import { Subscription } from 'rxjs';
import { ModalConfirmComponent } from '../../shared/tags/wizard/modal-confirm.component';
import { UserService } from '../../auth/edit/user.service';
import { PrintApplicationComponent } from './print-application.component';

@Component({
  standalone: false,
  selector: 'manage-application',
  template:
  `
    <app-layout-wait *ngIf="!isEntityError" [loaded]="isLoaded()"></app-layout-wait>
    <div *ngIf="isEntityError" class="application-error my-5" role="alert">
      <div class="alert alert-danger shadow-sm mb-0">
        <h2 class="h4 alert-heading mb-2">{{ 'application.error_title' | translate }}</h2>
        <p class="mb-4 fs-5" [innerHTML]="entityError | translate"></p>
        <div class="d-flex flex-wrap gap-2">
          <a class="btn btn-primary btn-sm" routerLink="/my-applications">{{ 'layout.my_applications' | translate }}</a>
          <a class="btn btn-outline-primary btn-sm" routerLink="/">{{ 'layout.home' | translate }}</a>
        </div>
      </div>
    </div>
    <div *ngIf="isLoaded() && !isEntityError">
      <div class="shadow-none p-3 px-1 py-3 mx-n3" #cardApplication>
        <div class="text-end">
          <span>{{'application.call.title' | translate:{value: call.codice} }}</span>
          <app-call-parent class="d-block" [call]="call"></app-call-parent>
          <app-show-children-modal 
            [parentId] = "call.objectId" 
            [buttonClass] = "'text-primary'"
            [modal_title]="'call.attach_to' | translate:{value: call.codice}">
          </app-show-children-modal>
        </div>
        <h4 class="text-center">{{ 'application.title' | translate}}</h4>
        <h5 class="text-center" innerHtml="{{translateService.currentLang == 'it'? call.descrizione : call.descrizione_en}}"></h5>
        <h3 *ngIf="entity.stato_domanda != 'I'"> 
          <span class="badge d-block" [ngClass]="{'bg-warning': entity.isProvvisoria(),'bg-success': entity.isConfermata()}">
          {{'application.state.' + entity.stato_domanda|translate|uppercase}}
          </span>
        </h3>
        <h5 class="text-center">
          <span>{{'application.sottoscritto.' + (entity.sesso || 'M') | translate}}</span>
          <span class="ps-1">{{entity.cognome|uppercase}}</span>
          <span class="ps-1">{{entity.nome|uppercase}}</span>
        </h5>
        <h5 class="text-center" *ngIf="call.objectTypeId == 'F:jconon_call_employees:folder' && (user?.matricola || entity.email_comunicazioni)">
          <span *ngIf="user?.matricola">{{'user.matricola_value' | translate:{value: user.matricola} }}</span>
          <span class="ps-1" *ngIf="entity.email_comunicazioni">{{'user.email_value' | translate:{value: entity.email_comunicazioni} }}</span>
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
        <div class="card-header p-0 section-tabs-wrapper">
          <ul class="nav nav-tabs section-tabs" role="tablist">
            <li class="nav-item" *ngFor="let number of affix" role="presentation">
              <a class="nav-link" href="javascript:void(0)" role="tab"
                 [class.active]="number === affixCompleted"
                 [attr.aria-selected]="number === affixCompleted"
                 [title]="tabLabel(call.elenco_sezioni_domanda[number])"
                 (click)="goToSection(number)">
                <span class="section-number" [class.done]="number < entity.last_section_completed">
                  <svg *ngIf="number < entity.last_section_completed" class="icon icon-xs icon-white"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-check"></use></svg>
                  <span *ngIf="!(number < entity.last_section_completed)">{{ number + 1 }}</span>
                </span>
                <span class="section-name">{{ tabLabel(call.elenco_sezioni_domanda[number]) }}</span>
              </a>
            </li>
          </ul>
        </div>
        <div *ngIf="preview" class="preview-callout mx-3 mt-3 mb-0" role="status">
          <svg class="icon icon-primary flex-shrink-0" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-info-circle"></use></svg>
          <div><strong>{{ 'application.preview.title' | translate }}</strong> — {{ 'application.preview.info' | translate }}</div>
        </div>
        <div class="card-body mt-2">  
          <div *ngIf="sectionIntro(call.elenco_sezioni_domanda[affixCompleted]) as intro" class="section-intro mx-3 mt-3 small"
            [innerHTML]="intro"></div>
          <show-affix #affixComponent [form]="form" [cmisObject]="entity" [type]="call.elenco_sezioni_domanda[affixCompleted]"></show-affix>
          <div class="steppers">
            <nav class="steppers-nav px-0">
              <a [ngClass]="{'disabled': affixCompleted == 0}" 
                (click)="goToSection(affixCompleted - 1)" 
                class="btn btn-link text-primary steppers-btn-prev px-1">
                <svg class="icon icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-chevron-left"></use></svg>
                <span translate>previous</span>
              </a>
              <span class="small text-secondary">{{ 'layout.section_of' | translate:{current: affixCompleted + 1, total: affix.length} }}</span>
              <a [ngClass]="{'disabled': affixCompleted == affix.length - 1}" 
                (click)="goToSection(affixCompleted + 1)" 
                class="btn btn-link text-primary steppers-btn-next px-1">
                <span translate>next</span>
                <svg class="icon icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-chevron-right"></use></svg>
              </a>
            </nav>
          </div>
        </div>
        <div class="card-footer rounded-bottom" *ngIf="!preview">
          <div class="d-flex justify-content-end">
            <div class="form-group text-start me-auto">
              <button 
                [disabled]="!form.pristine"
                (click)="deleteApplication($event)" 
                class="btn btn-outline-danger btn-lg btn-icon me-2" 
                [itTooltip]="'application.delete'| translate">
                <span class="d-none d-md-block pe-1" translate>application.delete</span>
                <svg class="icon icon-danger"><use href="/assets/bootstrap-italia/svg/sprites.svg#it-delete"></use></svg>
              </button>
            </div>
            <div class="form-group text-end">
              <button 
                [disabled]="!form.pristine"
                (click)="printApplication($event)" 
                class="btn btn-outline-primary btn-lg btn-icon me-2" 
                [itTooltip]="'application.print.application'| translate">
                <span class="d-none d-md-block pe-1" translate>application.print.application</span>
                <svg class="icon icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-print"></use></svg>
              </button>
            </div>
            <div *ngIf="affixCompleted == affix.length - 1" class="form-group text-end">  
              <button (click)="sendApplication($event)" 
                #sendApplicationButton 
                [disabled]="isDisableConfirm || loadingStateSend.isStarting()"
                class="btn btn-primary w-100 btn-lg btn-icon me-2 rounded" 
                [itTooltip]="'application.send' | translate">
                <span class="pe-1 w-100 text-end" translate>application.send</span>
                <svg *ngIf="!loadingStateSend.isStarting()" class="icon icon-white"><use href="/assets/bootstrap-italia/svg/sprites.svg#it-upload"></use></svg>              
                <div *ngIf="loadingStateSend.isStarting()" class="progress-spinner progress-spinner-double size-sm progress-spinner-active">
                  <div class="progress-spinner-inner"></div>
                  <div class="progress-spinner-inner"></div>
                </div>
              </button>
              <div *ngIf="isDisableConfirm" class="text-danger"><small translate>message.validation.application.section_not_confirmed</small></div>
            </div>  
            <div *ngIf="affixCompleted < affix.length - 1" class="form-group text-end">
              <button (click)="confirmApplication($event);"
                #confirmApplicationButton 
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
export class ManageApplicationComponent extends CommonEditComponent<Application> implements OnInit, OnDestroy {

  public call: Call = undefined;

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
  @ViewChild('affixComponent') affixComponent: ShowAffixComponent;
  @ViewChild('cardApplication') cardApplication: ElementRef;
  @ViewChild('confirmApplicationButton') confirmApplicationButton: ElementRef;
  @ViewChild('sendApplicationButton') sendApplicationButton: ElementRef;

  public constructor(public service: ApplicationService,
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
  
  /** Anteprima della domanda (dalla gestione del bando): nessun salvataggio, navigazione libera. */
  public preview = false;

  public ngOnInit() {
    this.route.queryParams.subscribe((queryParams) => {
      this.callService.getById(queryParams['callId']).subscribe((call) => {
        this.call = call;
        this.user = this.authService.getUser();
        this.affix = Array(call.elenco_sezioni_domanda.length).fill(0).map((x,i)=>i);
        this.preview = queryParams['preview'] === 'true' || queryParams['preview'] === true;
        if (this.preview) {
          // anteprima: domanda vuota non salvata, senza i controlli sul candidato del backend
          const application = this.service.buildInstance({
            'cmis:objectTypeId': 'F:jconon_application:folder',
            'cmis:baseTypeId': 'cmis:folder',
            'jconon_application:stato_domanda': 'P',
            'jconon_application:user': this.user ? this.user.userName : ''
          });
          application.call = call;
          this.setEntity(application);
          this.affixCompleted = 0;
          this.buildCreateForm();
        } else
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
      ...this.entity.call.elenco_aspects_ulteriori_dati||[],
      // come nel legacy anche le sezioni 4 e 5 (es. dichiarazioni sul trattamento dei dati e sul D.P.R. 445/2000):
      // senza l'aspect nell'elenco il backend ignora le sue proprietà
      ...this.entity.call.elenco_aspects_sezione_4||[],
      ...this.entity.call.elenco_aspects_sezione_5||[]
    ].filter(aspect => !!aspect);
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

  /**
   * Cambio di sezione (schede, Avanti, Indietro): con modifiche non salvate la sezione viene prima salvata
   * in bozza; se ha errori si resta e vengono elencati i campi da correggere. Le sezioni restano sempre
   * raggiungibili (es. dopo un errore di invio per tornare a correggere).
   */
  public goToSection(section: number) {
    if (section === this.affixCompleted || section < 0 || section >= this.affix.length) {
      return;
    }
    if (this.preview || this.form.pristine) {
      this.affixCompleted = section;
      this.scroll(this.cardApplication.nativeElement);
      return;
    }
    if (!this.isFormValid) {
      return;
    }
    this.service.saveApplication(this.buildInstance()).subscribe((application) => {
      application.call = this.call;
      this.setEntity(application);
      this.buildCreateForm();
      this.affixCompleted = section;
      this.scroll(this.cardApplication.nativeElement);
    });
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
        // la domanda salvata conserva in extraProperties anche le proprietà non dichiarate nel modello
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
          var inv = invalidFormControl.querySelector('input, textarea')[0];
          if (inv) {
            inv.focus();
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

  get isDisableConfirm() : boolean {
    return this.entity.last_section_completed < this.affixCompleted;
  }

  public buildInstance(): Application {
    const value = this.form.value;
    const application = this.service.buildInstance(value);
    // anche le proprietà che il modello non dichiara (aspect generici), altrimenti perse nel salvataggio:
    // quelle già salvate (anche delle altre sezioni) aggiornate con i valori della sezione corrente
    application.extraProperties = Object.keys(value)
      .filter(key => key.includes(':'))
      .reduce((extra, key) => ({ ...extra, [key]: value[key] }), { ...(this.entity?.extraProperties || {}) });
    return application;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /** Righe di un'etichetta personalizzata (testo o HTML), divise dopo gli a capo, i <br> e la fine dei blocchi. */
  private labelLines(key: string): string[] {
    const label = this.translateService.instant(key || '');
    if (!label || label === key) {
      return [];
    }
    return String(label)
      .replace(/<br\s*\/?>|<\/(p|div|h[1-6]|li|ul|ol|table|tr)>/gi, match => match + '\n')
      .split(/\r?\n/);
  }

  /** Testo introduttivo della sezione: l'etichetta personalizzata dopo la prima riga (che è il nome della scheda). */
  public sectionIntro(key: string): string {
    const lines = this.labelLines(key);
    const first = lines.findIndex(line => !!Helpers.stripHtml(line));
    if (first < 0) {
      return '';
    }
    const rest = lines.slice(first + 1).join('\n').trim();
    if (!Helpers.stripHtml(rest)) {
      return '';
    }
    // testo semplice: gli a capo diventano <br> (l'HTML resta com'è)
    return /<[a-z][^>]*>/i.test(rest) ? rest : rest.replace(/\r?\n/g, '<br>');
  }

  /** Nome della sezione nella scheda, senza il prefisso "Sezione I - " (il numero è già nel cerchio). */
  public tabLabel(key: string): string {
    const label = this.translateService.instant(key || '') || key;
    // le etichette personalizzate possono contenere HTML e un testo introduttivo dopo il titolo
    // (righe, <br> o blocchi successivi): nella scheda solo il testo della prima riga
    const firstLine = this.labelLines(key).map(line => Helpers.stripHtml(line)).find(line => !!line) ||
      Helpers.stripHtml(String(label)) || String(key);
    const text = firstLine
      .replace(/^\s*(sezione|section)\s+[ivxlcdm\d]+\s*[-–:.]\s*/i, '')
      .replace(/^\s*(sezione|section)\s+/i, '');
    // nomi tutti in maiuscolo: in forma normale, più leggibili e meno larghi nelle schede
    return text.length > 3 && text === text.toUpperCase() && /[A-Z]/.test(text)
      ? text.charAt(0) + text.slice(1).toLowerCase()
      : text;
  }
}
