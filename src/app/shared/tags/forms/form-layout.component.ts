import {Component, Input} from '@angular/core';
import {AbstractControlDirective, NgControl} from '@angular/forms';
import {ValidationHelper} from '../../../common/validation/validation-helper';
import {Helpers} from '../../../common/helpers/helpers';

@Component({
  selector: 'app-form-layout',
  template:
     `
    <div class="mb-1 my-form-layout-row" [ngClass]="{ 'row': !inline}" >

      <label *ngIf="!noLabel" for="descrizione" [ngClass]="labelClasses()">
        {{ getLabel() | translate }}
      </label>

      <!--<div [ngClass]="contentClasses()" [ngStyle]="contentStyles()">-->
        <div class="input-group align-items-center" [ngClass]="contentClasses()">

          <div *ngIf="prepend || prependText" class="input-group-prepend" tooltip="{{ ttip | translate }}">
            <div class="input-group-text">
              <i class="fa fa-{{ prepend }}" aria-hidden="true"></i>
              {{ prependText }}
            </div>
          </div>

          <ng-content></ng-content>

          <div *ngIf="append || appendText" class="input-group-append" tooltip="{{ ttipAppend | translate }}" placement="left">
			<div class="input-group-text">
              <i *ngIf="append" class="fa fa-{{ append }}" aria-hidden="true"></i>
              {{ appendText }}
            </div>
		  </div>

        </div>
      <!--</div>-->
    </div>
    <div *ngIf="showValidation">
      <div *ngIf=isInvalid()>
          <div *ngFor="let error of hasErrors()" class="text-danger"><small class="align-top">{{ 'message.validation.' + error | translate }}</small></div>
      </div>
      <div *ngIf=!isInvalid()>
        &nbsp; </div>
    </div>
    `,
  styles: [
     '.input-group-append { height: 100%; }',
     '.input-group-prepend { height: 100%;  }'
    ]
})
export class FormLayoutComponent {

  @Input() inline = false;

  @Input() label;

  @Input() noLabel = false;

  @Input() prepend = null;

  @Input() append = null;

  @Input() appendText = null;

  @Input() prependText = null;

  @Input() controlDir: NgControl = null;

  @Input() showValidation = true;

  @Input() ttip;

  @Input() ttipAppend;

  @Input() checkbox = false;

  /*
    Utils.
  */
  isInvalid(): boolean {
    return this.controlDir && this.controlDir.control && ValidationHelper.showInvalid(this.controlDir, this.showValidation);
  }

  isValid(): boolean  {
    // return false;
    return this.controlDir && this.controlDir.control && ValidationHelper.showValid(this.controlDir, this.showValidation);
  }

  hasErrors() {
    if (!this.controlDir || !this.controlDir.control) {
      return;
    }
    return ValidationHelper.getValidationCodes((<AbstractControlDirective>this.controlDir).control);
  }

  labelClasses() {
    return {
      'col-sm-2': !this.inline,
      'col-form-label': !this.inline,
      'text-sm-right': true,
      'text-xs-left': true,
      'pt-0' : this.checkbox
    };
  }

  contentClasses() {
    return {
      'col-sm-10': !this.inline
    };
  }

  getLabel() {
    if (this.label) {
      return this.label;
    }
    if (this.controlDir && this.controlDir.control) {
      return Helpers.getLabelFromControl(this.label, this.controlDir);
    }
  }
}

