import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalService } from '../../shared/modal/modal.service';
import { AdminService, Permission } from '../admin.service';
import { AuthService } from '../../auth/auth.service';
import { ApiMessageService, MessageType } from '../../core/api-message.service';
import { ModalConfirmComponent } from '../../shared/tags/wizard/modal-confirm.component';

/**
 * Consultazione e modifica della configurazione RBAC (ex pagina legacy rbac-admin).
 * La configurazione ha la forma { id: { METODO: { whitelist|blacklist: { all: true, group: [...], user: [...] } } } }
 * e viene mostrata come elenco di regole.
 */
@Component({
  standalone: false,
  selector: 'app-admin-rbac',
  template: `
    <div *ngIf="isAdmin" class="card card-bg mb-3">
      <div class="card-body">
        <h5 class="card-title" translate>admin.rbac.add</h5>
        <form [formGroup]="form" (ngSubmit)="onAdd()" class="row align-items-end">
          <div class="form-group col-md-3">
            <label for="r-id" class="active" translate>admin.rbac.id</label>
            <input id="r-id" type="text" class="form-control" formControlName="id" list="r-ids">
            <datalist id="r-ids"><option *ngFor="let id of ids" [value]="id"></option></datalist>
          </div>
          <div class="form-group col-md-2">
            <label for="r-method" class="active" translate>admin.rbac.method</label>
            <select id="r-method" class="form-select" formControlName="method">
              <option *ngFor="let m of methods" [value]="m">{{m}}</option>
            </select>
          </div>
          <div class="form-group col-md-2">
            <label for="r-list" class="active" translate>admin.rbac.list</label>
            <select id="r-list" class="form-select" formControlName="list">
              <option value="whitelist">whitelist</option>
              <option value="blacklist">blacklist</option>
            </select>
          </div>
          <div class="form-group col-md-2">
            <label for="r-type" class="active" translate>admin.rbac.type</label>
            <select id="r-type" class="form-select" formControlName="type">
              <option value="group">group</option>
              <option value="user">user</option>
              <option value="all">all</option>
            </select>
          </div>
          <div class="form-group col-md-2">
            <label for="r-authority" class="active" translate>admin.rbac.authority</label>
            <input id="r-authority" type="text" class="form-control" formControlName="authority" [readonly]="form.value.type === 'all'">
          </div>
          <div class="form-group col-md-1 text-end">
            <button type="submit" class="btn btn-primary btn-sm"
              [disabled]="form.invalid || (form.value.type !== 'all' && !form.value.authority)" translate>add</button>
          </div>
        </form>
      </div>
    </div>

    <div class="form-group">
      <label for="r-filter" class="active" translate>admin.rbac.filter</label>
      <input id="r-filter" type="text" class="form-control" [(ngModel)]="filter">
    </div>

    <app-layout-wait [loaded]="rules"></app-layout-wait>
    <div class="table-responsive" *ngIf="rules">
      <table class="table table-sm table-hover">
        <thead>
          <tr>
            <th translate>admin.rbac.id</th>
            <th translate>admin.rbac.method</th>
            <th translate>admin.rbac.list</th>
            <th translate>admin.rbac.type</th>
            <th translate>admin.rbac.authority</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let rule of filtered()">
            <td class="font-monospace">{{rule.id}}</td>
            <td>{{rule.method}}</td>
            <td><span class="badge" [ngClass]="rule.list === 'whitelist' ? 'bg-success' : 'bg-danger'">{{rule.list}}</span></td>
            <td>{{rule.type}}</td>
            <td class="font-monospace">{{rule.authority || '*'}}</td>
            <td class="text-end">
              <button *ngIf="isAdmin" class="btn btn-link btn-sm p-1 text-danger" (click)="onDelete(rule)" translate>delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class RbacComponent implements OnInit {

  public methods = ['GET', 'POST', 'PUT', 'DELETE'];
  public rules: Permission[];
  public ids: string[] = [];
  public filter = '';
  public form: FormGroup;
  public isAdmin = false;

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
    this.form = this.formBuilder.group({
      id: ['', Validators.required],
      method: ['GET', Validators.required],
      list: ['whitelist', Validators.required],
      type: ['group', Validators.required],
      authority: ['']
    });
    this.load();
  }

  load() {
    this.rules = undefined;
    this.adminService.rbac().subscribe(rbac => {
      const rules: Permission[] = [];
      Object.keys(rbac || {}).sort().forEach(id =>
        Object.keys(rbac[id] || {}).forEach(method =>
          Object.keys(rbac[id][method] || {}).forEach(list => {
            const entry = rbac[id][method][list] || {};
            if (entry.all) {
              rules.push({ id, method: method as any, list: list as any, type: 'all' });
            }
            ['group', 'user'].forEach(type =>
              (entry[type] || []).forEach(authority =>
                rules.push({ id, method: method as any, list: list as any, type: type as any, authority })));
          })));
      this.rules = rules;
      this.ids = Object.keys(rbac || {}).sort();
    }, () => this.rules = []);
  }

  filtered(): Permission[] {
    const term = (this.filter || '').toLowerCase();
    return (this.rules || []).filter(rule => !term ||
      rule.id.toLowerCase().indexOf(term) !== -1 ||
      (rule.authority || '').toLowerCase().indexOf(term) !== -1);
  }

  onAdd() {
    const permission: Permission = Object.assign({}, this.form.value);
    if (permission.type === 'all') {
      delete permission.authority;
    }
    this.adminService.addPermission(permission).subscribe(() => {
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'admin.rbac.saved');
      this.form.patchValue({ authority: '' });
      this.load();
    });
  }

  onDelete(rule: Permission) {
    const modalRef = this.modalService.show(ModalConfirmComponent,
      Object.assign({ initialState: { body: 'admin.rbac.confirmDelete' } }, { animated: true, class: 'modal-dialog-centered' }));
    modalRef.content.confirm.subscribe(() =>
      this.adminService.deletePermission(rule).subscribe(() => this.load()));
  }
}
