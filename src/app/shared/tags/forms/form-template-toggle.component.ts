import {
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Input, OnInit, Optional, Output, Self, ViewChild
} from '@angular/core';
import {AbstractControlDirective, ControlValueAccessor, NgControl} from '@angular/forms';
import {ValidationHelper} from '../../../common/validation/validation-helper';
import {FormCommonTag} from './form-common-tag';

@Component({
  standalone: false,
  selector: 'app-control-toggle',
  template:
     `
    <div [ngClass]="divToggleClass">
      <label *ngIf="label" [ngClass]="labelClass" (click)="yesNo ? cycleAnswer() : toggle()" [innerHTML]="label | translate"></label>
      <div *ngIf="innerHtml" class="text-dark c-pointer" (click)="yesNo ? cycleAnswer() : toggle()" [innerHtml]="innerHtml"></div>
      <!-- risposta obbligatoria Sì/No (legacy ui.radio): "No" è una risposta valida, l'assenza di risposta no -->
      <div *ngIf="yesNo" class="yes-no ms-3 flex-shrink-0" role="radiogroup" [attr.aria-label]="label | translate">
        <div class="yes-no-options" [class.is-invalid]="isInvalid()">
          <div class="form-check form-check-inline m-0">
            <input type="radio" [id]="radioId + '-si'" [name]="radioId" [checked]="yesNoValue === true"
                   [disabled]="disabled" (change)="answer(true)">
            <label class="form-check-label" [for]="radioId + '-si'">{{ 'yes' | translate }}</label>
          </div>
          <div class="form-check form-check-inline m-0">
            <input type="radio" [id]="radioId + '-no'" [name]="radioId" [checked]="yesNoValue === false"
                   [disabled]="disabled" (change)="answer(false)">
            <label class="form-check-label" [for]="radioId + '-no'">{{ 'no' | translate }}</label>
          </div>
        </div>
        <div *ngIf="isInvalid()" class="text-danger small text-end yes-no-error">
          <span *ngFor="let error of hasErrors()">{{ 'message.validation.' + error | translate }}</span>
        </div>
      </div>
      <div class="toggles me-1" [hidden]="yesNo">
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
                <span *ngFor="let error of hasErrors()" class="pe-2">
                  <small class="align-top">{{ 'message.validation.' + error | translate }}</small>
                </span>
              </div>
          </label>
      </div>
    </div>
    `,
  styles: [`
    .yes-no { align-self: center; }
    .yes-no-options { display: flex; gap: 1.25rem; white-space: nowrap; padding: .15rem .25rem; border-radius: 4px; }
    .yes-no-options .form-check-label { font-weight: 600; color: #17324d; padding-left: 1.9rem; }
    .yes-no-options.is-invalid { box-shadow: 0 0 0 1px #d9364f; }
    .yes-no-error { margin-top: .2rem; }
  `],
})
export class FormTemplateToggleComponent extends FormCommonTag implements ControlValueAccessor, OnInit {

  @Input() type = 'checkbox';

  @Input() divToggleClass = 'it-right-zone w-100 border-bottom-0 p-0 ms-0';

  @Input() labelClass = 'text-dark c-pointer'; 

  @Input() formControlName = ''; 

  @Input() innerHtml;

  @Input() nullIfEmpty = false;

  /**
   * Due pulsanti Sì/No al posto dell'interruttore: per le dichiarazioni obbligatorie in cui anche "No" è una
   * risposta valida (con Validators.required). Senza risposta il valore resta null.
   */
  @Input() yesNo = false;
  public yesNoValue: boolean = null;
  private static seq = 0;
  /** Nome del gruppo di radio, unico anche quando lo stesso campo compare più volte nella pagina. */
  public readonly radioId = 'yesno-' + (++FormTemplateToggleComponent.seq);

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

  /** Clic sul testo, come per l'interruttore: senza risposta o con "No" sceglie "Sì", con "Sì" passa a "No". */
  cycleAnswer() {
    if (this.disabled) {
      return;
    }
    this.answer(this.yesNoValue !== true);
  }

  answer(value: boolean) {
    this.yesNoValue = value;
    this.input.nativeElement.checked = value;
    this.onTouched();
    this.change(value);
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
    this.yesNoValue = value === true || value === 'true' ? true : (value === false || value === 'false' ? false : null);
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
