import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalRef } from '../../../shared/modal/modal.service';
import { Call } from '../call.model';
import { ManageCallService } from '../manage-call.service';
import { CacheService } from '../../cache.service';
import { Sede } from '../../../common/model/sede.model';
import { ApiMessageService, MessageType } from '../../api-message.service';

/**
 * Crea un bando figlio di un macro-bando (ex form create_child_call di cool-jconon):
 * il figlio eredita dal padre tutte le proprieta' non indicate qui, tranne commissione e RdP.
 */
@Component({
  standalone: false,
  selector: 'create-child-call',
  template: `
    <div class="modal-header border-bottom">
      <h3 class="modal-title text-primary pb-2 text-truncate" translate>call_manage.child.title</h3>
      <button type="button" class="btn p-0 ms-2 float-end" aria-label="Close" (click)="modalRef.hide()">
        <svg class="icon"><use href="/assets/bootstrap-italia/svg/sprites.svg#it-close-circle"></use></svg>
      </button>
    </div>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <p class="small text-muted">{{'call_manage.child.info' | translate:{value: parent.codice} }}</p>
        <div class="row">
          <div class="form-group col-md-8">
            <label for="child-codice" class="active" translate>label.jconon_call.codice</label>
            <input id="child-codice" type="text" class="form-control" formControlName="jconon_call:codice">
          </div>
          <div class="form-group col-md-4">
            <label for="child-posti" class="active" translate>label.jconon_call.numero_posti</label>
            <input id="child-posti" type="number" min="1" class="form-control" formControlName="jconon_call:numero_posti">
          </div>
          <div class="form-group col-md-12">
            <label for="child-sede" class="active" translate>label.jconon_call.sede_id</label>
            <select id="child-sede" class="form-select" formControlName="jconon_call:sede_id" (change)="onChangeSede()">
              <option value=""></option>
              <option *ngFor="let sede of sedi" [value]="sede.sedeId">{{sede.label}}</option>
            </select>
          </div>
          <div class="form-group col-md-6">
            <label for="child-sede-desc" class="active" translate>label.jconon_call.sede</label>
            <input id="child-sede-desc" type="text" class="form-control" formControlName="jconon_call:sede">
          </div>
          <div class="form-group col-md-6">
            <label for="child-struttura" class="active" translate>label.jconon_call.struttura_destinataria</label>
            <input id="child-struttura" type="text" class="form-control" formControlName="jconon_call:struttura_destinataria">
          </div>
          <div class="form-group col-md-6">
            <label for="child-sede-en" class="active" translate>label.jconon_call.sede_en</label>
            <input id="child-sede-en" type="text" class="form-control" formControlName="jconon_call:sede_en">
          </div>
          <div class="form-group col-md-6">
            <label for="child-struttura-en" class="active" translate>label.jconon_call.struttura_destinataria_en</label>
            <input id="child-struttura-en" type="text" class="form-control" formControlName="jconon_call:struttura_destinataria_en">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" (click)="modalRef.hide()" translate>button.cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving" translate>call_manage.child.create</button>
      </div>
    </form>
  `
})
export class CreateChildCallComponent implements OnInit {

  public parent: Call;
  public form: FormGroup;
  public sedi: Sede[] = [];
  public saving = false;
  @Output() created = new EventEmitter<string>();

  constructor(
    public modalRef: ModalRef,
    private formBuilder: FormBuilder,
    private manageCallService: ManageCallService,
    private cacheService: CacheService,
    private apiMessageService: ApiMessageService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      'jconon_call:codice': ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9.\-_\/ ]+$/)]],
      'jconon_call:numero_posti': ['', [Validators.required, Validators.min(1)]],
      'jconon_call:sede_id': [''],
      'jconon_call:sede': [''],
      'jconon_call:sede_en': [''],
      'jconon_call:struttura_destinataria': [''],
      'jconon_call:struttura_destinataria_en': ['']
    });
    this.cacheService.sedi('true').subscribe(sedi => this.sedi = sedi);
  }

  onChangeSede() {
    const sede = this.sedi.find(s => s.sedeId === this.form.value['jconon_call:sede_id']);
    this.form.patchValue({
      'jconon_call:sede': sede ? sede.descrizione : '',
      'jconon_call:struttura_destinataria': sede ? sede.citta : ''
    });
  }

  onSubmit() {
    this.saving = true;
    const body = {};
    Object.keys(this.form.value).forEach(key => body[key] = ManageCallService.toRequestValue(this.form.value[key]));
    this.manageCallService.createChild(this.parent.objectId, body).subscribe(result => {
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'call_manage.child.created');
      this.modalRef.hide();
      this.created.emit(result.objectId);
    }, () => this.saving = false);
  }
}
