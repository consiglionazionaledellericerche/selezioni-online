import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, Type, NgModule, TemplateRef } from '@angular/core';
import { AdMetadata } from './ad-metadata.directive';
import { CmisObject } from '../../../common/model/cmisobject.model';
import { DynamicService} from '../../../dynamic/dynamic.service';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'show-affix',
    template: `
                <ng-template ad-metadata></ng-template>
              `
  })
export class ShowAffixComponent implements OnInit {
    constructor(
          private dynamicService: DynamicService
    ) {}
    @ViewChild(AdMetadata, {static: true}) adMetadata: AdMetadata;
    @Input() cmisObject: CmisObject;
    @Input() type: string;
    @Input() form: FormGroup;

    ngOnInit() {
      this.dynamicService.loadComponent(this.type, this.adMetadata, this.cmisObject, this.form);
    }

}