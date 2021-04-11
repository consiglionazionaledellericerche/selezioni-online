import { Component, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { AdMetadata } from '../show/ad-metadata.directive';
import { CmisObject } from '../../../common/model/cmisobject.model';
import { DynamicService} from '../../../dynamic/dynamic.service';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'edit-metadata',
    template: `
                <ng-template ad-metadata></ng-template>
              `
  })
export class EditMetdataComponent implements OnChanges {
    constructor(
          private dynamicService: DynamicService
    ) {}

    @ViewChild(AdMetadata, {static: true}) adMetadata: AdMetadata;
    @Input() cmisObject: CmisObject;
    @Input() typeId: string;
    @Input() form: FormGroup;

    public ngOnChanges(changes: SimpleChanges) {
      this.dynamicService.loadEditComponent(this.typeId, this.adMetadata, this.cmisObject, this.form);
    }

}