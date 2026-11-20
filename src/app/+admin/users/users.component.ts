import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalService } from '../../shared/modal/modal.service';
import { AdminService } from '../admin.service';
import { AuthService } from '../../auth/auth.service';
import { ApiMessageService, MessageType } from '../../core/api-message.service';
import { ModalConfirmComponent } from '../../shared/tags/wizard/modal-confirm.component';

/**
 * Ricerca e gestione degli utenti (ex pagina legacy gestione-utenti).
 * Modifica, eliminazione e abilitazione sono riservate agli amministratori.
 */
@Component({
  standalone: false,
  selector: 'app-admin-users',
  template: `
    <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="card card-bg mb-3">
      <div class="card-body">
        <div class="row">
          <div class="form-group col-md-4" *ngFor="let field of searchFields">
            <label [for]="'u-' + field" class="active">{{'admin.users.' + field | translate}}</label>
            <input [id]="'u-' + field" type="text" class="form-control" [formControlName]="field">
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <div class="form-check">
            <input id="u-smart" type="checkbox" formControlName="smart">
            <label for="u-smart" translate>admin.users.smart</label>
          </div>
          <button type="submit" class="btn btn-primary btn-sm" [disabled]="searching" translate>search</button>
        </div>
      </div>
    </form>

    <app-layout-wait *ngIf="searching" [loaded]="false"></app-layout-wait>
    <div *ngIf="people && people.length === 0" class="alert alert-light" translate>no_item</div>

    <div *ngIf="editing" class="card card-bg mb-3">
      <div class="card-body">
        <h5 class="card-title">{{'admin.users.edit' | translate}}: {{editing.userName}}</h5>
        <form [formGroup]="editForm" (ngSubmit)="onSaveUser()">
          <!-- stessi campi del profilo utente e della modifica legacy (accountBulkInfo, form editUser) -->
          <div *ngIf="editingReadonly" class="alert alert-warning" role="alert" [innerHTML]="editingReadonly"></div>
          <div class="row">
            <div class="form-group col-md-6">
              <label for="e-firstName" class="active">{{'user.firstname' | translate}} *</label>
              <input id="e-firstName" type="text" class="form-control" formControlName="firstName">
            </div>
            <div class="form-group col-md-6">
              <label for="e-lastName" class="active">{{'user.lastname' | translate}} *</label>
              <input id="e-lastName" type="text" class="form-control" formControlName="lastName">
            </div>
            <div class="form-group col-md-6">
              <label for="e-email" class="active">{{'user.email' | translate}} *</label>
              <input id="e-email" type="email" class="form-control" formControlName="email">
            </div>
            <div class="form-group col-md-6">
              <label class="active">{{'user.cittadinanza.label' | translate}}</label>
              <div class="pt-2">
                <div class="form-check form-check-inline">
                  <input id="e-italy" name="straniero" formControlName="straniero" type="radio" value="false">
                  <label for="e-italy">{{'user.cittadinanza.italy' | translate}}</label>
                </div>
                <div class="form-check form-check-inline">
                  <input id="e-foreign" name="straniero" formControlName="straniero" type="radio" value="true">
                  <label for="e-foreign">{{'user.cittadinanza.foreign' | translate}}</label>
                </div>
              </div>
            </div>
            <div *ngIf="!isForeign()" class="form-group col-md-6">
              <label for="e-cf" class="active">{{'user.codicefiscale' | translate}}</label>
              <input id="e-cf" type="text" class="form-control text-uppercase" formControlName="codicefiscale">
            </div>
            <ng-container *ngIf="isForeign()">
              <div class="form-group col-md-6">
                <label class="active">{{'user.sex' | translate}}</label>
                <div class="pt-2">
                  <div class="form-check form-check-inline">
                    <input id="e-male" name="sesso" formControlName="sesso" type="radio" value="M">
                    <label for="e-male">{{'user.male' | translate}}</label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input id="e-female" name="sesso" formControlName="sesso" type="radio" value="F">
                    <label for="e-female">{{'user.female' | translate}}</label>
                  </div>
                </div>
              </div>
              <div class="form-group col-md-6">
                <label for="e-birth" class="active">{{'user.dataDiNascita' | translate}}</label>
                <input id="e-birth" type="date" class="form-control" formControlName="dataDiNascita">
              </div>
              <div class="form-group col-md-6">
                <app-control-nazione [label]="'user.statoestero' | translate" formControlName="statoestero"></app-control-nazione>
              </div>
            </ng-container>
          </div>
          <div class="text-end">
            <button type="button" class="btn btn-outline-secondary btn-sm me-2" (click)="editing = null" translate>button.cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" [disabled]="editForm.invalid || !!editingReadonly" translate>save</button>
          </div>
        </form>
      </div>
    </div>

    <div class="table-responsive" *ngIf="people && people.length">
      <table class="table table-hover">
        <thead>
          <tr>
            <th *ngIf="isAdmin" translate>admin.users.enabled</th>
            <th translate>admin.users.firstName</th>
            <th translate>admin.users.lastName</th>
            <th translate>admin.users.email</th>
            <th translate>admin.users.userName</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <ng-container *ngFor="let person of people">
            <tr>
              <td *ngIf="isAdmin">
                <button class="btn btn-sm py-0" [ngClass]="person.enabled ? 'btn-success' : 'btn-warning'"
                  (click)="onToggleEnabled(person)">
                  {{(person.enabled ? 'admin.users.active' : 'admin.users.disabled') | translate}}
                </button>
              </td>
              <td>{{person.firstName}}</td>
              <td>{{person.lastName}}</td>
              <td>{{person.email === 'nomail' ? person.emailesterno : person.email}}</td>
              <td><small class="font-monospace">{{person.userName}}</small></td>
              <td class="text-end text-nowrap">
                <button class="btn btn-link btn-sm p-1" (click)="onShowGroups(person)" translate>admin.users.groups</button>
                <button *ngIf="isAdmin" class="btn btn-link btn-sm p-1" (click)="onEdit(person)" translate>edit</button>
                <button *ngIf="isAdmin && person.userName !== currentUserName" class="btn btn-link btn-sm p-1 text-danger" (click)="onDelete(person)" translate>delete</button>
              </td>
            </tr>
            <tr *ngIf="groupsOf === person.userName">
              <td colspan="6" class="bg-light">
                <strong>{{'admin.users.groupsOf' | translate:{value: person.userName} }}</strong>
                <ul class="mb-0 small">
                  <li *ngFor="let group of groups">
                    {{group.displayName}} <span class="text-muted">({{group.itemName}})</span>
                    <a href="javascript:" class="ms-2" (click)="onShowMembers(group.itemName)" translate>admin.groups.allMembers</a>
                    <div *ngIf="membersOf === group.itemName" class="text-muted">{{members.join(', ')}}</div>
                  </li>
                </ul>
              </td>
            </tr>
          </ng-container>
        </tbody>
      </table>
    </div>
  `
})
export class UsersComponent implements OnInit {

  public searchFields = ['firstName', 'lastName', 'userName', 'matricola', 'codicefiscale', 'email'];
  /** Campi della modifica, come il form legacy editUser: anagrafica e, per nazionalità, codice fiscale o dati esteri. */
  public editingReadonly: string;
  public searchForm: FormGroup;
  public editForm: FormGroup;
  public people: any[];
  public searching = false;
  public editing: any;
  public groupsOf: string;
  public groups: {itemName: string, displayName: string}[] = [];
  public membersOf: string;
  public members: string[] = [];
  public isAdmin = false;
  public currentUserName: string;

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    private authService: AuthService,
    private modalService: ModalService,
    private apiMessageService: ApiMessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.isAdmin = !!(user && user.capabilities && user.capabilities.isAdmin);
    this.currentUserName = user ? user.userName : null;
    const controls: any = { smart: [true] };
    this.searchFields.forEach(field => controls[field] = ['']);
    this.searchForm = this.formBuilder.group(controls);
    const editControls: any = {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      straniero: ['false'],
      codicefiscale: [''],
      sesso: [''],
      dataDiNascita: [''],
      statoestero: ['']
    };
    this.editForm = this.formBuilder.group(editControls);
  }

  onSearch() {
    const value = this.searchForm.value;
    if (!this.searchFields.some(field => value[field] && value[field].trim())) {
      this.apiMessageService.sendMessage(MessageType.WARNING, 'admin.users.filterRequired');
      return;
    }
    this.searching = true;
    this.editing = null;
    this.groupsOf = null;
    this.adminService.searchUsers(value).subscribe(result => {
      this.people = result.people || [];
      this.searching = false;
    }, () => this.searching = false);
  }

  onToggleEnabled(person: any) {
    this.adminService.setUserEnabled(person.userName, !person.enabled)
      .subscribe(result => person.enabled = result.enabled);
  }

  onShowGroups(person: any) {
    if (this.groupsOf === person.userName) {
      this.groupsOf = null;
      return;
    }
    this.adminService.userGroups(person.userName).subscribe(result => {
      this.groups = result.groups || [];
      this.groupsOf = person.userName;
      this.membersOf = null;
    });
  }

  onShowMembers(groupName: string) {
    this.adminService.groupMembers(groupName).subscribe(members => {
      this.members = members || [];
      this.membersOf = groupName;
    });
  }

  isForeign(): boolean {
    return String(this.editForm.controls['straniero'].value) === 'true';
  }

  onEdit(person: any) {
    this.adminService.user(person.userName).subscribe(user => {
      this.editing = user;
      const birth = user['cnrperson:dataDiNascita'];
      this.editForm.enable({ emitEvent: false });
      this.editForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email === 'nomail' ? (user['cnrperson:emailesterno'] || '') : (user.email || ''),
        straniero: String(!!user['cnrperson:straniero']),
        codicefiscale: user['cnrperson:codicefiscale'] || '',
        sesso: user['cnrperson:sesso'] || '',
        dataDiNascita: birth ? this.isoDate(birth) : '',
        statoestero: user['cnrperson:statoestero'] || ''
      });
      // come nel profilo: utenze CNR/SPID (dati immutabili) e di altre applicazioni non si modificano qui
      const immutability = user.immutability || {};
      const application = user['cnrexternaluser:application'] || user.application;
      this.editingReadonly = immutability['{http://www.alfresco.org/model/content/1.0}firstName'] === true
        ? this.translateService.instant('message.error.cnr.user')
        : (application ? this.translateService.instant('message.error.user.application', { value: application }) : null);
      if (this.editingReadonly) {
        this.editForm.disable({ emitEvent: false });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  onSaveUser() {
    const value = this.editForm.value;
    const foreign = String(value.straniero) === 'true';
    // solo i campi del form, con i nomi semplici come il profilo utente: i dati dell'utente letti dal backend
    // contengono anche i valori precedenti (es. "sesso" accanto a "cnrperson:sesso") che sovrascriverebbero i nuovi
    const user: any = {
      userName: this.editing.userName,
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      straniero: foreign,
      codicefiscale: foreign ? '' : (value.codicefiscale || '').toUpperCase(),
      sesso: foreign ? (value.sesso || '') : '',
      statoestero: foreign ? (value.statoestero || '') : ''
    };
    if (foreign && value.dataDiNascita) {
      user.dataDiNascita = this.cmisDate(value.dataDiNascita);
    }
    this.adminService.updateUser(this.editing.userName, user).subscribe(() => {
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'admin.users.saved');
      this.editing = null;
      this.onSearch();
    });
  }

  /** Data come la invia il legacy (yyyy-MM-dd'T'HH:mm:ss.SSS+01:00), a mezzogiorno per evitare cambi di giorno. */
  private cmisDate(isoDay: string): string {
    const date = new Date(isoDay + 'T12:00:00');
    const offset = -date.getTimezoneOffset();
    const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
    return isoDay + 'T12:00:00.000' + (offset >= 0 ? '+' : '-') + pad(offset / 60) + ':' + pad(offset % 60);
  }

  private isoDate(value: any): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  onDelete(person: any) {
    const modalRef = this.modalService.show(ModalConfirmComponent,
      Object.assign({ initialState: { body: 'admin.users.confirmDelete' } }, { animated: true, class: 'modal-dialog-centered' }));
    modalRef.content.confirm.subscribe(() =>
      this.adminService.deleteUser(person.userName).subscribe(() => {
        this.people = this.people.filter(p => p.userName !== person.userName);
        this.apiMessageService.sendMessage(MessageType.SUCCESS, 'admin.users.deleted');
      }));
  }
}
