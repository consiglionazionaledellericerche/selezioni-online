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
              [showValidation]="showValidation"
      >
          <input class="form-control"
             type="file"
             #input
             id="file"
             class="upload"
             (change)="handleFileInput($event.target.files)"
             [disabled]="disabled"
             placeholder="{{ placeholder | translate }}"
             [ngClass]="{'is-valid': isValid(), 'is-invalid': isInvalid()}"
          >
          <label for="file">
            <svg class="icon icon-sm" aria-hidden="true"><use xlink:href="/assets/vendor/sprite.svg#it-upload"></use></svg>
            <span>Upload</span>
          </label>
          <div *ngIf="fileToUpload" class="pl-2 d-flex text-truncate">
            <span class="h4 text-primary text-truncate"><svg class="icon icon-primary h4" aria-hidden="true"><use xlink:href="/assets/vendor/sprite.svg#it-file"></use></svg> {{fileToUpload.name}}</span>
            <span class="h6 pl-2">{{fileSize}}</span>
          </div>
      </app-form-layout>
    `
})
export class AttachmentComponent implements ControlValueAccessor, OnInit {

  @Input() disabled = false;

  @Input() inline = false;

  @Input() label;

  @Input() noLabel = true;

  @Input() prepend;

  @Input() prependText;

  @Input() ttip;

  @Input() append;

  @Input() appendText;

  @Input() ttipAppend;

  @Input() placeholder = '';

  @Input() showValidation = true;

  @Input() focus = false;

  @ViewChild('input', {static: true}) input: ElementRef;

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
    this.onChange(this.fileToUpload);
  }

  get fileSize(): string {
    var suffix = ["bytes", "Kb", "Mb", "Gb", "Tb", "Pb"], tier = 0;
    var bytes = this.fileToUpload.size;
    while (bytes >= 1024) {
      bytes = bytes / 1024;
      tier++;
    }
    return Math.round(bytes * 10) / 10 + " " + suffix[tier];
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
    return false;
    // return ValidationHelper.showValid(this.controlDir, this.showValidation);
  }

}

