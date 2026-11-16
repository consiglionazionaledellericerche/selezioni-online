import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, Optional, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { FormCommonTag } from './form-common-tag';
import { ValidationHelper } from '../../../common/validation/validation-helper';

@Component({
  standalone: false,
  selector: 'app-control-datepicker',
  template:
     `
     <app-form-layout [controlDir]="controlDir"
                      [inline]="inline"
                      [noLabel]="noLabel"
                      [label]="label"
                      [showValidation]="showValidation && controlDir.touched"
                      [appendText]="appendText"
                      [ttipAppend]="ttipAppend"
                      [labelactive]="true"
                      [ttip]="ttip"
                      class="w-100">
        <input class="form-control"
               #input
               [type]="time ? 'datetime-local' : 'date'"
               [attr.step]="time ? 1 : null"
               [value]="inputValue"
               (change)="change($event.target.value)"
               (blur)="onTouched()"
               [disabled]="disabled"
               [ngClass]="classes()">
     </app-form-layout>
    `
})
/**
 * Data (o data e ora) con l'input nativo stilizzato da Bootstrap Italia, al posto del datepicker di ngx-bootstrap.
 * Verso il form il valore resta un oggetto Date (null se vuoto), come prima.
 */
export class FormTemplateDatepickerComponent extends FormCommonTag implements ControlValueAccessor, OnInit {
  @Input() type = 'text';
  @Input() time: boolean = false;
  @ViewChild('input', {static: true}) input: ElementRef;
  public inputValue = '';

  constructor(@Optional() @Self() public controlDir: NgControl,
              private ref: ChangeDetectorRef) {
    super();
    controlDir.valueAccessor = this;
  }

  ngOnInit() {
    const control = this.controlDir.control;
    control.setValidators(control.validator);
    control.updateValueAndValidity();
    if (this.focus) {
      this.input.nativeElement.focus();
    }
  }

  private static pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  /** Date -> 'yyyy-MM-dd' oppure 'yyyy-MM-ddTHH:mm:ss' nell'ora locale. */
  private format(value: Date): string {
    const p = FormTemplateDatepickerComponent.pad;
    const date = `${value.getFullYear()}-${p(value.getMonth() + 1)}-${p(value.getDate())}`;
    return this.time ? `${date}T${p(value.getHours())}:${p(value.getMinutes())}:${p(value.getSeconds())}` : date;
  }

  onChange(value: Date|string) {}
  onTouched = () => {};

  writeValue(value: Date | string): void {
    const date = value ? new Date(value as any) : null;
    this.inputValue = date && !isNaN(date.getTime()) ? this.format(date) : '';
    this.ref.markForCheck();
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  isInvalid(): boolean {
    return this.controlDir.control && ValidationHelper.showInvalid(this.controlDir, this.showValidation && this.controlDir.touched);
  }

  isValid(): boolean  {
    return this.controlDir.control && ValidationHelper.showValid(this.controlDir, this.showValidation && this.controlDir.touched);
  }

  change(value: string) {
    this.inputValue = value;
    if (!value) {
      this.onChange(null);
      return;
    }
    // 'yyyy-MM-dd' va interpretata come data locale (new Date('yyyy-MM-dd') la leggerebbe in UTC)
    const date = this.time ? new Date(value) : new Date(value + 'T00:00:00');
    this.onChange(isNaN(date.getTime()) ? null : date);
  }

  classes() {
    return {
      'is-invalid': this.isInvalid(),
      'is-valid': this.isValid()
    };
  }
}
