import {Component, Input, OnInit, Optional, Self} from '@angular/core';
import {
  ControlValueAccessor, NgControl
} from '@angular/forms';
import {CheckboxModel} from '../../../common/model/checkbox.model';
import {FormCommonTag} from './form-common-tag';

@Component({
  selector: 'app-control-checkbox',
  template:
     `
      <app-form-layout
              [controlDir]="controlDir"
              [inline]="inline"
              [label]="label"
              [prepend]="prepend"
              [ttip]="ttip"
              [append]="append"
              [ttipAppend]="ttipAppend"
              [noLabel]="noLabel"
              [showValidation]="showValidation"
              [checkbox]="true"
      >

        <div class="btn-group btn-block" btnRadioGroup>
          <ng-container *ngFor="let option of options">
            <label class="btn btn-primary" 
              btnRadio="{{ option.value }}" 
              tabindex="0" role="button">{{ option.label | translate }}</label>
          </ng-container>
        </div>

        <div *ngIf="controlDir.dirty && controlDir.pending"
             [ngStyle]="{'position': 'absolute', 'top': '5px', 'right': '17px', 'z-index': '100'}">
          <i class="fa fa-circle-o-notch fa-spin fa-fw text-secondary"></i>
        </div>

      </app-form-layout>
    `,
})
export class FormTemplateCheckboxComponent extends FormCommonTag implements ControlValueAccessor, OnInit {

  @Input() options: CheckboxModel[];

  @Input() booleanBoxDisabled = false;

  booleanBox = false;

  /**
   * Self permette di poter innestare form controls... ci assicuriamo
   * che sia esattamente quello fornito dal parent.
   * @param {NgControl} controlDir
   */
  constructor(@Optional() @Self() public controlDir: NgControl) {
    super();
    controlDir.valueAccessor = this;
  }

  ngOnInit() {
    const control = this.controlDir.control;

    // se volessi aggiungere dei validatori di default al tag, nell'esempio required.
    // const validators = control.validator ? [control.validator, Validators.required] : Validators.required;
    const validators = control.validator;
    control.setValidators(validators);
    control.updateValueAndValidity();
  }

  change(checked: boolean, option: CheckboxModel) {
    // console.log(checked);
    // console.log(option);
    option.selected = checked;

    if (this.booleanBox) {
      // nel caso di boolean box ritorno il valore.
      // console.log(option.selected);
      this.onChange(option.selected);
      return;
    }

    // altrimenti ritorno la lista di valori
    // console.log(this.options);
    this.onChange(this.options);
  }

  /*
    ControlValueAccess Impl.
  */

  onChange = (value: any) => {};

  onTouched = () => {};

  writeValue(value: any): void {
    if (typeof(value) === 'boolean') {
      // trasformo il valore boolean nella checkbox
      this.booleanBox = true;
      this.options = CheckboxModel.booleanBox(value, this.booleanBoxDisabled);
      return;
    }
    console.log(value);
    if (value) {
      this.options = value;
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public styles() {
    return {
      'position': 'absolute',
      'top': '-5px'
    };
  }
}

