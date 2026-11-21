import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ModalRef } from '../../../shared/modal/modal.service';
import { AuthorityPickerComponent } from '../../../shared/ui/authority-picker.component';
import { AclRole, ManageCallService } from '../../call/manage-call.service';

/**
 * Autorizzazioni su un allegato del bando (ex azione "autorizzazioni" del legacy): ereditarietà dei permessi del
 * bando e ruoli assegnati a utenti o gruppi, ad esempio per l'accesso agli atti concorsuali.
 */
@Component({
  selector: 'app-document-permissions-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, AuthorityPickerComponent],
  template: `
    <div class="modal-header">
      <h2 class="modal-title h5 no_toc">{{ 'document.permissions.title' | translate }}: {{ name }}</h2>
      <button type="button" class="btn-close" [attr.aria-label]="'layout.close' | translate" (click)="modalRef.hide()">
        <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
      </button>
    </div>
    <div class="modal-body pt-3">
      @if (!acl) {
        <p class="text-secondary">{{ 'layout.loading' | translate }}</p>
      } @else {
        <div class="form-check mb-3">
          <input id="doc-acl-inherited" type="checkbox" [checked]="acl.isInherited" (change)="toggleInherited($any($event.target).checked)">
          <label for="doc-acl-inherited">{{ 'document.permissions.inherited' | translate }}</label>
        </div>
        <form [formGroup]="form" (ngSubmit)="add()" class="card card-bg mb-3">
          <div class="card-body row align-items-end">
            <div class="form-group col-md-6">
              <app-authority-picker mode="both" formControlName="authority"></app-authority-picker>
            </div>
            <div class="form-group col-md-4">
              <label for="doc-acl-role" class="active">{{ 'call_manage.permissions.role' | translate }}</label>
              <select id="doc-acl-role" class="form-select" formControlName="role">
                @for (role of roles; track role) { <option [value]="role">{{ role }}</option> }
              </select>
            </div>
            <div class="form-group col-md-2 text-end">
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="form.invalid || busy">{{ 'add' | translate }}</button>
            </div>
          </div>
        </form>
        <h3 class="h6">{{ 'call_manage.permissions.direct' | translate }}</h3>
        <table class="table table-sm">
          <tbody>
            @for (perm of acl.direct || []; track perm.authority.name + perm.role) {
              <tr>
                <td>{{ perm.authority.displayName }} <small class="text-muted">{{ perm.authority.name }}</small></td>
                <td>{{ perm.role }}</td>
                <td class="text-end"><button type="button" class="btn btn-link btn-sm text-danger" [disabled]="busy" (click)="remove(perm)">{{ 'delete' | translate }}</button></td>
              </tr>
            } @empty {
              <tr><td class="text-muted">{{ 'no_item' | translate }}</td></tr>
            }
          </tbody>
        </table>
        @if (acl.isInherited && acl.inherited?.length) {
          <h3 class="h6">{{ 'call_manage.permissions.inherited_list' | translate }}</h3>
          <table class="table table-sm text-muted">
            <tbody>
              @for (perm of acl.inherited; track perm.authority.name + perm.role) {
                <tr><td>{{ perm.authority.displayName }} <small>{{ perm.authority.name }}</small></td><td>{{ perm.role }}</td></tr>
              }
            </tbody>
          </table>
        }
      }
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-primary" (click)="modalRef.hide()">{{ 'layout.close' | translate }}</button>
    </div>
  `
})
export class DocumentPermissionsModalComponent implements OnInit {
  /** Id dell'allegato (gli endpoint dei permessi del bando valgono per qualsiasi oggetto). */
  public objectId: string;
  public name: string;
  public acl: any;
  public busy = false;
  public roles: AclRole[] = ['Consumer', 'Contributor', 'Editor', 'Collaborator', 'Coordinator'];
  public form: FormGroup;

  public readonly modalRef = inject(ModalRef);
  private readonly manageCallService = inject(ManageCallService);
  private readonly formBuilder = inject(FormBuilder);

  ngOnInit(): void {
    // senza la versione (";1.0"): nel percorso il ";" viene rifiutato dal backend e i permessi valgono per il nodo
    this.objectId = String(this.objectId || '').split(';')[0];
    this.form = this.formBuilder.group({ authority: ['', Validators.required], role: ['Consumer', Validators.required] });
    this.load();
  }

  load(): void {
    this.manageCallService.acl(this.objectId).subscribe(acl => this.acl = acl, () => this.acl = { direct: [] });
  }

  add(): void {
    this.busy = true;
    this.manageCallService.addAcl(this.objectId, String(this.form.value.authority || '').trim(), this.form.value.role).subscribe(() => {
      this.busy = false;
      this.form.patchValue({ authority: '' });
      this.load();
    }, () => this.busy = false);
  }

  remove(perm: any): void {
    this.busy = true;
    this.manageCallService.removeAcl(this.objectId, perm.authority.name, perm.role).subscribe(() => {
      this.busy = false;
      this.load();
    }, () => this.busy = false);
  }

  toggleInherited(value: boolean): void {
    this.manageCallService.setInheritedAcl(this.objectId, value).subscribe(() => this.load());
  }
}
