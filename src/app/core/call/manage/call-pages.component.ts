import { Component, Directive, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { ConfigService } from '../../config.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ModalService } from '../../../shared/modal/modal.service';
import { Call } from '../call.model';
import { CallService } from '../call.service';
import { AclRole, CommissionResult, ManageCallService } from '../manage-call.service';
import { AuthService } from '../../../auth/auth.service';
import { ApiMessageService, MessageType } from '../../api-message.service';
import { ModalConfirmComponent } from '../../../shared/tags/wizard/modal-confirm.component';

/**
 * Base comune: legge callId dai parametri e carica il bando.
 */
@Directive()
export abstract class CallPageBase implements OnInit {
  public call: Call;
  public callId: string;

  constructor(protected route: ActivatedRoute, protected callService: CallService, protected modalService: ModalService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.callId = params['callId'];
      if (this.callId) {
        this.callService.getById(this.callId).subscribe(call => {
          this.call = call;
          this.onCallLoaded();
        });
      }
    });
  }

  protected abstract onCallLoaded(): void;

  protected confirm(body: string, action: () => void) {
    const modalRef = this.modalService.show(ModalConfirmComponent,
      Object.assign({ initialState: { body } }, { animated: true, class: 'modal-dialog-centered' }));
    modalRef.content.confirm.subscribe(() => action());
  }
}


/**
 * Bandi figli di un macro-bando (ex azione "dettaglio" del menu bandi).
 */
@Component({
  standalone: false,
  selector: 'call-children',
  template: `<app-call-header [call]="call" page="call_manage.children.title"></app-call-header>
    <h2 class="text-primary">{{'call_manage.children.title' | translate}}</h2>
    <app-layout-wait [loaded]="children"></app-layout-wait>
    <div *ngIf="children && children.length === 0" class="alert alert-light" translate>no_item</div>
    <div class="table-responsive" *ngIf="children && children.length">
      <table class="table table-hover">
        <thead>
          <tr>
            <th translate>label.jconon_call.codice</th>
            <th translate>label.jconon_call.sede</th>
            <th translate>label.jconon_call.numero_posti</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let child of children">
            <td class="fw-semibold">{{child.codice}}</td>
            <td>{{child.sede}}</td>
            <td>{{child.numero_posti}}</td>
            <td>
              <span class="badge" [ngClass]="child.pubblicato ? 'bg-success' : 'bg-secondary'">
                {{(child.pubblicato ? 'call_manage.published' : 'call_manage.not_published') | translate}}
              </span>
            </td>
            <td class="text-end text-nowrap">
              <a class="btn btn-link btn-sm" [routerLink]="['/manage-call']"
                [queryParams]="{'cmis:objectId': child.objectId, 'call-type': child.objectTypeId}" translate>edit</a>
              <a class="btn btn-link btn-sm" [routerLink]="['/applications-user']"
                [queryParams]="{callId: child.objectId}" translate>call.menuitem.application</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class CallChildrenComponent extends CallPageBase {
  public children: Call[];

  constructor(route: ActivatedRoute, callService: CallService, modalService: ModalService,
              private manageCallService: ManageCallService) {
    super(route, callService, modalService);
  }

  protected onCallLoaded(): void {
    this.manageCallService.children(this.callId).subscribe(children => this.children = children, () => this.children = []);
  }
}

/**
 * Etichette personalizzate del bando (ex pagina manage-call-labels, call-labels.js): si sceglie la tipologia
 * (sezione della domanda, dichiarazione, allegato...) e se ne cambia il nome ("Modifica etichetta") oppure il nome di
 * uno dei suoi campi ("Dettagli", campi del bulkinfo della tipologia).
 */
@Component({
  standalone: false,
  selector: 'call-labels',
  template: `<app-call-header [call]="call" page="call_manage.labels.title"></app-call-header>
    <h2 class="text-primary">{{'call_manage.labels.title' | translate}}</h2>
    <p class="small text-muted" translate>call_manage.labels.info</p>

    <div class="card card-bg mb-3">
      <div class="card-body">
        <div class="row align-items-end g-3">
          <div class="col-lg-7">
            <div class="select-wrapper">
              <label for="lbl-type">{{ 'call_manage.labels.type' | translate }}</label>
              <select id="lbl-type" [(ngModel)]="selectedType" (ngModelChange)="onType()">
                <option [ngValue]="null">{{ 'call_manage.labels.choose_type' | translate }}</option>
                <option *ngFor="let type of types" [ngValue]="type">{{ type.label }}</option>
              </select>
            </div>
          </div>
          <div class="col-lg-5 d-flex flex-wrap gap-2 justify-content-lg-end">
            <button type="button" class="btn btn-primary btn-sm" [disabled]="!selectedType" (click)="editType()">
              <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-pencil"></use></svg>{{ 'call_manage.labels.edit_type' | translate }}
            </button>
            <button type="button" class="btn btn-outline-primary btn-sm" [disabled]="!selectedType || loadingFields" (click)="showFields()">
              <svg class="icon icon-primary icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-list"></use></svg>{{ 'call_manage.labels.details' | translate }}
            </button>
          </div>
        </div>

        <!-- modifica dell'etichetta della tipologia o di un suo campo -->
        <form *ngIf="editing" [formGroup]="form" (ngSubmit)="onSave()" class="mt-4 pt-3 border-top">
          <h3 class="h6 mb-3">{{ (editing === 'type' ? 'call_manage.labels.edit_type' : 'call_manage.labels.edit_field') | translate }}:
            {{ selectedType?.label }}</h3>
          <div class="row g-3">
            <div class="col-lg-5" *ngIf="editing === 'field'">
              <div class="select-wrapper">
                <label for="lbl-field">{{ 'call_manage.labels.field' | translate }}</label>
                <select id="lbl-field" formControlName="key" (change)="onField()">
                  <option value="">{{ 'call_manage.labels.choose_field' | translate }}</option>
                  <option *ngFor="let field of fields" [value]="field.key">{{ field.label }}</option>
                </select>
              </div>
            </div>
            <div [ngClass]="editing === 'field' ? 'col-lg-7' : 'col-12'">
              <label for="lbl-new" class="small fw-semibold d-block mb-1">{{ 'call_manage.labels.new_label' | translate }}</label>
              <textarea id="lbl-new" class="form-control" rows="3" formControlName="newLabel"></textarea>
              <small class="text-muted" *ngIf="form.value.oldLabel">{{ 'call_manage.labels.current' | translate }}: {{ form.value.oldLabel }}</small>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="cancel()">{{ 'button.cancel' | translate }}</button>
            <button type="submit" class="btn btn-primary btn-sm" [disabled]="form.invalid">{{ 'save' | translate }}</button>
          </div>
        </form>
        <div *ngIf="noFields" class="alert alert-info mt-3 mb-0">{{ 'call_manage.labels.no_details' | translate }}</div>
      </div>
    </div>

    <app-layout-wait [loaded]="labels"></app-layout-wait>
    <div *ngIf="labels && labels.length === 0" class="alert alert-light" translate>no_item</div>
    <div class="table-responsive" *ngIf="labels && labels.length">
      <table class="table table-sm table-hover align-middle">
        <thead>
          <tr>
            <th translate>call_manage.labels.old_label</th>
            <th translate>call_manage.labels.new_label</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let label of labels">
            <td>{{label.oldLabel || label.key}}<div class="font-monospace small text-muted">{{label.key}}</div></td>
            <td class="fw-semibold pre-line">{{label.newLabel}}</td>
            <td class="text-end text-nowrap">
              <button class="btn btn-link btn-sm" (click)="onEdit(label)" translate>edit</button>
              <button class="btn btn-link btn-sm text-danger" (click)="onDelete(label)" translate>delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`.pre-line { white-space: pre-line; }`]
})
export class CallLabelsComponent extends CallPageBase {
  public labels: {key: string, oldLabel: string, newLabel: string}[];
  /** Tipologie: sezioni della domanda e dichiarazioni, allegati, curriculum, prodotti e schede del bando. */
  public types: {key: string, label: string}[] = [];
  public selectedType: {key: string, label: string} = null;
  public fields: {key: string, label: string}[] = [];
  public editing: 'type' | 'field' = null;
  public loadingFields = false;
  public noFields = false;
  public form: FormGroup;

  /** Sezioni della domanda, come nel legacy. */
  private static SECTIONS = [
    ['F:jconon_application:folder', 'Domanda'], ['affix_tabAnagrafica', 'Dati Anagrafici'], ['affix_tabResidenza', 'Dati Residenza'],
    ['affix_tabDichiarazioni', 'Dichiarazioni'], ['affix_tabTitoli', 'Allegati Vari'], ['affix_tabReperibilita', 'Reperibilità'],
    ['affix_tabDichiarazioniConclusive', 'Dichiarazioni Sostitutive'], ['affix_tabCurriculum', 'A) Curriculum'],
    ['affix_tabCurriculum_ulteriore', 'A1) Curriculum'], ['affix_tabElencoProdotti', 'B) Elenco prodotti'],
    ['affix_tabProdottiScelti', 'C) Prodotti scelti'], ['affix_tabSchedaAnonima', 'Scheda Anonima Sintetica'],
    ['affix_tabDatiCNR', 'Dati CNR'], ['affix_tabUlterioriDati', 'Dati Preselezione'], ['affix_tabSezione4', 'Dati Sezione 4'],
    ['affix_tabSezione5', 'Dati Sezione 5']
  ];

  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  constructor(route: ActivatedRoute, callService: CallService, modalService: ModalService,
              private manageCallService: ManageCallService, private formBuilder: FormBuilder,
              private translateService: TranslateService, private apiMessageService: ApiMessageService) {
    super(route, callService, modalService);
    this.form = this.formBuilder.group({ key: ['', Validators.required], oldLabel: [''], newLabel: ['', Validators.required] });
  }

  protected onCallLoaded(): void {
    const call: any = this.call;
    this.manageCallService.callManagementCache().subscribe((cache: any) => {
      const label = (list: any[], key: string) => {
        const item = (list || []).find(i => i.key === key);
        const translated = this.translateService.instant(key);
        return (item && (item.defaultLabel || item.label)) || (translated !== key ? translated : key);
      };
      const from = (fields: string[], list: any[]) => fields
        .reduce((keys, field) => keys.concat(call[field] || []), [] as string[])
        .map((key: string) => ({ key, label: label(list, key) }));
      const types = CallLabelsComponent.SECTIONS.map(([key, text]) => ({ key, label: text }))
        .concat(from(['elenco_aspects', 'elenco_aspects_sezione_cnr', 'elenco_aspects_ulteriori_dati', 'elenco_aspects_sezione_4',
          'elenco_aspects_sezione_5'], cache?.jsonlistApplicationAspects))
        .concat(from(['elenco_association', 'winner_elenco_file'], cache?.jsonlistApplicationAttachments))
        .concat(from(['elenco_schede_anonime'], cache?.jsonlistApplicationSchedeAnonime))
        .concat(from(['elenco_sezioni_curriculum', 'elenco_sezioni_curriculum_ulteriore'], cache?.jsonlistApplicationCurriculums))
        .concat(from(['elenco_prodotti'], cache?.jsonlistApplicationProdotti));
      const seen = new Set<string>();
      this.types = types.filter(type => !seen.has(type.key) && !!seen.add(type.key));
    });
    this.load();
  }

  load() {
    this.labels = undefined;
    this.manageCallService.labels(this.callId).subscribe(json => {
      this.labels = Object.keys(json || {}).map(key => ({
        key, oldLabel: json[key].oldLabel, newLabel: json[key].newLabel
      }));
    }, () => this.labels = []);
  }

  onType() {
    this.cancel();
  }

  /** Nome della tipologia scelta. */
  editType() {
    this.noFields = false;
    const existing = (this.labels || []).find(l => l.key === this.selectedType.key);
    this.form.reset({ key: this.selectedType.key, oldLabel: this.selectedType.label, newLabel: existing ? existing.newLabel : this.selectedType.label });
    this.editing = 'type';
  }

  /**
   * Campi della tipologia dal bulkinfo, come il pulsante "Dettagli" del legacy: per una dichiarazione (P:...) il suo
   * form, per la domanda i form delle sezioni anagrafiche, per gli allegati il form "default".
   */
  showFields() {
    const key = this.selectedType.key;
    const formName = key.startsWith('P:') ? key : (key === 'F:jconon_application:folder'
      ? 'affix_tabAnagrafica,affix_tabResidenza,affix_tabReperibilita,affix_tabDichiarazioniConclusive' : 'default');
    this.loadingFields = true;
    this.noFields = false;
    this.configService.getGateway().pipe(
      switchMap(gateway => this.http.get<any>(gateway + '/rest/bulkInfo/view/' + encodeURIComponent(key) + '/form/' +
        encodeURIComponent(formName), { params: { guest: 'true' } }))
    ).subscribe(view => {
      this.loadingFields = false;
      const fields: {key: string, label: string}[] = [];
      (view && view.forms || []).forEach((name: string) => Object.values(view[name] || {}).forEach((el: any) => {
        const labelKey = el && (el.label || (el.jsonlabel && el.jsonlabel.key));
        if (labelKey && !fields.some(f => f.key === labelKey)) {
          const translated = this.translateService.instant(labelKey);
          fields.push({ key: labelKey, label: translated !== labelKey ? translated : ((el.jsonlabel && el.jsonlabel.default) || labelKey) });
        }
      }));
      if (!fields.length) {
        this.noFields = true;
        this.editing = null;
        return;
      }
      this.fields = fields;
      this.form.reset({ key: '', oldLabel: '', newLabel: '' });
      this.editing = 'field';
    }, () => {
      this.loadingFields = false;
      this.noFields = true;
    });
  }

  onField() {
    const field = this.fields.find(f => f.key === this.form.value.key);
    const existing = (this.labels || []).find(l => l.key === this.form.value.key);
    this.form.patchValue({ oldLabel: field ? field.label : '', newLabel: existing ? existing.newLabel : (field ? field.label : '') });
  }

  onEdit(label: {key: string, oldLabel: string, newLabel: string}) {
    this.noFields = false;
    this.form.reset({ key: label.key, oldLabel: label.oldLabel, newLabel: label.newLabel || '' });
    this.editing = 'type';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancel() {
    this.editing = null;
    this.noFields = false;
    this.form.reset({ key: '', oldLabel: '', newLabel: '' });
  }

  onSave() {
    const value = this.form.value;
    this.manageCallService.saveLabel(this.callId, {
      key: String(value.key).trim(),
      oldLabel: value.oldLabel || this.translateService.instant(value.key),
      newLabel: value.newLabel
    }).subscribe(() => {
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'call_manage.saved');
      this.cancel();
      this.load();
    });
  }

  onDelete(label: {key: string}) {
    this.confirm('call_manage.labels.confirm_delete', () =>
      this.manageCallService.saveLabel(this.callId, { key: label.key, delete: true }).subscribe(() => this.load()));
  }
}

/**
 * Permessi sulla cartella del bando (ex pannello ACL del menu bandi), riservati ad amministratori e CONCORSI.
 */
@Component({
  standalone: false,
  selector: 'call-permissions',
  template: `<app-call-header [call]="call" page="call_manage.permissions.title"></app-call-header>
    <h2 class="text-primary">{{'call_manage.permissions.title' | translate}}</h2>
    <app-layout-wait [loaded]="acl"></app-layout-wait>
    <div *ngIf="acl">
      <div class="form-check mb-3">
        <input id="acl-inherited" type="checkbox" [checked]="acl.isInherited" (change)="onToggleInherited($event.target.checked)">
        <label for="acl-inherited" translate>call_manage.permissions.inherited</label>
      </div>
      <form [formGroup]="form" (ngSubmit)="onAdd()" class="card card-bg mb-3">
        <div class="card-body row align-items-end">
          <div class="form-group col-md-6">
            <app-authority-picker mode="both" formControlName="authority"></app-authority-picker>
          </div>
          <div class="form-group col-md-4">
            <label for="acl-role" class="active" translate>call_manage.permissions.role</label>
            <select id="acl-role" class="form-select" formControlName="role">
              <option *ngFor="let role of roles" [value]="role">{{role}}</option>
            </select>
          </div>
          <div class="form-group col-md-2 text-end">
            <button type="submit" class="btn btn-primary btn-sm" [disabled]="form.invalid" translate>add</button>
          </div>
        </div>
      </form>
      <h5 translate>call_manage.permissions.direct</h5>
      <table class="table table-sm">
        <tbody>
          <tr *ngFor="let perm of acl.direct">
            <td>{{perm.authority.displayName}} <small class="text-muted">{{perm.authority.name}}</small></td>
            <td>{{perm.role}}</td>
            <td class="text-end"><button class="btn btn-link btn-sm text-danger" (click)="onRemove(perm)" translate>delete</button></td>
          </tr>
          <tr *ngIf="!acl.direct?.length"><td class="text-muted" translate>no_item</td></tr>
        </tbody>
      </table>
      <ng-container *ngIf="acl.isInherited && acl.inherited?.length">
        <h5 translate>call_manage.permissions.inherited_list</h5>
        <table class="table table-sm text-muted">
          <tbody>
            <tr *ngFor="let perm of acl.inherited">
              <td>{{perm.authority.displayName}} <small>{{perm.authority.name}}</small></td>
              <td>{{perm.role}}</td>
            </tr>
          </tbody>
        </table>
      </ng-container>
    </div>
  `
})
export class CallPermissionsComponent extends CallPageBase {
  public acl: any;
  public roles: AclRole[] = ['Consumer', 'Contributor', 'Editor', 'Collaborator', 'Coordinator'];
  public form: FormGroup;

  constructor(route: ActivatedRoute, callService: CallService, modalService: ModalService,
              private manageCallService: ManageCallService, private formBuilder: FormBuilder) {
    super(route, callService, modalService);
    this.form = this.formBuilder.group({ authority: ['', Validators.required], role: ['Consumer', Validators.required] });
  }

  protected onCallLoaded(): void {
    this.load();
  }

  load() {
    this.acl = undefined;
    this.manageCallService.acl(this.callId).subscribe(acl => this.acl = acl, () => this.acl = null);
  }

  onAdd() {
    this.manageCallService.addAcl(this.callId, String(this.form.value.authority || '').trim(), this.form.value.role).subscribe(() => {
      this.form.patchValue({ authority: '' });
      this.load();
    });
  }

  onRemove(perm: any) {
    this.confirm('call_manage.permissions.confirm_delete', () =>
      this.manageCallService.removeAcl(this.callId, perm.authority.name, perm.role).subscribe(() => this.load()));
  }

  onToggleInherited(value: boolean) {
    this.manageCallService.setInheritedAcl(this.callId, value).subscribe(() => this.load());
  }
}

/**
 * Commissione del bando (ex modale "Modifica Commissione"): componenti, abilitazione al gruppo
 * della commissione e riepilogo per la parita' di genere.
 */
@Component({
  standalone: false,
  selector: 'call-commission',
  template: `<app-call-header [call]="call" page="call_manage.commission.title"></app-call-header>
    <h2 class="text-primary">{{'call_manage.commission.title' | translate}}</h2>
    <app-layout-wait [loaded]="result"></app-layout-wait>
    <ng-container *ngIf="result">
      <div class="alert" [ngClass]="isBalanced() ? 'alert-success' : 'alert-warning'">
        {{'call_manage.commission.gender_summary' | translate:{m: count('M'), f: count('F')} }}
        <span *ngIf="!isBalanced()"> {{'call_manage.commission.gender_unbalanced' | translate}}</span>
      </div>
      <div class="d-flex mb-3">
        <button class="btn btn-primary btn-sm" (click)="onNew()" translate>call_manage.commission.add</button>
      </div>
      <form *ngIf="editing" [formGroup]="form" (ngSubmit)="onSave()" class="card card-bg mb-3">
        <div class="card-body row">
          <div class="form-group col-md-2">
            <label for="c-app" class="active" translate>call_manage.commission.appellativo</label>
            <input id="c-app" type="text" class="form-control" formControlName="jconon_commissione:appellativo">
          </div>
          <div class="form-group col-md-4">
            <label for="c-nome" class="active" translate>call_manage.commission.nome</label>
            <input id="c-nome" type="text" class="form-control" formControlName="jconon_commissione:nome">
          </div>
          <div class="form-group col-md-4">
            <label for="c-cognome" class="active" translate>call_manage.commission.cognome</label>
            <input id="c-cognome" type="text" class="form-control" formControlName="jconon_commissione:cognome">
          </div>
          <div class="form-group col-md-2">
            <label for="c-sesso" class="active" translate>call_manage.commission.sesso</label>
            <select id="c-sesso" class="form-select" formControlName="jconon_commissione:sesso">
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
          <div class="form-group col-md-4">
            <label for="c-ruolo" class="active" translate>call_manage.commission.ruolo</label>
            <select id="c-ruolo" class="form-select" formControlName="jconon_commissione:ruolo">
              <option *ngFor="let ruolo of ruoli" [value]="ruolo">{{'call_manage.commission.ruoli.' + ruolo | translate}}</option>
            </select>
          </div>
          <div class="form-group col-md-4">
            <label for="c-qualifica" class="active" translate>call_manage.commission.qualifica</label>
            <input id="c-qualifica" type="text" class="form-control" formControlName="jconon_commissione:qualifica">
          </div>
          <div class="form-group col-md-4">
            <label for="c-email" class="active" translate>call_manage.commission.email</label>
            <input id="c-email" type="email" class="form-control" formControlName="jconon_commissione:email">
          </div>
          <div class="form-group col-md-6">
            <app-authority-picker mode="users" label="call_manage.commission.username" formControlName="jconon_commissione:username"
              (selected)="fillMember($event)"></app-authority-picker>
            <small class="text-muted" translate>call_manage.commission.username_hint</small>
          </div>
          <div class="col-md-6 text-end align-self-end">
            <button type="button" class="btn btn-outline-secondary btn-sm me-2" (click)="editing = null" translate>button.cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" [disabled]="form.invalid" translate>save</button>
          </div>
        </div>
      </form>
      <div *ngIf="result.items.length === 0" class="alert alert-light" translate>call_manage.commission.empty</div>
      <div class="table-responsive" *ngIf="result.items.length">
        <table class="table table-hover">
          <thead>
            <tr>
              <th translate>call_manage.commission.ruolo</th>
              <th translate>call_manage.commission.nominativo</th>
              <th translate>call_manage.commission.sesso</th>
              <th translate>call_manage.commission.username</th>
              <th translate>call_manage.commission.stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let member of result.items">
              <td>{{'call_manage.commission.ruoli.' + member['jconon_commissione:ruolo'] | translate}}</td>
              <td>
                {{member['jconon_commissione:appellativo']}} {{member['jconon_commissione:cognome']}} {{member['jconon_commissione:nome']}}
                <div class="small text-muted">{{member['jconon_commissione:qualifica']}} {{member['jconon_commissione:email']}}</div>
              </td>
              <td>{{member['jconon_commissione:sesso']}}</td>
              <td class="font-monospace small">{{member['jconon_commissione:username']}}</td>
              <td>
                <span *ngIf="member.abilitato" class="badge bg-success" translate>call_manage.commission.enabled</span>
                <span *ngIf="!member.abilitato && member.abilitabile" class="badge bg-secondary" translate>call_manage.commission.disabled</span>
              </td>
              <td class="text-end text-nowrap">
                <button *ngIf="member.abilitabile && !member.abilitato" class="btn btn-link btn-sm" (click)="onEnable(member, true)" translate>call_manage.commission.enable</button>
                <button *ngIf="member.abilitato" class="btn btn-link btn-sm" (click)="onEnable(member, false)" translate>call_manage.commission.disable</button>
                <button class="btn btn-link btn-sm" (click)="onEdit(member)" translate>edit</button>
                <button *ngIf="!member.abilitato" class="btn btn-link btn-sm text-danger" (click)="onDelete(member)" translate>delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>
  `
})
export class CallCommissionComponent extends CallPageBase {
  public result: CommissionResult;
  public ruoli = ['A_PRE', 'B_COM', 'C_SEG', 'D_SUP', 'E_DIM'];
  public form: FormGroup;
  public editing: any;

  constructor(route: ActivatedRoute, callService: CallService, modalService: ModalService,
              private manageCallService: ManageCallService, private formBuilder: FormBuilder,
              private translateService: TranslateService, private apiMessageService: ApiMessageService) {
    super(route, callService, modalService);
    this.form = this.formBuilder.group({
      'jconon_commissione:appellativo': [''],
      'jconon_commissione:nome': ['', Validators.required],
      'jconon_commissione:cognome': ['', Validators.required],
      'jconon_commissione:sesso': ['', Validators.required],
      'jconon_commissione:ruolo': ['', Validators.required],
      'jconon_commissione:qualifica': [''],
      'jconon_commissione:email': ['', Validators.email],
      'jconon_commissione:username': ['']
    });
  }

  protected onCallLoaded(): void {
    this.load();
  }

  load() {
    this.manageCallService.commission(this.callId)
      .subscribe(result => this.result = result, () => this.result = { items: [], group: null, videoGender: false });
  }

  count(sesso: string): number {
    return (this.result.items || []).filter(item => item['jconon_commissione:sesso'] === sesso &&
      ['A_PRE', 'B_COM'].indexOf(item['jconon_commissione:ruolo']) !== -1).length;
  }

  /**
   * Presidente e componenti: almeno un terzo per ciascun genere.
   */
  isBalanced(): boolean {
    const m = this.count('M'), f = this.count('F'), total = m + f;
    return total === 0 || (m * 3 >= total && f * 3 >= total);
  }

  onNew() {
    this.form.reset({ 'jconon_commissione:sesso': '', 'jconon_commissione:ruolo': '' });
    this.editing = {};
  }

  onEdit(member: any) {
    const value = {};
    Object.keys(this.form.controls).forEach(key => value[key] = member[key] || '');
    this.form.reset(value);
    this.editing = member;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSave() {
    const body = {};
    Object.keys(this.form.value).forEach(key => body[key] = ManageCallService.toRequestValue(this.form.value[key]));
    const request = this.editing && this.editing['cmis:objectId'] ?
      this.manageCallService.updateCommissionMember(this.callId, this.editing['cmis:objectId'], body) :
      this.manageCallService.addCommissionMember(this.callId, body);
    request.subscribe(() => {
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'call_manage.saved');
      this.editing = null;
      this.load();
    });
  }

  onDelete(member: any) {
    this.confirm('call_manage.commission.confirm_delete', () =>
      this.manageCallService.deleteCommissionMember(this.callId, member['cmis:objectId']).subscribe(() => this.load()));
  }

  onEnable(member: any, enabled: boolean, force = false) {
    this.manageCallService.enableCommissionMember(this.callId, member['cmis:objectId'], enabled, force).subscribe(result => {
      if (result.videoGenderMissing) {
        this.confirm('call_manage.commission.video_missing', () => this.onEnable(member, enabled, true));
        return;
      }
      this.load();
    });
  }

  /** Utente scelto dall'autocompletamento: compila nome, cognome ed email se ancora vuoti. */
  fillMember(user: any): void {
    if (!user || !this.form) {
      return;
    }
    const patch: any = {};
    const set = (control: string, value: string) => {
      if (value && !this.form.get(control)?.value) {
        patch[control] = value;
      }
    };
    set('jconon_commissione:nome', user.firstName);
    set('jconon_commissione:cognome', user.lastName);
    set('jconon_commissione:email', user.email);
    this.form.patchValue(patch);
  }
}

declare var PeerTubePlayer: any;

/**
 * Video sulla parita' di genere per i componenti delle commissioni (ex pagina commission-gender).
 * Al termine della riproduzione viene registrato sul profilo dell'utente che il video e' stato visto.
 */
@Component({
  standalone: false,
  selector: 'commission-gender',
  template: `
    <div class="container-fluid pt-2">
      <h2 class="text-primary" translate>call_manage.gender.title</h2>
      <p translate>call_manage.gender.text1</p>
      <p translate>call_manage.gender.text2</p>
      <app-layout-wait [loaded]="config"></app-layout-wait>
      <div *ngIf="config && !config.enabled" class="alert alert-info" translate>call_manage.gender.disabled</div>
      <div *ngIf="config?.watched" class="alert alert-success" translate>call_manage.gender.done</div>
      <div *ngIf="config?.enabled && videoUrl">
        <iframe id="gender-video" [src]="videoUrl" title="video" style="height:60vh;width:100%" allowfullscreen
          sandbox="allow-same-origin allow-scripts allow-popups"></iframe>
        <div *ngIf="playerError" class="alert alert-warning mt-2" translate>call_manage.gender.player_error</div>
      </div>
      <p class="mt-3" [innerHtml]="'call_manage.gender.more' | translate"></p>
    </div>
  `
})
export class CommissionGenderComponent implements OnInit, OnDestroy {
  public static PLAYER_SCRIPT = 'https://unpkg.com/@peertube/embed-api/build/player.min.js';
  public config: {enabled: boolean, url_it: string, url_en: string, watched: boolean};
  public videoUrl: SafeResourceUrl;
  public playerError = false;
  private player: any;

  constructor(private manageCallService: ManageCallService, private sanitizer: DomSanitizer,
              private translateService: TranslateService, private apiMessageService: ApiMessageService) {}

  ngOnInit(): void {
    this.manageCallService.commissionGender().subscribe(config => {
      this.config = config;
      const url = this.translateService.currentLang === 'en' ? config.url_en : config.url_it;
      if (config.enabled && url) {
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + (url.indexOf('?') === -1 ? '?' : '&') + 'api=1');
        this.loadPlayer();
      }
    });
  }

  private loadPlayer() {
    const start = () => setTimeout(() => this.initPlayer(), 1000);
    if (typeof PeerTubePlayer !== 'undefined') {
      start();
      return;
    }
    const script = document.createElement('script');
    script.src = CommissionGenderComponent.PLAYER_SCRIPT;
    script.onload = start;
    script.onerror = () => this.playerError = true;
    document.head.appendChild(script);
  }

  private async initPlayer() {
    try {
      const frame = document.getElementById('gender-video') as HTMLIFrameElement;
      this.player = new PeerTubePlayer(frame);
      await this.player.ready;
      this.player.addEventListener('playbackStatusUpdate', (event: any) => {
        if (event.playbackState === 'ended' && !this.config.watched) {
          this.config.watched = true;
          this.manageCallService.commissionGenderWatched().subscribe(() =>
            this.apiMessageService.sendMessage(MessageType.SUCCESS, 'call_manage.gender.done'));
        }
      });
    } catch (e) {
      this.playerError = true;
    }
  }

  ngOnDestroy(): void {
    this.player = undefined;
  }
}
