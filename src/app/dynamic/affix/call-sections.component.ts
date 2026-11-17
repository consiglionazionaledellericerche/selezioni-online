import { ChangeDetectorRef, Component, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ModalRef, ModalService } from '../../shared/modal/modal.service';
import { EMPTY, forkJoin, of } from 'rxjs';
import { catchError, expand, reduce, switchMap } from 'rxjs/operators';
import { DynamicComponent } from '../dynamic.component';
import { Call } from '../../core/call/call.model';
import { CacheService } from '../../core/cache.service';
import { ConfigService } from '../../core/config.service';
import { AuthService } from '../../auth/auth.service';
import { ApiMessageService, MessageType } from '../../core/api-message.service';
import { Helpers } from '../../common/helpers/helpers';
import { CallManagementCache, ManageCallService } from '../../core/call/manage-call.service';
import { ManageDocumentComponent } from '../../core/document/manage-document.component';
import { ChildrenListComponent } from '../../core/children/children-list.component';
import { ChildrenService } from '../../core/children/children.service';
import { Document } from '../../common/model/document.model';
import { toBoolean } from './call-settings.component';

/**
 * Sezione III del bando (ex affix_sezione_3): sezioni della domanda dedicate al candidato,
 * allegati, curriculum, prodotti e schede anonime.
 */
@Component({
  standalone: false,
  selector: 'affix_tabCallAspirantDetail',
  template: `
    <form [formGroup]="form" *ngIf="isLoaded() && options">
      <div class="row gx-2 pb-2">
        <div class="form-group col-md-12" *ngFor="let field of fields">
          <app-control-select-model
            [inline]="true"
            [multiple]="true"
            [labelactive]="'true'"
            [label]="'label.jconon_call.' + field.name | translate"
            [strings]="options[field.list]"
            [formControlName]="'jconon_call:' + field.name">
          </app-control-select-model>
        </div>
      </div>
      <div class="row gx-2">
        <div class="form-group col-md-4">
          <app-control-text
            type="number"
            [inline]="true"
            [showValidation]="true"
            [label]="'label.jconon_call.numero_max_prodotti'| translate"
            formControlName="jconon_call:numero_max_prodotti">
          </app-control-text>
        </div>
        <div class="col-md-8 align-self-center">
          <app-control-toggle
            [inline]="true"
            [label]="'label.jconon_call.scheda_anonima_sintetica'| translate"
            formControlName="jconon_call:scheda_anonima_sintetica">
          </app-control-toggle>
        </div>
      </div>
    </form>
  `
})
export class JcononAffixCallAspirantDetailComponent extends DynamicComponent<Call> {

  public fields = [
    { name: 'elenco_aspects', list: 'jsonlistApplicationAspects' },
    { name: 'elenco_aspects_sezione_cnr', list: 'jsonlistApplicationAspects' },
    { name: 'elenco_aspects_ulteriori_dati', list: 'jsonlistApplicationAspects' },
    { name: 'elenco_aspects_sezione_4', list: 'jsonlistApplicationAspects' },
    { name: 'elenco_aspects_sezione_5', list: 'jsonlistApplicationAspects' },
    { name: 'elenco_association', list: 'jsonlistApplicationAttachments' },
    { name: 'elenco_sezioni_curriculum', list: 'jsonlistApplicationCurriculums' },
    { name: 'elenco_sezioni_curriculum_ulteriore', list: 'jsonlistApplicationCurriculums' },
    { name: 'elenco_prodotti', list: 'jsonlistApplicationProdotti' },
    { name: 'elenco_schede_anonime', list: 'jsonlistApplicationSchedeAnonime' }
  ];
  public options: {[list: string]: string[]};

  constructor(
    protected cacheService: CacheService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected manageCallService: ManageCallService
  ) {
    super(cacheService, changeDetectorRef);
  }

  ngOnInit(): void {
    super.ngOnInit();
    const data: any = this.data;
    this.fields.forEach(field =>
      this.form.addControl('jconon_call:' + field.name, new FormControl(data[field.name] || [])));
    this.form.addControl('jconon_call:numero_max_prodotti',
      new FormControl(data.numero_max_prodotti, [Helpers.patternValidator(/^[0-9]*$/, { onlyNumber: true })]));
    this.form.addControl('jconon_call:scheda_anonima_sintetica', new FormControl(toBoolean(data.scheda_anonima_sintetica)));
    this.manageCallService.callManagementCache().subscribe((cache: CallManagementCache) => {
      const options = {};
      this.fields.forEach(field => options[field.list] = (cache[field.list] || []).map(item => item.key));
      this.options = options;
    });
  }
}

/**
 * Sezione IV del bando (ex affix_sezione_4): fino a 7 voci di punteggio con minimo e limite.
 */
@Component({
  standalone: false,
  selector: 'affix_tabCallScore',
  template: `
    <form [formGroup]="form" *ngIf="isLoaded()">
      <p class="small text-muted" translate>call_manage.score.info</p>
      <div class="row gx-2" *ngFor="let n of scores">
        <div class="form-group col-md-6">
          <app-control-text
            [inline]="true"
            [label]="'call_manage.score.label' | translate:{value: n}"
            [formControlName]="'jconon_call:punteggio_' + n">
          </app-control-text>
        </div>
        <div class="form-group col-md-3">
          <app-control-text
            type="number"
            [inline]="true"
            [showValidation]="true"
            [label]="'call_manage.score.min' | translate"
            [formControlName]="'jconon_call:punteggio_' + n + '_min'">
          </app-control-text>
        </div>
        <div class="form-group col-md-3">
          <app-control-text
            type="number"
            [inline]="true"
            [showValidation]="true"
            [label]="'call_manage.score.limit' | translate"
            [formControlName]="'jconon_call:punteggio_' + n + '_limite'">
          </app-control-text>
        </div>
      </div>
    </form>
  `
})
export class JcononAffixCallScoreComponent extends DynamicComponent<Call> {

  public scores = [1, 2, 3, 4, 5, 6, 7];

  constructor(protected cacheService: CacheService, protected changeDetectorRef: ChangeDetectorRef) {
    super(cacheService, changeDetectorRef);
  }

  ngOnInit(): void {
    super.ngOnInit();
    const data: any = this.data;
    const numeric = Helpers.patternValidator(/^-?[0-9]*([.,][0-9]+)?$/, { onlyNumber: true });
    this.scores.forEach(n => {
      this.form.addControl('jconon_call:punteggio_' + n, new FormControl(data['punteggio_' + n]));
      this.form.addControl('jconon_call:punteggio_' + n + '_min', new FormControl(data['punteggio_' + n + '_min'], [numeric]));
      this.form.addControl('jconon_call:punteggio_' + n + '_limite', new FormControl(data['punteggio_' + n + '_limite'], [numeric]));
    });
  }
}

/**
 * Sezione Responsabili: gestore del bando e membri del gruppo RdP (ex affix_sezione_rdp).
 * Aggiunta e rimozione sono riservate ad amministratori e gruppo CONCORSI.
 */
@Component({
  standalone: false,
  selector: 'affix_tabCallAccountable',
  template: `
    <div *ngIf="!data?.objectId" class="alert alert-info" translate>call_manage.save_first</div>
    <div *ngIf="data?.objectId">
      <p *ngIf="data.createdBy"><strong translate>call_manage.rdp.gestore</strong>: {{data.createdBy}}</p>
      <h5 class="text-primary">{{'call_manage.rdp.title' | translate}} <small class="text-muted">{{data.rdp}}</small></h5>
      <app-layout-wait [loaded]="members"></app-layout-wait>
      <ul class="list-group mb-3" *ngIf="members">
        <li class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let member of members">
          <span>
            <i class="fa fa-fw" [ngClass]="member.attr?.type === 'GROUP' ? 'fa-users' : 'fa-user'"></i>
            {{member.attr?.displayName}} <small class="text-muted">{{member.attr?.shortName}}</small>
          </span>
          <button *ngIf="canEdit" class="btn btn-link btn-sm text-danger" (click)="remove(member)" translate>delete</button>
        </li>
        <li *ngIf="members.length === 0" class="list-group-item text-muted" translate>no_item</li>
      </ul>
      <div *ngIf="canEdit" class="row align-items-end">
        <div class="form-group col-md-8">
          <app-authority-picker mode="both" [(ngModel)]="authority" [ngModelOptions]="{standalone: true}"></app-authority-picker>
        </div>
        <div class="form-group col-md-4 text-end">
          <button class="btn btn-primary btn-sm" [disabled]="!authority" (click)="add()" translate>add</button>
        </div>
      </div>
    </div>
  `
})
export class JcononAffixCallAccountableComponent extends DynamicComponent<Call> {

  public members: any[];
  public authority: string;
  public canEdit = false;

  constructor(
    protected cacheService: CacheService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected manageCallService: ManageCallService,
    protected authService: AuthService
  ) {
    super(cacheService, changeDetectorRef);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.canEdit = ManageCallService.isConcorsi(this.authService.getUser());
    this.load();
  }

  load() {
    if (!this.data || !this.data.objectId || !this.data.rdp) {
      this.members = this.data && this.data.objectId ? [] : undefined;
      return;
    }
    this.members = undefined;
    this.manageCallService.rdp(this.data.objectId)
      .subscribe(members => this.members = members || [], () => this.members = []);
  }

  add() {
    this.manageCallService.addRdp(this.data.objectId, this.authority.trim()).subscribe(() => {
      this.authority = '';
      this.load();
    });
  }

  remove(member: any) {
    this.manageCallService.removeRdp(this.data.objectId, member.attr.authorityId || member.attr.shortName)
      .subscribe(() => this.load());
  }
}

/**
 * Sezione HelpDesk: categorie create alla pubblicazione del bando ed esperti associati.
 */
@Component({
  standalone: false,
  selector: 'affix_tabCallHelpDesk',
  template: `
    <div *ngIf="categories.length === 0" class="alert alert-info" translate>call_manage.helpdesk.not_published</div>
    <div *ngFor="let category of categories" class="card card-bg mb-3">
      <div class="card-body">
        <h5 class="card-title">{{category.label | translate}} <small class="text-muted">#{{category.id}}</small></h5>
        <app-layout-wait [loaded]="esperti[category.id]"></app-layout-wait>
        <ul class="list-group mb-2" *ngIf="esperti[category.id]">
          <li class="list-group-item d-flex justify-content-between" *ngFor="let esperto of esperti[category.id]">
            <span>{{esperto.nome || esperto.firstName}} {{esperto.cognome || esperto.lastName}} <small class="text-muted">{{esperto.login}}</small></span>
            <button *ngIf="canEdit" class="btn btn-link btn-sm text-danger" (click)="remove(category.id, esperto.login)" translate>delete</button>
          </li>
          <li *ngIf="esperti[category.id].length === 0" class="list-group-item text-muted" translate>no_item</li>
        </ul>
        <div *ngIf="canEdit" class="row align-items-end">
          <div class="form-group col-md-8">
            <app-authority-picker mode="users" label="call_manage.helpdesk.add_hint" [(ngModel)]="newEsperto[category.id]"
              [ngModelOptions]="{standalone: true}"></app-authority-picker>
          </div>
          <div class="form-group col-md-4 text-end">
            <button class="btn btn-primary btn-sm" [disabled]="!newEsperto[category.id]" (click)="add(category.id)" translate>add</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JcononAffixCallHelpDeskComponent extends DynamicComponent<Call> {

  public categories: {id: number, label: string}[] = [];
  public esperti: {[id: number]: any[]} = {};
  public newEsperto: {[id: number]: string} = {};
  public canEdit = false;

  constructor(
    protected cacheService: CacheService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected httpClient: HttpClient,
    protected configService: ConfigService,
    protected authService: AuthService,
    protected apiMessageService: ApiMessageService
  ) {
    super(cacheService, changeDetectorRef);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.canEdit = ManageCallService.isConcorsi(this.authService.getUser());
    const data: any = this.data || {};
    [{ id: data.id_categoria_tecnico_helpdesk, label: 'call_manage.helpdesk.tecnico' },
     { id: data.id_categoria_normativa_helpdesk, label: 'call_manage.helpdesk.normativo' }]
      .filter(category => category.id)
      .forEach(category => {
        this.categories.push(category);
        this.load(category.id);
      });
  }

  load(id: number) {
    this.esperti[id] = undefined;
    this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.get<any[]>(apiBase + '/v1/helpdesk/esperti',
        { params: new HttpParams().set('idCategoria', String(id)) })),
      catchError(() => of([]))
    ).subscribe(esperti => this.esperti[id] = esperti || []);
  }

  add(id: number) {
    this.update(id, this.newEsperto[id].trim(), false);
  }

  remove(id: number, login: string) {
    this.update(id, login, true);
  }

  private update(id: number, login: string, remove: boolean) {
    const params = new HttpParams().set('idCategoria', String(id)).set('idEsperto', login);
    this.configService.getApiBase().pipe(
      switchMap(apiBase => remove ?
        this.httpClient.delete(apiBase + '/v1/helpdesk/esperti', { params }) :
        this.httpClient.put(apiBase + '/v1/helpdesk/esperti', null, { params }))
    ).subscribe(() => {
      this.newEsperto[id] = '';
      this.load(id);
    }, () => this.apiMessageService.sendMessage(MessageType.ERROR, 'admin.error.generic'));
  }
}

/**
 * Sezione Allegati del bando: un elenco per ogni tipo di allegato del bando.
 * Per i macro-bandi ogni allegato si puo' collegare o copiare nei bandi figli.
 */
@Component({
  standalone: false,
  selector: 'affix_tabCallAttachments',
  template: `
    <div *ngIf="!data?.objectId" class="alert alert-info" translate>call_manage.save_first</div>
    <ng-container *ngIf="data?.objectId && types">
      <div class="attachments-toolbar">
        <button type="button" class="btn btn-primary btn-sm" (click)="openChooser()">
          <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-plus-circle"></use></svg>
          {{ 'call_manage.attachments.add' | translate }}
        </button>
        <div class="attachments-search">
          <svg class="icon icon-sm" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-search"></use></svg>
          <input type="search" [placeholder]="'call_manage.attachments.search' | translate" [(ngModel)]="search"
                 [ngModelOptions]="{standalone: true}" [attr.aria-label]="'call_manage.attachments.search' | translate">
        </div>
        <div class="btn-group btn-group-sm" role="group">
          <button type="button" class="btn" [ngClass]="onlyWithDocuments ? 'btn-primary' : 'btn-outline-primary'" (click)="onlyWithDocuments = true">
            {{ 'call_manage.attachments.with_documents' | translate }} ({{ typesWithDocuments() }})
          </button>
          <button type="button" class="btn" [ngClass]="!onlyWithDocuments ? 'btn-primary' : 'btn-outline-primary'" (click)="onlyWithDocuments = false">
            {{ 'call_manage.attachments.all_types' | translate }} ({{ types.length }})
          </button>
        </div>
      </div>
      <p class="small text-secondary mb-3">
        {{ 'call_manage.attachments.summary' | translate:{ documents: totalDocuments(), types: typesWithDocuments() } }}
      </p>
      <div *ngIf="visibleTypes().length === 0" class="alert alert-info">
        {{ (onlyWithDocuments && !search ? 'call_manage.attachments.none' : 'no_item') | translate }}
      </div>
      <app-accordion *ngIf="visibleTypes().length" [isAnimated]="true" [closeOthers]="false" class="shadow">
        <app-accordion-group #accordionGroup *ngFor="let type of visibleTypes(); trackBy: trackType" panelClass="border border-light no-after"
                             [isOpen]="type === lastUploaded">
          <div class="d-flex align-items-start" accordion-heading>
            <h4 class="p-1 text-truncate text-primary">{{ typeLabel(type) }}</h4>
            <span class="badge rounded-pill d-table ms-n1" [ngClass]="count(type) ? 'bg-primary' : 'badge-outline-primary'">{{ count(type) }}</span>
            <div class="me-auto p-1 h4">
              <button class="btn p-0" [itPopover]="'new'| translate" popoverTrigger="hover" (click)="openUpload($event, accordionGroup, type)">
                <svg class="icon icon-success"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-plus-circle"></use></svg>
              </button>
            </div>
          </div>
          <children-list #childrenlist [show_date]="'true'" [parentId]="data.objectId" [typeId]="type"
            [macroCallId]="isMacroCall() ? data.objectId : undefined"></children-list>
        </app-accordion-group>
      </app-accordion>
    </ng-container>

    <!-- scelta della tipologia di allegato da caricare -->
    <ng-template #chooser>
      <div class="modal-header">
        <h2 class="modal-title h5 no_toc">{{ 'call_manage.attachments.choose' | translate }}</h2>
        <button class="btn-close" type="button" [attr.aria-label]="'layout.close' | translate" (click)="chooserRef?.hide()">
          <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
        </button>
      </div>
      <div class="modal-body pt-2 pb-3">
        <div class="attachments-search mb-2 w-100">
          <svg class="icon icon-sm" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-search"></use></svg>
          <input type="search" [placeholder]="'call_manage.attachments.search' | translate" [(ngModel)]="chooserSearch"
                 [ngModelOptions]="{standalone: true}" [attr.aria-label]="'call_manage.attachments.search' | translate">
        </div>
        <ul class="list-unstyled chooser-list mb-0">
          <li *ngFor="let type of chooserTypes()">
            <button type="button" class="chooser-item" (click)="chooseType(type)">
              <span>{{ typeLabel(type) }}</span>
              <span class="badge rounded-pill" [ngClass]="count(type) ? 'bg-primary' : 'bg-light text-secondary'">{{ count(type) }}</span>
            </button>
          </li>
          <li *ngIf="chooserTypes().length === 0" class="small text-secondary px-2 py-2">{{ 'layout.no_results' | translate }}</li>
        </ul>
      </div>
    </ng-template>
  `,
  styles: [`
    .attachments-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin-bottom: .75rem; }
    .attachments-search { display: flex; align-items: center; gap: .4rem; flex: 1; min-width: 14rem; padding: .3rem .6rem;
      border: 1px solid #d9dadb; border-radius: 4px; background: #fff; }
    .attachments-search .icon { fill: #5d7083; flex-shrink: 0; }
    .attachments-search input { border: 0; outline: 0; width: 100%; font-size: .95rem; background: transparent; }
    .chooser-list { max-height: 60vh; overflow-y: auto; }
    .chooser-item { display: flex; justify-content: space-between; align-items: center; gap: 1rem; width: 100%;
      padding: .55rem .75rem; border: 0; border-bottom: 1px solid #eef1f4; background: #fff; text-align: left; color: #17324d; }
    .chooser-item:hover, .chooser-item:focus { background: #f0f6fc; color: #0066cc; }
  `]
})
export class JcononAffixCallAttachmentsComponent extends DynamicComponent<Call> {

  public types: string[];
  public search = '';
  public chooserSearch = '';
  /** Solo le tipologie con documenti (default se ce ne sono), altrimenti tutte. */
  public onlyWithDocuments = true;
  /** Tipologia dell'ultimo caricamento: resta visibile e aperta. */
  public lastUploaded: string;
  public chooserRef: ModalRef;
  private counts: { [type: string]: number } = {};
  private bsModalRef: ModalRef;
  @ViewChild('chooser', { static: true }) chooserTemplate: TemplateRef<any>;
  @ViewChildren('childrenlist') childrenListComponent: ChildrenListComponent[];

  constructor(
    protected cacheService: CacheService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected manageCallService: ManageCallService,
    protected modalService: ModalService,
    protected translateService: TranslateService,
    protected apiMessageService: ApiMessageService,
    protected childrenService: ChildrenService
  ) {
    super(cacheService, changeDetectorRef);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.manageCallService.callManagementCache()
      .subscribe(cache => this.types = (cache.jsonlistCallAttachments || []).map(item => item.key));
    this.loadCounts(true);
  }

  /** Conteggio dei documenti per tipologia, con una sola ricerca degli allegati del bando. */
  loadCounts(initial = false): void {
    if (!this.data || !this.data.objectId) {
      return;
    }
    const filters = { parentId: this.data.objectId, fetchObject: false };
    let pages = 0;
    this.childrenService.getPageable(0, filters).pipe(
      expand((page: any) => page.hasMoreItems && ++pages < 40 ? this.childrenService.getPageable(pages, filters) : EMPTY),
      reduce((all: any[], page: any) => all.concat(page.items || []), [])
    ).subscribe(items => {
      const counts = {};
      items.forEach((item: any) => counts[item.objectTypeId] = (counts[item.objectTypeId] || 0) + 1);
      this.counts = counts;
      if (initial && this.typesWithDocuments() === 0) {
        this.onlyWithDocuments = false;
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  count(type: string): number {
    return this.counts[type] || 0;
  }

  typesWithDocuments(): number {
    return (this.types || []).filter(type => this.count(type) > 0).length;
  }

  totalDocuments(): number {
    return Object.keys(this.counts).reduce((total, type) => total + this.counts[type], 0);
  }

  typeLabel(type: string): string {
    const translated = this.translateService.instant(type);
    return translated && translated !== type ? translated : type;
  }

  private matches(type: string, term: string): boolean {
    const text = (term || '').trim().toLowerCase();
    return !text || this.typeLabel(type).toLowerCase().includes(text) || type.toLowerCase().includes(text);
  }

  visibleTypes(): string[] {
    return (this.types || []).filter(type =>
      this.matches(type, this.search) &&
      (!this.onlyWithDocuments || this.search || this.count(type) > 0 || type === this.lastUploaded));
  }

  /** Nella scelta: prima le tipologie con documenti, poi le altre in ordine alfabetico. */
  chooserTypes(): string[] {
    return (this.types || [])
      .filter(type => this.matches(type, this.chooserSearch))
      .sort((a, b) => (this.count(b) > 0 ? 1 : 0) - (this.count(a) > 0 ? 1 : 0) || this.typeLabel(a).localeCompare(this.typeLabel(b)));
  }

  trackType(index: number, type: string): string {
    return type;
  }

  isMacroCall(): boolean {
    return ManageCallService.isMacroCall(this.data);
  }

  openChooser(): void {
    this.chooserSearch = '';
    this.chooserRef = this.modalService.show(this.chooserTemplate, { class: 'modal-lg' });
  }

  chooseType(type: string): void {
    if (this.chooserRef) {
      this.chooserRef.hide();
    }
    this.upload(type);
  }

  openUpload(event: any, accordion: any, typeId: string): boolean {
    event.stopPropagation();
    event.preventDefault();
    if (!accordion.isOpen) {
      accordion.toggleOpen();
    }
    this.upload(typeId);
    return false;
  }

  private upload(typeId: string): void {
    const initialState = { parentId: this.data.objectId, typeId, upload: true };
    this.bsModalRef = this.modalService.show(ManageDocumentComponent, Object.assign({initialState}, { animated: true, class: 'modal-lg' }));
    this.bsModalRef.content.event.subscribe((document: Document) => {
      this.translateService.get('message.document.upload.success', {value: document.name}).subscribe((label) => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, label);
      });
      this.lastUploaded = typeId;
      this.loadCounts();
      setTimeout(() => this.childrenListComponent.forEach(comp => comp.loadList()));
    });
  }
}
