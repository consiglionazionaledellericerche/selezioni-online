import {
  ChangeDetectorRef,
  Component, ElementRef, Input, OnInit, Optional, Self, ViewChild
} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {ValidationHelper} from '../../../common/validation/validation-helper';
import {FormCommonTag} from './form-common-tag';
import * as Editor from '../../../core/libs/ckeditor5/build/ckeditor';
import { ChangeEvent, CKEditorComponent } from '@ckeditor/ckeditor5-angular';

/**
 * IMPORTANTE
 *
 * Dal tab tag input è statp rimossa la callback (blur)="onTouched()" perchè conflittava con la direttiva *ngFor,
 * causando la necessità di cliccare due volte per abilitare il component, in particolare nella CommonList.
 * Il motivo del malfunzionamento non è noto.
 * https://stackoverflow.com/questions/48176172/angular-click-not-working-after-ngfor-backing-array-updated
 */
@Component({
  selector: 'app-control-ckeditor',
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
              [labelactive]="labelactive"
              [showValidation]="showValidation">

        <ckeditor 
          [config]="config" 
          #ckeditor 
          [editor]="Editor" 
          (change)="change($event)"
          class="w-100" 
          [ngClass]="{'is-valid': isValid(), 'is-invalid': isInvalid()}">
        </ckeditor>

        <div *ngIf="controlDir.dirty && controlDir.pending"
             [ngStyle]="{'position': 'absolute', 'top': '5px', 'right': '5px', 'z-index': '100'}">
          <i class="fa fa-circle-o-notch fa-spin fa-fw text-secondary"></i>
        </div>

      </app-form-layout>
    `,
})
export class FormTemplateCKEditorComponent extends FormCommonTag implements ControlValueAccessor, OnInit {

  @Input() type = 'text';

  @Input() inputClass = ''; 

  @Input() nullIfEmpty = false;

  @ViewChild('ckeditor', {static: true}) ckeditor: CKEditorComponent;

  public Editor = Editor;

  config = {  
    toolbar: [ 
      'bold', 
      'italic', 
      'strikethrough', 
      'underline', 
      'indent', 
      '|', 
      'alignment', 
      'numberedList', 
      'bulletedList', 
      'link', 
      '|', 
      'undo', 
      'redo' 
    ] 
  };

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
    this.labelactive = true;
  }

  change({ editor }: ChangeEvent ) {
    const value = editor.getData();
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
    this.ckeditor.writeValue(value);
    if (this.controlDir.control) {
      this.controlDir.control.markAsDirty();
      this.controlDir.control.updateValueAndValidity();
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
    return ValidationHelper.showValid(this.controlDir, this.showValidation);
  }

  onFocus(value: string) {
    this.labelactive = true;
  }

  onFocusOut(value: string) {
    if (value === '') {
      this.labelactive = false;
    } else {
      this.labelactive = true;
    }
  }
}
