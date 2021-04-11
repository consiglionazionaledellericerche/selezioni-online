import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DocumentService } from './document.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ApiMessageService, MessageType } from '../api-message.service';
import { Document } from '../../common/model/document.model';
import { CommonEditComponent } from '../../common/controller/common-edit.component';

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
        <edit-metadata [cmisObject]="cmisObject" [typeId]="typeId" [form]="form"></edit-metadata>
        <form [formGroup]="form">
          <app-control-attachment formControlName="file" [disabled]="disabled"></app-control-attachment>
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
    private apiMessageService: ApiMessageService,
    protected translateService: TranslateService
  ) {    
    super(service, router, route);
  }

  @Input() parentId;  
  @Input() typeId;  

  public setEntity(entity: Document) {
    this.entity = entity;
  }
  
  public buildUpdateForm(id: number, entity: Document) {
    throw new Error('Method not implemented.');
  }

  public buildCreateForm() {
    this.form = new FormGroup({
      'cmis:objectTypeId': new FormControl(this.typeId),
      'file': new FormControl("", Validators.required)
    });
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
      }
    });
    if (!this.form.invalid) {
      this.service.postDocument(this.parentId, this.buildInstance(), this.form.value.file).subscribe((result) => {
        this.modalRef.hide();
      });
    }
  }
}
