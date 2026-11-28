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
        <div *ngIf="mono && monoWarning" class="alert alert-warning mb-3" role="alert">
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
  /** Avviso sulle tipologie a documento unico (no per i documenti del vincitore, che non sono allegati della domanda). */
  @Input() monoWarning = true;
  /**
   * Anteprima della domanda: stessa modale e stesse validazioni, ma il documento non viene caricato sul backend
   * (la domanda non esiste); al salvataggio si restituisce il documento compilato con il file scelto.
   */
  @Input() preview = false;
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

  /** Link esterno in alternativa al file (es. aspect jconon_lincei_allegati:aspect_link): proprietà "...:link". */
  private linkControls(): string[] {
    return Object.keys(this.form.controls).filter(key => /:link$/.test(key));
  }

  private static readonly URL = /^https?:\/\/[^\s/$.?#][^\s]*\.[^\s]+$/i;

  /**
   * Con un link esterno valorizzato il file non è più obbligatorio (documenti troppo pesanti); il link deve essere
   * un indirizzo web valido (http/https).
   */
  private applyLinkRules(): string {
    const links = this.linkControls();
    if (!links.length) {
      return null;
    }
    links.forEach(key => {
      const control = this.form.controls[key];
      // errore "url": messaggio message.validation.url
      control.setValidators((c) => !c.value || ManageDocumentComponent.URL.test(String(c.value).trim()) ? null : { url: true });
      control.updateValueAndValidity({ emitEvent: false });
    });
    const link = links.map(key => String(this.form.controls[key].value || '').trim()).find(value => !!value);
    const file = this.form.controls['file'];
    if (file && !this.entity) {
      file.setValidators(link ? null : Validators.required);
      file.updateValueAndValidity({ emitEvent: false });
    }
    return link;
  }

  save(): void {
    this.submitted = true;
    const link = this.applyLinkRules();
    // solo il link, senza file: il documento prende come nome il titolo
    if (link && !this.entity && !this.form.value.file && !this.form.contains('cmis:name')) {
      const title = Object.keys(this.form.controls).filter(key => /:titolo$/.test(key))
        .map(key => String(this.form.controls[key].value || '').trim()).find(value => !!value);
      const name = (title || 'Link esterno').replace(/[\\/:*?"<>|]/g, ' ').trim();
      this.form.addControl('cmis:name', new FormControl(name));
    }
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
    if (!this.form.invalid && this.preview) {
      const file: File = this.form.value.file;
      const document = this.buildInstance();
      (document as any).name = (file && file.name) || this.form.value['cmis:name'] || this.typeId;
      (document as any).previewFile = file;
      this.event.emit(document);
      this.modalRef.hide();
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
