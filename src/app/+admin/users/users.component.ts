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
          <div class="row">
            <div class="form-group col-md-6" *ngFor="let field of editFields">
              <label [for]="'e-' + field.name" class="active">{{field.label | translate}}</label>
              <input [id]="'e-' + field.name" [type]="field.type || 'text'" class="form-control" [formControlName]="field.name">
            </div>
          </div>
          <div class="text-end">
            <button type="button" class="btn btn-outline-secondary btn-sm me-2" (click)="editing = null" translate>button.cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" [disabled]="editForm.invalid" translate>save</button>
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
  public editFields = [
    { name: 'firstName', label: 'admin.users.firstName' },
    { name: 'lastName', label: 'admin.users.lastName' },
    { name: 'email', label: 'admin.users.email', type: 'email' },
    { name: 'cnrperson:emailesterno', label: 'admin.users.emailesterno', type: 'email' },
    { name: 'cnrperson:codicefiscale', label: 'admin.users.codicefiscale' },
    { name: 'telephone', label: 'admin.users.telephone' },
    { name: 'mobile', label: 'admin.users.mobile' }
  ];
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
    private apiMessageService: ApiMessageService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.isAdmin = !!(user && user.capabilities && user.capabilities.isAdmin);
    this.currentUserName = user ? user.userName : null;
    const controls: any = { smart: [true] };
    this.searchFields.forEach(field => controls[field] = ['']);
    this.searchForm = this.formBuilder.group(controls);
    const editControls: any = {};
    this.editFields.forEach(field => editControls[field.name] = ['']);
    editControls['firstName'] = ['', Validators.required];
    editControls['lastName'] = ['', Validators.required];
    editControls['email'] = ['', [Validators.required, Validators.email]];
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

  onEdit(person: any) {
    this.adminService.user(person.userName).subscribe(user => {
      this.editing = user;
      const value: any = {};
      this.editFields.forEach(field => value[field.name] = user[field.name] || '');
      this.editForm.reset(value);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  onSaveUser() {
    const user = Object.assign({}, this.editing, this.editForm.value);
    this.adminService.updateUser(this.editing.userName, user).subscribe(() => {
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'admin.users.saved');
      this.editing = null;
      this.onSearch();
    });
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
