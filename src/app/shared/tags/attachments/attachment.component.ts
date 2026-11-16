import {
  ChangeDetectorRef,
  Component, ElementRef, Input, OnInit, Optional, Self, ViewChild
} from '@angular/core';
import { ItUploadDragDropComponent } from 'design-angular-kit';
import { ControlValueAccessor, NgControl
} from '@angular/forms';
import {ValidationHelper} from '../../../common/validation/validation-helper';

@Component({
  standalone: false,
  selector: 'app-control-attachment',
  template:
     `
      <app-form-layout
              [controlDir]="controlDir"
              [inline]="inline"
              [label]="label"
              [ttip]="ttip"
              [noLabel]="noLabel"
              [showValidation]="showValidation">
          <!-- upload con trascinamento (senza icona né testo a lato: l'area di trascinamento basta) -->
          <!-- upload con trascinamento (design-angular-kit): il file viene caricato al salvataggio del form -->
          <it-upload-drag-drop #dragdrop [accept]="accept" (fileStartUpload)="handleFile($event)"
            [class.is-invalid]="isInvalid()"></it-upload-drag-drop>
          <div *ngIf="fileToUpload && !disabled" class="text-center mt-1">
            <button type="button" class="btn btn-link btn-sm" (click)="clear()">
              <svg class="icon icon-primary icon-xs me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-restore"></use></svg>
              {{ 'upload_change' | translate }}
            </button>
          </div>

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

  /** Tipi di file accettati (MIME separati da virgola), come l'attributo accept. */
  @Input() accept = '*';

  @ViewChild('dragdrop', {static: true}) dragdrop: ItUploadDragDropComponent;

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


  }

  /** File scelto (trascinato o selezionato): va nel form e il componente mostra nome e dimensione. */
  handleFile(file: File) {
    this.fileToUpload = file || null;
    this.onChange(this.fileToUpload);
    this.onTouched();
    if (this.controlDir && this.controlDir.control) {
      this.controlDir.control.markAsDirty();
    }
    if (this.fileToUpload) {
      this.dragdrop.progress(100);
      this.dragdrop.success();
    }
    this.ref.markForCheck();
  }

  /** Torna allo stato iniziale per scegliere un altro file. */
  clear() {
    this.fileToUpload = null;
    this.dragdrop.reset();
    this.onChange(null);
    this.ref.markForCheck();
  }

  /*
    ControlValueAccess Impl.
  */

  onChange = (value: File) => {};

  onTouched = () => {};

  writeValue(value: any): void {
    if (!value && this.fileToUpload) {
      this.fileToUpload = null;
      this.dragdrop.reset();
    }
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

