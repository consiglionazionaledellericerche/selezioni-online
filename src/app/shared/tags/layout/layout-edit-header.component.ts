import {Component, Input} from '@angular/core';
import {CmisObject} from '../../../common/model/cmisobject.model';

@Component({
  selector: 'app-edit-header-layout',
  template: `

    <div *ngIf="!entity">

      <app-layout-title [title]="translationPrefix + '.create'">
      </app-layout-title>

      <alert type="info" *ngIf="showAlert"> {{ translationPrefix + '.create.info' | translate }}
        <strong>{{ translationPrefix | translate }}</strong>.
      </alert>

    </div>

    <div *ngIf="entity">

      <app-layout-title [title]="translationPrefix + '.edit'">
      </app-layout-title>

      <alert type="info" *ngIf="showAlert"> {{ translationPrefix + '.edit.info' | translate }}
        <strong>{{ entity.getLabel() }}</strong>.
      </alert>

    </div>

    <app-form-validation-error-layout [form]="form"></app-form-validation-error-layout>

  `
})
export class EditHeaderLayoutComponent {

  @Input() entity: CmisObject;

  @Input() form;

  @Input() translationPrefix;

  @Input() showAlert = true;


}

