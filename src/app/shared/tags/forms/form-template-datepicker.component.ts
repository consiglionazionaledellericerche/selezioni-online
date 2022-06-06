import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, Optional, Renderer2, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgControl} from '@angular/forms';
import { BsDatepickerConfig, BsDatepickerDirective, BsLocaleService, DatePickerComponent} from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { itLocale } from 'ngx-bootstrap/locale';
defineLocale('it', itLocale);
import {ValidationHelper} from '../../../common/validation/validation-helper';
import {FormCommonTag} from './form-common-tag';
import { TimepickerComponent } from 'ngx-bootstrap/timepicker';

@Component({
  selector: 'app-control-datepicker',
  template:
     `
     <div class="d-flex justify-content-start">
        <app-form-layout [controlDir]="controlDir"
                        [inline]="inline"
                        [noLabel]="noLabel"
                        [label]="label"
                        [prepend]="'calendar'"
                        [showValidation]="showValidation && controlDir.touched"
                        [appendText]="appendText"
                        [ttipAppend]="ttipAppend"
                        [labelactive]="labelactive"
                        [ttip]="ttip"
                        class="w-100">
                <input class="form-control"
                    type="{{type}}"
                    #dp="bsDatepicker"
                    #input
                    bsDatepicker
                    (bsValueChange)="change($event)"
                    (focus)="onShow($event.target.value)"
                    (focusout)="onFocusOut($event.target.value)"
                    (onShown)="onShow($event)"
                    (blur)="onTouched()"
                    [bsConfig]="bsConfig"
                    [(bsValue)]="bsValue"
                    [disabled]="disabled"
                    [ngClass]="classes()">
        </app-form-layout>
        <timepicker class="ml-n5" [disabled]="!bsValue" [ngClass]="{'d-none': !time}" #timepicker [showSeconds]="true" [showSpinners]="false" [showMeridian]="false"></timepicker>
      </div>
    `
})
export class FormTemplateDatepickerComponent extends FormCommonTag implements ControlValueAccessor, OnInit {

  colorTheme = 'theme-dark-blue';

  bsValue: Date;

  @Input() type = 'text';

  @Input() time: boolean = false;

  @ViewChild('input', {static: true}) input: ElementRef;

  @ViewChild('timepicker', {static: true}) timepicker: TimepickerComponent;

  @ViewChild('dp', {static: true}) datepicker: BsDatepickerDirective;

  bsConfig: Partial<BsDatepickerConfig> = Object.assign({}, { 
    containerClass: this.colorTheme, 
    isAnimated: true, 
    initCurrentTime: false,
    adaptivePosition: true
  });

  /**
   * Self permette di poter innestare form controls... ci assicuriamo
   * che sia esattamente quello fornito dal parent.
   * Optional https://stackoverflow.com/questions/47886424/error-in-no-provider-for-ngcontrol-angular-aot/48156981#48156981
   * @param {NgControl} controlDir
   */
  constructor(@Optional() @Self() public controlDir: NgControl, 
              private ref: ChangeDetectorRef,
              private _localeService: BsLocaleService) {
    super();
    this._localeService.use('it');
    controlDir.valueAccessor = this;
  }

  ngOnInit() {
    const control = this.controlDir.control;

    // se volessi aggiungere dei validatori di default al tag, nell'esempio required.
    // const validators = control.validator ? [control.validator, Validators.required] : Validators.required;
    const validators = control.validator;
    control.setValidators(validators);
    control.updateValueAndValidity();
    if (this.focus) {
      this.input.nativeElement.focus();
    }
    if (this.input.nativeElement.value || this.disabled) {
      this.labelactive = true;
    }
    if (this.timepicker) {
      this.timepicker.registerOnChange((time: Date) => {
        if (time && this.bsValue) {
          this.bsValue.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
        }
      });
    }
  }

  /*
  ControlValueAccess Impl.
  */
 
  onChange(value: Date|string) {}

  onTouched = () => {};

  writeValue(value: Date): void {
    if (value) {
      if (this.time && this.timepicker) {
        this.timepicker.writeValue(value);
      }
      this.datepicker._bsValue = value;

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
    return this.controlDir.control && ValidationHelper.showInvalid(this.controlDir, this.showValidation && this.controlDir.touched);
  }

  isValid(): boolean  {
    return this.controlDir.control && ValidationHelper.showValid(this.controlDir, this.showValidation && this.controlDir.touched);
  }

  change(value: Date | string) {
    this.labelactive = value !== undefined;
    if (this.time && this.timepicker) {
      this.timepicker.writeValue(value);
    }
    if (value !== undefined) {
      this.onChange(value == 'Invalid Date' ? null : value);
    } else {
      if (this.type == 'search') {
        this.onChange(value);
      }
    }
  }
  
  onShow(event: any) {
    this.labelactive = true;  
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
      'is-invalid': this.isInvalid(),
      'is-valid': this.isValid()
    };
  }
}
