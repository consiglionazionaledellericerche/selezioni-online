import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, Optional, Self, ViewChild
} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {BsDatepickerConfig, BsLocaleService} from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { itLocale } from 'ngx-bootstrap/locale';
defineLocale('it', itLocale);
import {ValidationHelper} from '../../../common/validation/validation-helper';
import {FormCommonTag} from './form-common-tag';


@Component({
  selector: 'app-control-datepicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
     `
      <app-form-layout [controlDir]="controlDir"
                       [inline]="inline"
                       [noLabel]="noLabel"
                       [label]="label"
                       [prepend]="'calendar'"
                       [showValidation]="showValidation"
                       [appendText]="appendText"
                       [ttipAppend]="ttipAppend"
                       [labelactive]="labelactive"
                       [ttip]="ttip"
                       (click)="onFocusLabel()">
          <input class="form-control"
               type="{{type}}"
               #dp="bsDatepicker"
               #input
               bsDatepicker
               (bsValueChange)="change($event)"
               (focusout)="onFocusOut($event.target.value)"

               (blur)="onTouched()"
               [bsConfig]="bsConfig"
               [(bsValue)]="bsValue"

               [disabled]="disabled"
               [ngClass]="classes()"
          >
      </app-form-layout>
  `
})
export class FormTemplateDatepickerComponent extends FormCommonTag implements ControlValueAccessor, OnInit {

  colorTheme = 'theme-dark-blue';

  bsValue: Date;

  @Input() type = 'text';


  @ViewChild('input', {static: true}) input: ElementRef;

  bsConfig: Partial<BsDatepickerConfig> =
    Object.assign({}, { containerClass: this.colorTheme });

  /**
   * Self permette di poter innestare form controls... ci assicuriamo
   * che sia esattamente quello fornito dal parent.
   * Optional https://stackoverflow.com/questions/47886424/error-in-no-provider-for-ngcontrol-angular-aot/48156981#48156981
   * @param {NgControl} controlDir
   */
  constructor(@Optional() @Self() public controlDir: NgControl, private ref: ChangeDetectorRef,
              private _localeService: BsLocaleService) {
    super();
    this._localeService.use('it');
    controlDir.valueAccessor = this;
  }

  ngOnInit() {
    // const control = this.controlDir.control;
    // const validators = control.validator ? [control.validator, Validators.required] : Validators.required;
    // control.setValidators(validators);
    // control.updateValueAndValidity();
  }

  /*
  ControlValueAccess Impl.
  */

  onChange(value: Date) {}

  onTouched = () => {};

  writeValue(value: Date): void {
    if (value) {
      this.bsValue = value;
      this.labelactive = true;
      this.ref.detectChanges();
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /*
     Utils.
  */

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  isInvalid(): boolean {
    return this.controlDir.control && ValidationHelper.showInvalid(this.controlDir, this.showValidation);
  }

  isValid(): boolean  {
    return this.controlDir.control && ValidationHelper.showValid(this.controlDir, this.showValidation);
  }

  change(value: Date) {
    this.onChange(value);
  }

  onFocusLabel(value: string) {
    this.labelactive = true;
    this.input.nativeElement.focus();
  }

  onFocusOut(value: string) {
    if (value === '') {
      this.labelactive = false;
    } else {
      this.labelactive = true;
    }
  }

  classes() {
    return {
      'is-invalid': this.isInvalid()
    };
  }
}

