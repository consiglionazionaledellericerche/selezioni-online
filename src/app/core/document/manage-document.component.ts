import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalRef } from '../../shared/modal/modal.service';
import { DocumentService } from './document.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Document } from '../../common/model/document.model';
import { CommonEditComponent } from '../../common/controller/common-edit.component';
import { Helpers } from '../../common/helpers/helpers';
import { ObjectType } from '../../common/model/object-type.model';
import { ObjectTypeService } from '../object-type.service';
import { ConfigService } from '../config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'manage-document',
  template: `
      <div class="modal-header border-bottom border-light pb-2">
        <h3 class="modal-title float-start text-primary" translate>{{typeId}}</h3>
        <button type="button" class="btn-close" aria-label="Close" (click)="modalRef.hide()"></button>
      </div>
      <div class="modal-body">
        <!-- tipo di allegato a elemento unico: come nel legacy, avviso prima del caricamento -->
        <div *ngIf="mono" class="alert alert-warning mb-3" role="alert">
          <strong>{{ 'message.alert.document.mono_title' | translate }}</strong>
          {{ 'message.alert.document.mono' | translate }}
          <span *ngIf="existing > 0"><br>{{ 'message.alert.document.mono_existing' | translate:{ value: existing } }}</span>
        </div>
        <edit-metadata [cmisObject]="entity" [typeId]="typeId" [form]="form"></edit-metadata>
        <form *ngIf="upload" [formGroup]="form" class="mt-3">
          <app-control-attachment formControlName="file"></app-control-attachment>
        </form>
        <div *ngIf="submitted && form.invalid" class="alert alert-danger mt-3 mb-0" role="alert">
          {{ 'message.validation.required_fields' | translate }}
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-primary" (click)="save()">{{'save' | translate}}</button>
      </div>
  `
})
export class ManageDocumentComponent extends CommonEditComponent<Document>  implements OnInit{

  constructor(
    public service: DocumentService,
    public modalRef: ModalRef,
    protected router: Router,
    protected route: ActivatedRoute,
    protected translateService: TranslateService,
    private el: ElementRef,
    private objectTypeService: ObjectTypeService,
    private httpClient: HttpClient,
    private configService: ConfigService
  ) {    
    super(service, router, route);
  }

  @Input() parentId;  
  @Input() typeId;  
  @Input() aspect: string[] = [];  
  @Input() upload: boolean = true;
  public event: EventEmitter<Document> = new EventEmitter();
  public submitted = false;
  /** Il tipo ammette un solo documento per domanda (D:jconon_attachment:document_mono). */
  public mono = false;
  /** Documenti dello stesso tipo già presenti nella cartella. */
  public existing = 0;

  public setEntity(entity: Document) {
    this.entity = entity;
  }
  
  public buildUpdateForm(id: number, entity: Document) {
    throw new Error('Method not implemented.');
  }

  public buildCreateForm() {
    this.form = new FormGroup({
      'cmis:objectId': new FormControl(this.entity ? this.entity.objectId : undefined),
      'cmis:objectTypeId': new FormControl(this.typeId),
      'cmis:baseTypeId': new FormControl('cmis:document'),
      'aspect': new FormControl([...this.aspect, ...ObjectType.getAspect(this.typeId)]),
    });
    if (this.upload) {
      this.form.addControl('file', new FormControl("", this.entity ? undefined : Validators.required));
    } else {
      this.form.addControl('cmis:name', new FormControl(Helpers.getUniqueId(8)));
    }
  }

  public buildInstance(): Document {
    return this.service.buildInstance(this.form.value);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.buildCreateForm();
    // solo per i nuovi caricamenti: modificando un documento esistente non si aggiunge un elemento
    if (this.typeId && !this.entity) {
      this.objectTypeService.isMono(this.typeId).subscribe(mono => {
        this.mono = mono;
        if (mono && this.parentId) {
          this.childrenCount();
        }
      });
    }
  }

  private childrenCount(): void {
    this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.get<{ count?: number, items?: any[] }>(apiBase + '/v1/children', {
        params: new HttpParams().set('parentId', this.parentId).set('type', String(this.typeId).replace(/^D:/, ''))
          .set('page', '0').set('offset', '1')
      }))
    ).subscribe(result => this.existing = result?.count ?? (result?.items || []).length, () => this.existing = 0);
  }

  save(): void {
    this.submitted = true;
    // tutti i campi obbligatori (anche quelli dei metadati del tipo) devono risultare compilati
    this.form.markAllAsTouched();
    Object.keys(this.form.controls).forEach(control => this.form.controls[control].markAsDirty({onlySelf: true}));
    if (this.form.invalid) {
      setTimeout(() => {
        const invalid: HTMLElement = this.el.nativeElement.querySelector(
          'input.ng-invalid, select.ng-invalid, textarea.ng-invalid, .ng-invalid:not(form) input, .ng-invalid:not(form) select, .ng-invalid:not(form) textarea');
        if (invalid) {
          invalid.focus();
        }
      });
      return;
    }
    if (!this.form.invalid) {
      if(this.entity) {
        this.service.updateDocument(this.buildInstance(), this.form.value.file, this.form.value).subscribe((result) => {
          this.event.emit(result);
          this.modalRef.hide();
        });
      } else {
        this.service.createDocument(this.parentId, this.buildInstance(), this.form.value.file, this.form.value).subscribe((result) => {
          this.event.emit(result);
          this.modalRef.hide();
        });  
      }
    }
  }
}
