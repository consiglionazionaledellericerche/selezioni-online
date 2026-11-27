import {Component, ElementRef, Input, ViewChild, inject} from '@angular/core';
import {AbstractControlDirective, NgControl} from '@angular/forms';
import {ValidationHelper} from '../../../common/validation/validation-helper';
import {Helpers} from '../../../common/helpers/helpers';

@Component({
  standalone: false,
  styles: [`
    /* etichette personalizzate del bando con HTML (titoli, note, simbolo "?" con suggerimento) */
    :host ::ng-deep label.textarea-label { position: static !important; transform: none !important; display: block; width: auto;
      font-size: 1rem; font-weight: 600; color: inherit; white-space: normal; margin-bottom: .5rem; padding: 0; pointer-events: auto; }
    :host ::ng-deep .rich-label :is(h1, h2, h3, h4, h5, h6), :host ::ng-deep label :is(h1, h2, h3, h4, h5, h6) {
      display: inline; font-size: 1.05rem; font-weight: 700; margin: 0 .25rem 0 0; color: inherit; }
    :host ::ng-deep .rich-label sub, :host ::ng-deep label sub { display: block; vertical-align: baseline; font-size: .85rem;
      font-weight: 400; color: #5d7083; margin-top: .15rem; }
    :host ::ng-deep .rich-label i[title], :host ::ng-deep label i[title] { display: inline-flex; align-items: center;
      justify-content: center; width: 1.15rem; height: 1.15rem; margin-right: .35rem; border-radius: 50%;
      background: var(--app-primary, #0066cc); color: #fff; font-style: normal; font-size: .75rem; font-weight: 700;
      cursor: help; vertical-align: middle; }
    :host ::ng-deep .rich-label i[title]:empty::before, :host ::ng-deep label i[title]:empty::before { content: "?"; }
`],
  selector: 'app-form-layout',
  template:
     `
    <div class="mb-1 my-form-layout-row" [ngClass]="{ 'row': !inline}" >
      <div class="input-group" [ngClass]="contentClasses()">
        <div *ngIf="prepend || prependText" class="input-group-text" [ngClass]="{ 'text-danger border-danger': isInvalid()}" [itTooltip]="ttip | translate">
          <i *ngIf="prepend" class="fa fa-{{ prepend }}" aria-hidden="true"></i>
          {{ prependText }}
        </div>
        <label *ngIf="!noLabel" #label (click)="focusControl()" [ngClass]="labelClasses()" tooltipPlacement="right" [itTooltip]="plain(getLabelTruncated() | translate)" [innerHTML]="getLabel() | translate"></label>
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

  /** Testo senza HTML per il suggerimento. */
  plain(value: string): string {
    return Helpers.stripHtml(value);
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

