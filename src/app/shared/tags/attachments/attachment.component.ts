import {
  ChangeDetectorRef,
  Component, ElementRef, Input, OnInit, Optional, Self, ViewChild
} from '@angular/core';
import { ControlValueAccessor, NgControl
} from '@angular/forms';
import {ValidationHelper} from '../../../common/validation/validation-helper';

@Component({
  selector: 'app-control-attachment',
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
              [showValidation]="showValidation">
          <label
            #label 
            for="upload"
            class="border-bottom w-100 mb-0" 
            [ngClass]="{'is-valid border-dark text-dark': !isInvalid(), 'is-invalid border-danger text-danger': isInvalid()}">{{ 'upload' | translate }}</label>
          <input class="form-control d-none"
             type="file"
             id="upload"
             #input
             (change)="handleFileInput($event.target.files)"
             [disabled]="disabled"
             placeholder="{{ placeholder | translate }}">

          <div *ngIf="controlDir.dirty && controlDir.pending"
             [ngStyle]="{'position': 'absolute', 'top': '5px', 'right': '17px', 'z-index': '100'}">
            <i class="fa fa-circle-o-notch fa-spin fa-fw text-secondary"></i>
          </div>

      </app-form-layout>
    `
})
export class AttachmentComponent implements ControlValueAccessor, OnInit {

  @Input() disabled = false;

  @Input() inline = true;

  @Input() label;

  @Input() noLabel = true;

  @Input() prepend = 'paperclip';

  @Input() prependText;

  @Input() ttip;

  @Input() append;

  @Input() appendText;

  @Input() ttipAppend;

  @Input() placeholder = '';

  @Input() showValidation = true;

  @Input() focus = false;

  @ViewChild('input', {static: true}) input: ElementRef;

  @ViewChild('label', {static: true}) labelFile: ElementRef;

  fileToUpload: File = null;

  // no-prepend o prepend (default italic)

  /**
   * Self permette di poter innestare form controls... ci assicuriamo
   * che sia esattamente quello fornito dal parent.
   * @param {NgControl} controlDir
   */
  constructor(@Optional() @Self() public controlDir: NgControl,
              private ref: ChangeDetectorRef) {
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

  onInputClick() {
    this.input.nativeElement.click();
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    this.labelFile.nativeElement.innerText = this.fileToUpload ? this.fileToUpload.name : 'Carica file...';
    this.onChange(this.fileToUpload);
  }

  /*
    ControlValueAccess Impl.
  */

  onChange = (value: File) => {};

  onTouched = () => {};

  writeValue(value: any): void {
    this.input.nativeElement.value = value;
    if (this.controlDir.control) {
      this.controlDir.control.markAsDirty();
      this.controlDir.control.updateValueAndValidity();
      this.ref.detectChanges();
    }
  }

  registerOnChange(fn: (value: File) => void): void {
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

}

