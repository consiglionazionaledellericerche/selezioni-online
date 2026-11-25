import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalService } from '../../shared/modal/modal.service';
import { forkJoin } from 'rxjs';
import { AdminService, Authority } from '../admin.service';
import { CacheService } from '../../core/cache.service';
import { ApiMessageService, MessageType } from '../../core/api-message.service';
import { ModalConfirmComponent } from '../../shared/tags/wizard/modal-confirm.component';
import { Sede } from '../../common/model/sede.model';

interface PathItem {
  nodeRef: string;
  fullName: string;
  displayName: string;
}

/**
 * Gestione dei gruppi (route /admin/groups) e dei gruppi gestori (route /admin/gestori, zona AUTH.EXT.gestori).
 * Riproduce le pagine legacy groups e gestori: navigazione ad albero, creazione ed eliminazione
 * di gruppi, aggiunta e rimozione di membri, elenco degli utenti di un gruppo.
 */
@Component({
  standalone: false,
  selector: 'app-admin-groups',
  template: `
    <nav class="breadcrumb-container" aria-label="breadcrumb">
      <ol class="breadcrumb p-0 mb-2">
        <li class="breadcrumb-item">
          <a href="javascript:" (click)="goTo(-1)">{{(gestori ? 'admin.menu.gestori' : 'admin.groups.root') | translate}}</a>
          <span class="separator" *ngIf="path.length">/</span>
        </li>
        <li *ngFor="let item of path; let i = index; let last = last" class="breadcrumb-item" [ngClass]="{'active': last}">
          <a *ngIf="!last" href="javascript:" (click)="goTo(i)">{{item.displayName}}</a>
          <span *ngIf="last">{{item.displayName}}</span>
          <span class="separator" *ngIf="!last">/</span>
        </li>
      </ol>
    </nav>

    <div class="d-flex flex-wrap gap-2 mb-3">
      <button class="btn btn-primary btn-sm" (click)="showCreate = !showCreate; showAddMember = false; editing = null" translate>admin.groups.create</button>
      <button *ngIf="current" class="btn btn-outline-primary btn-sm" (click)="showAddMember = !showAddMember; showCreate = false" translate>admin.groups.addMember</button>
      <button *ngIf="current" class="btn btn-outline-secondary btn-sm" (click)="loadMembers()" translate>admin.groups.allMembers</button>
    </div>

    <div *ngIf="showCreate || editing" class="card card-bg mb-3">
      <div class="card-body">
        <h5 class="card-title">{{(editing ? 'admin.groups.edit' : 'admin.groups.create') | translate}}</h5>
        <form [formGroup]="groupForm" (ngSubmit)="onSaveGroup()">
          <div class="row">
            <div class="form-group col-md-6">
              <label for="g-name" class="active" translate>admin.groups.name</label>
              <input id="g-name" type="text" class="form-control" formControlName="group_name" [readonly]="!!editing">
            </div>
            <div class="form-group col-md-6">
              <label for="g-display" class="active" translate>admin.groups.displayName</label>
              <input id="g-display" type="text" class="form-control" formControlName="display_name">
            </div>
          </div>
          <div class="row" *ngIf="gestori && current">
            <div class="form-group col-md-6">
              <label for="g-calltype" class="active" translate>admin.gestori.callType</label>
              <select id="g-calltype" class="form-select" formControlName="call_type">
                <option value=""></option>
                <option *ngFor="let type of callTypes" [value]="type.key">{{type.key | translate}}</option>
              </select>
            </div>
            <div class="form-group col-md-6">
              <label for="g-sede" class="active" translate>admin.gestori.sede</label>
              <select id="g-sede" class="form-select" formControlName="sede" multiple size="6">
                <option *ngFor="let sede of sedi" [value]="sede.sedeId">{{sede.label}}</option>
              </select>
            </div>
          </div>
          <div class="text-end">
            <button type="button" class="btn btn-outline-secondary btn-sm me-2" (click)="showCreate = false; editing = null" translate>button.cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" [disabled]="groupForm.invalid" translate>save</button>
          </div>
        </form>
      </div>
    </div>

    <div *ngIf="showAddMember && current" class="card card-bg mb-3">
      <div class="card-body">
        <h5 class="card-title" translate>admin.groups.addMember</h5>
        <p class="small text-muted" translate>admin.groups.addMemberHint</p>
        <div class="row align-items-end">
          <div class="form-group col-md-8">
            <!-- utente o gruppo, con l'autocompletamento comune (come nel legacy cnr.ui.authority) -->
            <app-authority-picker mode="both" [(ngModel)]="memberName"></app-authority-picker>
          </div>
          <div class="form-group col-md-4 text-end">
            <button class="btn btn-primary btn-sm" [disabled]="!memberName" (click)="onAddMember()" translate>add</button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="members" class="alert alert-info">
      <button type="button" class="btn-close float-end" aria-label="Close" (click)="members = null"></button>
      <strong>{{'admin.groups.allMembersOf' | translate:{value: current?.displayName} }}</strong> ({{members.length}})
      <div class="small mt-2">{{members.join(', ')}}</div>
    </div>

    <app-layout-wait [loaded]="children"></app-layout-wait>
    <div *ngIf="children && children.length === 0" class="alert alert-light" translate>no_item</div>
    <table *ngIf="children && children.length" class="table table-hover">
      <tbody>
        <tr *ngFor="let child of children">
          <td>
            <svg class="icon icon-sm me-1" [ngClass]="child.attr.type === 'GROUP' ? 'icon-primary' : 'icon-secondary'">
              <use [attr.href]="'/assets/bootstrap-italia/svg/sprites.svg#' + (child.attr.type === 'GROUP' ? 'it-pa' : 'it-user')"></use>
            </svg>
            <a *ngIf="child.attr.type === 'GROUP'" href="javascript:" (click)="open(child)">{{child.attr.displayName}}</a>
            <span *ngIf="child.attr.type !== 'GROUP'">{{child.attr.displayName}}</span>
            <small class="text-muted ms-2">{{child.attr.shortName}}</small>
          </td>
          <td class="text-end text-nowrap">
            <button *ngIf="gestori && child.attr.type === 'GROUP' && current" class="btn btn-link btn-sm p-1" (click)="onEditGestori(child)" translate>edit</button>
            <button *ngIf="current" class="btn btn-link btn-sm p-1" (click)="onRemoveMember(child)" translate>admin.groups.removeMember</button>
            <button *ngIf="child.attr.type === 'GROUP'" class="btn btn-link btn-sm p-1 text-danger" (click)="onDeleteGroup(child)" translate>delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class GroupsComponent implements OnInit {

  public static ZONE_GESTORI = 'AUTH.EXT.gestori';
  public static GESTORI_CALL_TYPE = 'jconon_group_gestori:call_type';
  public static GESTORI_SEDE = 'jconon_group_gestori:sede';

  public gestori = false;
  public path: PathItem[] = [];
  public children: Authority[];
  public members: string[];
  public showCreate = false;
  public showAddMember = false;
  public editing: Authority;
  public memberName: string;
  public groupOptions: any[] = [];
  public groupForm: FormGroup;
  public callTypes: any[] = [];
  public sedi: Sede[] = [];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    private cacheService: CacheService,
    private modalService: ModalService,
    private apiMessageService: ApiMessageService
  ) {}

  get current(): PathItem {
    return this.path.length ? this.path[this.path.length - 1] : null;
  }

  ngOnInit(): void {
    this.gestori = !!this.route.snapshot.data['gestori'];
    this.groupForm = this.formBuilder.group({
      group_name: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_\-.]+$/)]],
      display_name: ['', Validators.required],
      call_type: [''],
      sede: [[]]
    });
    if (this.gestori) {
      forkJoin([this.cacheService.cache(), this.cacheService.sedi('true')]).subscribe(([cache, sedi]) => {
        this.callTypes = cache.jsonlistCallType || [];
        this.sedi = sedi;
      });
    }
    this.load();
  }

  load() {
    this.children = undefined;
    this.members = null;
    this.adminService.groupChildren(
      this.current ? this.current.fullName : undefined,
      this.gestori ? GroupsComponent.ZONE_GESTORI : undefined
    ).subscribe(children => {
      this.children = (children || []).sort((a, b) =>
        (a.attr.type === b.attr.type ? 0 : a.attr.type === 'GROUP' ? -1 : 1) ||
        (a.attr.displayName || '').localeCompare(b.attr.displayName || ''));
    }, () => this.children = []);
  }

  open(child: Authority) {
    this.path.push({ nodeRef: child.attr.id, fullName: child.attr.fullName, displayName: child.attr.displayName });
    this.resetPanels();
    this.load();
  }

  goTo(index: number) {
    this.path = this.path.slice(0, index + 1);
    this.resetPanels();
    this.load();
  }

  loadMembers() {
    this.adminService.groupMembers(this.current.fullName).subscribe(members => this.members = members || []);
  }

  onSaveGroup() {
    const value = this.groupForm.value;
    const group: any = {
      group_name: this.editing ? this.editing.attr.fullName : value.group_name,
      display_name: value.display_name
    };
    if (!this.editing && this.current) {
      group.parent_group_name = this.current.fullName;
    }
    let request;
    if (this.gestori) {
      if (this.current) {
        group.extraProperty = {
          [GroupsComponent.GESTORI_CALL_TYPE]: value.call_type || null,
          [GroupsComponent.GESTORI_SEDE]: value.sede && value.sede.length ? value.sede : null
        };
      }
      request = this.adminService.saveGestori(group);
    } else {
      request = this.adminService.saveGroup(group);
    }
    request.subscribe(() => {
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'admin.groups.saved');
      this.resetPanels();
      this.load();
    });
  }

  onEditGestori(child: Authority) {
    this.showCreate = false;
    this.adminService.groupMetadata(child.attr.id).subscribe(metadata => {
      const properties = metadata && metadata.properties ? metadata.properties : {};
      const sede = properties[GroupsComponent.GESTORI_SEDE];
      this.groupForm.reset({
        group_name: child.attr.shortName,
        display_name: child.attr.displayName,
        call_type: properties[GroupsComponent.GESTORI_CALL_TYPE] || '',
        sede: Array.isArray(sede) ? sede : (sede ? [sede] : [])
      });
      this.editing = child;
    });
  }

  onSearchGroup() {
    const term = (this.memberName || '').trim().replace(/\*/g, '');
    if (term.length < 3) {
      this.groupOptions = [];
      return;
    }
    this.adminService.searchGroups('*' + term + '*')
      .subscribe(result => this.groupOptions = result.groups || [], () => this.groupOptions = []);
  }

  onAddMember() {
    this.adminService.addGroupChild(this.current.fullName, this.memberName.trim()).subscribe(() => {
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'admin.groups.memberAdded');
      this.memberName = '';
      this.showAddMember = false;
      this.load();
    });
  }

  onRemoveMember(child: Authority) {
    this.confirm('admin.groups.confirmRemoveMember', () =>
      this.adminService.removeGroupChild(this.current.nodeRef, child.attr.authorityId).subscribe(() => this.load()));
  }

  onDeleteGroup(child: Authority) {
    this.confirm('admin.groups.confirmDelete', () =>
      this.adminService.deleteGroup(child.attr.fullName).subscribe(() => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, 'admin.groups.deleted');
        this.load();
      }));
  }

  private resetPanels() {
    this.showCreate = false;
    this.showAddMember = false;
    this.editing = null;
    this.groupForm.reset({ group_name: '', display_name: '', call_type: '', sede: [] });
  }

  private confirm(body: string, action: () => void) {
    const modalRef = this.modalService.show(ModalConfirmComponent,
      Object.assign({ initialState: { body } }, { animated: true, class: 'modal-dialog-centered' }));
    modalRef.content.confirm.subscribe(() => action());
  }
}
