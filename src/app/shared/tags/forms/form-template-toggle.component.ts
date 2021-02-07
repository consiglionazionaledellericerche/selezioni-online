import {
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Input, OnInit, Optional, Output, Self, ViewChild
} from '@angular/core';
import {AbstractControlDirective, ControlValueAccessor, NgControl} from '@angular/forms';
import {ValidationHelper} from '../../../common/validation/validation-helper';
import {FormCommonTag} from './form-common-tag';

@Component({
  selector: 'app-control-toggle',
  template:
     `
    <div class="it-right-zone w-100 border-bottom-0 p-0 ml-0">
      <label class="text-dark c-pointer" (click)="toggle()" translate>{{label}}</label>
      <div class="toggles mr-1">
          <label for="{{formControlName}}" (click)="toggle()">
              <input 
                type="{{ type }}"
                id="{{formControlName}}"
                (change)="change($event.target.checked)"
                #input
                [ngClass]="{'is-valid': isValid(), 'is-invalid': isInvalid()}"
                [disabled]="disabled">
              <span class="lever"></span>
              <div *ngIf=isInvalid() class="text-truncate text-danger mt-n2">
                <span *ngFor="let error of hasErrors()" class="pr-2">
                  <small class="align-top">{{ 'message.validation.' + error | translate }}</small>
                </span>
              </div>
          </label>
      </div>
    </div>
    `,
})
export class FormTemplateToggleComponent extends FormCommonTag implements ControlValueAccessor, OnInit {

  @Input() type = 'checkbox';

  @Input() inputClass = ''; 

  @Input() formControlName = ''; 

  @Input() nullIfEmpty = false;

  @ViewChild('input', {static: true}) input: ElementRef;

  @Output() public onChangeToggle = new EventEmitter();

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
    if (this.input.nativeElement.value || this.disabled) {
      this.labelactive = true;
    }
  }

  toggle() {
    this.input.nativeElement.checked = !this.input.nativeElement.checked;
    this.change(this.input.nativeElement.checked);
  }

  change(value: boolean) {
    this.onChange(value);
    this.onChangeToggle.emit(value);
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
