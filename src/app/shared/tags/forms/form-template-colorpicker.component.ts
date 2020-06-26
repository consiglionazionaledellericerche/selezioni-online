import {
  ChangeDetectorRef,
  Component, ElementRef, Input, OnInit, Optional, Self, ViewChild
} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {ValidationHelper} from '../../../common/validation/validation-helper';
import {FormCommonTag} from './form-common-tag';

@Component({
  selector: 'app-control-colorpicker',
  template:
     `
      <app-form-layout
              [controlDir]="controlDir"
              [inline]="inline"
              [label]="label"
              [prepend]="prepend"
              [prependText]="prependText"
              [ttip]="ttip"
              [append]="append"
              [appendText]="appendText"
              [ttipAppend]="ttipAppend"
              [noLabel]="noLabel"
              [showValidation]="showValidation"
      >

        <input [value]="color"
               [style.background]="color"
               [colorPicker]="color"
               (colorPickerChange)="change($event)"/>

        <div *ngIf="controlDir.dirty && controlDir.pending"
             [ngStyle]="{'position': 'absolute', 'top': '5px', 'right': '-8px', 'z-index': '100'}">
          <i class="fa fa-circle-o-notch fa-spin fa-fw text-secondary"></i>
        </div>

      </app-form-layout>
    `,
})
export class FormTemplateColorPickerComponent extends FormCommonTag implements ControlValueAccessor, OnInit {

  color = '#0009ff';

  /**
   * Self permette di poter innestare form controls... ci assicuriamo
   * che sia esattamente quello fornito dal parent.
   * @param {NgControl} controlDir
   */
  constructor(@Optional() @Self() public controlDir: NgControl,
              private ref: ChangeDetectorRef) {
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

  change(value: string) {
    this.color = value;
    this.onChange(value);
  }

  /*
    ControlValueAccess Impl.
  */

  onChange = (value: string) => {};

  onTouched = () => {};

  writeValue(value: any): void {
    this.color = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /*
  Utils.
   */

  isInvalid(): boolean {
    return ValidationHelper.showInvalid(this.controlDir, this.showValidation);
  }

  isValid(): boolean  {
    return false;
    // return ValidationHelper.showValid(this.controlDir, this.showValidation);
  }

}

