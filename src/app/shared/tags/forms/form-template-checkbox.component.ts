import {
  ChangeDetectorRef,
  Component, ElementRef, Input, OnInit, Optional, Self, ViewChild
} from '@angular/core';
import {AbstractControlDirective, ControlValueAccessor, NgControl} from '@angular/forms';
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
  selector: 'app-control-checkbox',
  template:
     `
        <input class="form-control {{inputClass}}"
             type="{{ type }}"
             #input
             id="checkbox"
             (input)="change($event.target.checked)"
             [disabled]="disabled">

        <label for="checkbox" class="label-checkbox pl-5" [ngClass]="{'is-valid': isValid(), 'is-invalid': isInvalid()}">
          {{label| translate}}
        </label>
        <div *ngIf="showValidation">
          <div *ngIf=isInvalid() class="text-truncate text-danger">
              <span *ngFor="let error of hasErrors()" class="pr-1">
                <small class="align-top">{{ 'message.validation.' + error | translate }}</small>
              </span>
          </div>
        </div>
    `,
})
export class FormTemplateCheckboxComponent extends FormCommonTag implements ControlValueAccessor, OnInit {

  @Input() type = 'checkbox';

  @Input() inputClass = ''; 

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
      setTimeout(() => {
        this.input.nativeElement.focus();
        this.input.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    }
  }

  change(value: boolean) {
    this.onChange(value);
  }

  /*
    ControlValueAccess Impl.
  */

  onChange = (value: boolean) => {};

  onTouched = () => {};

  writeValue(value: any): void {

    this.input.nativeElement.checked = value;
    if (this.controlDir.control) {
      this.controlDir.control.markAsDirty();
      this.controlDir.control.updateValueAndValidity();
      //this.ref.detectChanges();
    }
  }

  registerOnChange(fn: (value: boolean) => void): void {
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
    return ValidationHelper.showValid(this.controlDir, this.showValidation);
  }

  hasErrors() {
    if (!this.controlDir || !this.controlDir.control) {
      return;
    }
    return ValidationHelper.getValidationCodes((<AbstractControlDirective>this.controlDir).control);
  }

}
