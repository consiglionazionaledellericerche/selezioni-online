import {
  ChangeDetectorRef,
  Component, ElementRef, Input, OnInit, Optional, Self, ViewChild
} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {ValidationHelper} from '../../../common/validation/validation-helper';
import {FormCommonTag} from './form-common-tag';

/**
 * IMPORTANTE
 *
 * Dal tab tag input è statp rimossa la callback (blur)="onTouched()" perchè conflittava con la direttiva *ngFor,
 * causando la necessità di cliccare due volte per abilitare il component, in particolare nella CommonList.
 * Il motivo del malfunzionamento non è noto.
 * https://stackoverflow.com/questions/48176172/angular-click-not-working-after-ngfor-backing-array-updated
 */
@Component({
  selector: 'app-control-text',
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

        <input class="form-control"
             type="{{ type }}"
             #input
             (input)="change($event.target.value)"
             [disabled]="disabled"
             placeholder="{{ placeholder | translate }}"
             [ngClass]="{'is-valid': isValid(), 'is-invalid': isInvalid()}"
        >
        <div *ngIf="controlDir.dirty && controlDir.pending"
             [ngStyle]="{'position': 'absolute', 'top': '5px', 'right': '-8px', 'z-index': '100'}">
          <i class="fa fa-circle-o-notch fa-spin fa-fw text-secondary"></i>
        </div>

      </app-form-layout>
    `,
})
export class FormTemplateTextComponent extends FormCommonTag implements ControlValueAccessor, OnInit {

  @Input() type = 'text';

  @Input() nullIfEmpty = false;

  @ViewChild('input', {static: true}) input: ElementRef;

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

    if (this.focus) {
      this.input.nativeElement.focus();
    }

  }

  change(value: string) {
    if (this.nullIfEmpty && value === '') {
      this.onChange(null);
      return;
    }
    this.onChange(value);
  }

  /*
    ControlValueAccess Impl.
  */

  onChange = (value: string) => {};

  onTouched = () => {};

  writeValue(value: any): void {
    this.input.nativeElement.value = value;
    if (this.controlDir.control) {
      this.controlDir.control.markAsDirty();
      this.controlDir.control.updateValueAndValidity();
      this.ref.detectChanges();
    }
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

