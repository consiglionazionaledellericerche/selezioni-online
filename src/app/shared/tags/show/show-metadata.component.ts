import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, Type, NgModule, TemplateRef } from '@angular/core';
import { AdMetadata } from './ad-metadata.directive';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CmisObject } from '../../../common/model/cmisobject.model';
import { DynamicService} from '../../../dynamic/dynamic.service';

@Component({
    selector: 'show-metadata',
    template: `
              <div class="modal-header">
                  <h2 class="modal-title pull-left text-primary"><i class="fa fa-info-circle"></i> {{'properties' | translate}}</h2>
                  <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <ng-template ad-metadata></ng-template>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-primary" (click)="modalRef.hide()">{{'close' | translate}}</button>
              </div>
              `
  })
export class ShowMetadataComponent implements OnInit {
    constructor(
          public modalRef: BsModalRef,
          private dynamicService: DynamicService
    ) {}
    @ViewChild(AdMetadata, {static: true}) adMetadata: AdMetadata;
    @Input() cmisObject: CmisObject;

    ngOnInit() {
      this.dynamicService.loadComponent(this.cmisObject.getObjectTypeId(), this.adMetadata, this.cmisObject, undefined);
    }

}