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
  standalone: false,
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

        <!-- segnaposto [[proprietà]] sostituiti dal backend con i dati della domanda e del bando -->
        <div *ngIf="placeholders?.length" class="placeholder-bar d-flex flex-wrap align-items-center gap-2 w-100 mb-2">
          <select class="form-select form-select-sm placeholder-select" [(ngModel)]="placeholder" [ngModelOptions]="{standalone: true}"
                  [attr.aria-label]="'segnaposto.choose' | translate">
            <option [ngValue]="null">{{ 'segnaposto.choose' | translate }}</option>
            <optgroup *ngFor="let group of placeholderGroups()" [label]="group.label">
              <option *ngFor="let item of group.items" [ngValue]="item.key">{{ item.label }}</option>
            </optgroup>
          </select>
          <button type="button" class="btn btn-outline-primary btn-xs" [disabled]="!placeholder" (click)="insertPlaceholder()">
            <svg class="icon icon-sm icon-primary me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-plus"></use></svg>{{ 'segnaposto.insert' | translate }}
          </button>
          <small class="text-secondary">{{ 'segnaposto.info' | translate }}</small>
        </div>

        <quill-editor
          class="w-100 d-block"
          (onEditorCreated)="editor = $event"
          format="html"
          theme="snow"
          [modules]="modules"
          [ngModel]="value"
          [ngModelOptions]="{standalone: true}"
          (ngModelChange)="change($event)"
          (onBlur)="onTouched()"
          [ngClass]="{'is-valid': isValid(), 'is-invalid': isInvalid()}">
        </quill-editor>

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

  /**
   * Segnaposto inseribili nel testo come [[chiave]] (es. campi della domanda e del bando): il backend li
   * sostituisce con i valori al momento della generazione (comunicazioni, convocazioni, esclusioni).
   */
  @Input() placeholders: { key: string, label: string, group?: string }[] = [];
  public placeholder: string = null;
  public editor: any;
  private groupsFor: any[];
  private groupsCache: { label: string, items: { key: string, label: string }[] }[] = [];

  placeholderGroups(): { label: string, items: { key: string, label: string }[] }[] {
    if (this.groupsFor !== this.placeholders) {
      this.groupsFor = this.placeholders;
      const groups = new Map<string, { key: string, label: string }[]>();
      (this.placeholders || []).forEach(item => {
        const group = item.group || '';
        groups.set(group, (groups.get(group) || []).concat({ key: item.key, label: item.label || item.key }));
      });
      this.groupsCache = Array.from(groups.entries())
        .map(([label, items]) => ({ label, items: items.sort((a, b) => a.label.localeCompare(b.label)) }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    return this.groupsCache;
  }

  /** Inserisce [[chiave]] nella posizione del cursore (o in fondo al testo). */
  insertPlaceholder(): void {
    if (!this.placeholder || !this.editor) {
      return;
    }
    const text = '[[' + this.placeholder + ']]';
    const selection = this.editor.getSelection(true);
    const index = selection ? selection.index : Math.max(0, this.editor.getLength() - 1);
    if (selection && selection.length) {
      this.editor.deleteText(selection.index, selection.length, 'user');
    }
    this.editor.insertText(index, text, 'user');
    this.editor.setSelection(index + text.length, 0, 'user');
    this.placeholder = null;
  }

  /** Valore HTML corrente dell'editor (ngx-quill, come in GesFor). */
  public value: string = null;
  public modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ align: [] }, { indent: '-1' }, { indent: '+1' }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean']
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

  change(value: string) {
    this.value = value;
    if (this.nullIfEmpty && (value === '' || value === null)) {
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
    this.value = value;
    this.ref.markForCheck();
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
