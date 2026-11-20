import {Component, ElementRef, Input, ViewChild, inject} from '@angular/core';
import {AbstractControlDirective, NgControl} from '@angular/forms';
import {ValidationHelper} from '../../../common/validation/validation-helper';
import {Helpers} from '../../../common/helpers/helpers';

@Component({
  standalone: false,
  selector: 'app-form-layout',
  template:
     `
    <div class="mb-1 my-form-layout-row" [ngClass]="{ 'row': !inline}" >
      <div class="input-group" [ngClass]="contentClasses()">
        <div *ngIf="prepend || prependText" class="input-group-text" [ngClass]="{ 'text-danger border-danger': isInvalid()}" [itTooltip]="ttip | translate">
          <i *ngIf="prepend" class="fa fa-{{ prepend }}" aria-hidden="true"></i>
          {{ prependText }}
        </div>
        <label *ngIf="!noLabel" #label (click)="focusControl()" [ngClass]="labelClasses()" tooltipPlacement="right" [itTooltip]="getLabelTruncated() | translate">{{getLabel() | translate}}</label>
        <ng-content></ng-content>
        <div *ngIf="append || appendText" class="input-group-append" [itTooltip]="ttipAppend | translate" tooltipPlacement="left">
          <div class="input-group-text">
            <i *ngIf="append" class="fa fa-{{ append }}" aria-hidden="true"></i>
            {{ appendText }}
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="showValidation">
      <div *ngIf=isInvalid() class="text-truncate text-danger">
          <span *ngFor="let error of hasErrors()" class="pe-1">
            <small class="align-top">{{ 'message.validation.' + error | translate }}</small>
          </span>
      </div>
    </div>
    `
})
export class FormLayoutComponent {

  @Input() inline = false;

  @Input() label;

  @Input() noLabel = false;

  @Input() prepend = null;

  @Input() append = null;

  @Input() appendText = null;

  @Input() prependText = null;

  @Input() controlDir: NgControl = null;

  @Input() showValidation = true;

  @Input() ttip;

  @Input() ttipAppend;

  @Input() checkbox = false;

  @Input() focus = false;

  @Input() labelactive;

  @ViewChild('label') labelElement: ElementRef;
  private readonly hostElement = inject(ElementRef);

  /**
   * L'etichetta di Bootstrap Italia sta sopra il campo finché è vuoto: senza "for" il clic su di lei non portava
   * il cursore nel campo (bisognava cliccare oltre il testo). Ora lo porta al primo campo contenuto.
   */
  focusControl(): void {
    const host: HTMLElement = this.hostElement?.nativeElement;
    const control: HTMLElement = host && host.querySelector('input:not([type=hidden]), textarea, select');
    if (control && !(control as HTMLInputElement).disabled) {
      control.focus();
    }
  }

  /*
    Utils.
  */
  isInvalid(): boolean {
    return this.controlDir && this.controlDir.control && ValidationHelper.showInvalid(this.controlDir, this.showValidation);
  }

  isValid(): boolean  {
    // return false;
    return this.controlDir && this.controlDir.control && ValidationHelper.showValid(this.controlDir, this.showValidation);
  }

  hasErrors() {
    if (!this.controlDir || !this.controlDir.control) {
      return;
    }
    return ValidationHelper.getValidationCodes((<AbstractControlDirective>this.controlDir).control);
  }

  isLabelTruncated(): boolean {
    if (this.labelElement) {
      const e = this.labelElement.nativeElement;
      return e.scrollWidth > e.clientWidth;  
    }
    return false;
  }

  labelClasses() {
    return {
      'col-sm-2': !this.inline,
      'col-form-label': !this.inline,
      'text-sm-end': true,
      'text-xs-left': true,
      'pt-0' : this.checkbox,
      'active' : this.labelactive,
      'text-danger': this.isInvalid()
    };
  }

  contentClasses() {
    return {
      'col-sm-10': !this.inline,
      'is-invalid': this.isInvalid()
    };
  }

  getLabel() {
    if (this.label) {
      return this.label;
    }
    if (this.controlDir && this.controlDir.control) {
      return Helpers.getLabelFromControl(this.label, this.controlDir);
    }
  }

  getLabelTruncated() {
    if (this.isLabelTruncated()) {
      return this.getLabel();
    }
    return '';
  }

  onFocus() {
    this.labelactive = true;
  }

}

