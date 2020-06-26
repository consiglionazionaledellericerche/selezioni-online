import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-form-validation-error-layout',
  template:
     `
    <div *ngIf="form">
      <alert *ngIf="form.errors" type="danger">
        <strong class="d-inline-block mb-1">Occorre correggere i seguenti errori</strong>
        <span class="d-block" *ngFor="let error of form.errors">
        {{ error }}
      </span>
      </alert>
    </div>

    `,
})
export class FormValidationErrorLayoutComponent {

  @Input() form;

}

