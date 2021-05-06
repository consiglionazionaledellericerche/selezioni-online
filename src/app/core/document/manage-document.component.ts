import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DocumentService } from './document.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Document } from '../../common/model/document.model';
import { CommonEditComponent } from '../../common/controller/common-edit.component';
import { Helpers } from '../../common/helpers/helpers';
import { ObjectType } from '../../common/model/object-type.model';

@Component({
  selector: 'manage-document',
  template: `
      <div class="modal-header border-bottom border-light pb-2">
        <h3 class="modal-title pull-left text-primary" translate>{{typeId}}</h3>
        <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <edit-metadata [cmisObject]="entity" [typeId]="typeId" [form]="form"></edit-metadata>
        <form *ngIf="upload" [formGroup]="form" class="mt-3">
          <app-control-attachment formControlName="file"></app-control-attachment>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-primary" (click)="save()">{{'save' | translate}}</button>
      </div>
  `
})
export class ManageDocumentComponent extends CommonEditComponent<Document>  implements OnInit{

  constructor(
    public service: DocumentService,
    public modalRef: BsModalRef,
    protected router: Router,
    protected route: ActivatedRoute,
    protected translateService: TranslateService,
    private el: ElementRef
  ) {    
    super(service, router, route);
  }

  @Input() parentId;  
  @Input() typeId;  
  @Input() aspect: string[] = [];  
  @Input() upload: boolean = true;
  public event: EventEmitter<Document> = new EventEmitter();

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
  }

  save(): void {
    Object.keys(this.form.controls).forEach(control => {
      if (this.form.controls[control].status === 'INVALID') {
        this.form.controls[control].markAsDirty({onlySelf: true});
        this.form.controls[control].markAsTouched({onlySelf: true});
        const invalidControl = this.el.nativeElement
          .querySelector('[formcontrolname="' + control + '"]')
          .querySelector('input');
        if (invalidControl) {
          invalidControl.focus();
        }
      }
    });
    if (!this.form.invalid) {
      if(this.entity) {
        this.service.updateDocument(this.buildInstance(), this.form.value.file).subscribe((result) => {
          this.event.emit(result);
          this.modalRef.hide();
        });
      } else {
        this.service.createDocument(this.parentId, this.buildInstance(), this.form.value.file).subscribe((result) => {
          this.event.emit(result);
          this.modalRef.hide();
        });  
      }
    }
  }
}
