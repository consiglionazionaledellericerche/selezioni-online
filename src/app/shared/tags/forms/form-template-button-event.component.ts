import {
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Input, OnInit, Optional, Output, Self, ViewChild
} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {ValidationHelper} from '../../../common/validation/validation-helper';
import {FormCommonTag} from './form-common-tag';

@Component({
  selector: 'app-control-button-event',
  template:
     `
      <app-form-layout
              [controlDir]="controlDir"
              [inline]="inline"
              [label]="label"
              [prepend]="prepend"
              [ttip]="ttip"
              [append]="append"
              [appendText]="appendText"
              [ttipAppend]="ttipAppend"
              [noLabel]="noLabel"
              [showValidation]="showValidation"
      >

        <div class="container ml-0 pl-0 mr-0 pr-0 pt-2">

          <span *ngIf="!multiple" class="btn btn-sm bg-white border-secondary"
                (click)="buttonClick.emit()"
                tooltip="{{ 'edit' | translate }}">
            <i class="fa fa-edit"></i>
          </span>

          <span *ngIf="!multiple && valueSelected()" class="btn btn-sm bg-white border-secondary"
                (click)="unselect()" tooltip="{{ 'remove' | translate }}">
            <i class="fa fa-times"></i>
          </span>

          <span *ngIf="multiple" class="btn btn-sm bg-white border-secondary"
                (click)="buttonClick.emit()"
                tooltip="{{ 'add' | translate }}">
            <i class="fa fa-plus"></i>
          </span>



          <span class="pl-1 text-secondary" *ngIf="!valueSelected()">
            {{ placeholder }}
          </span>

          <div class="pl-1 d-inline-block" *ngIf="!multiple && valueSelected()" [innerHtml]="template(selected)">

            <!--{{ selected.getLabel() }}-->
          </div>

          <div *ngIf="showList()" class="col-12 p-0 mt-0">
            <ul class="list-group">
              <li *ngFor="let s of selected" class="list-group-item pt-1 pb-1 pr-1">
                <div class="d-flex">
                  <div *ngIf="template" [innerHtml]=template(s)></div>
                  <div *ngIf="!template">
                    {{ s.getLabel() }}
                  </div>
                  <div class="ml-auto">
                    <button type="button" class="btn btn-outline-secondary btn-sm pt-0 pb-0 pl-1 pr-1"
                            (click)="unselect(s)"
                    >
                      <i class="fa fa-times"></i>
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div *ngIf="controlDir.dirty && controlDir.pending"
             [ngStyle]="{'position': 'absolute', 'top': '5px', 'right': '17px', 'z-index': '100'}">
          <i class="fa fa-circle-o-notch fa-spin fa-fw text-secondary"></i>
        </div>

      </app-form-layout>
    `,
})
export class FormTemplateButtonEventComponent extends FormCommonTag implements ControlValueAccessor, OnInit {

  @Input() multiple = false;

  @Input() template: () => string;

  @Output() buttonClick = new EventEmitter();

  selected;

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

  }

  /*
    ControlValueAccess Impl.
  */

  onChange = (value: string) => {};

  onTouched = () => {};

  writeValue(value: any): void {

    this.selected = value;

    if (this.controlDir.control) {
      this.controlDir.control.markAsDirty();
      this.controlDir.control.updateValueAndValidity();
      this.ref.detectChanges();
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  unselect(e) {
    if (this.multiple) {
      const index = this.selected.indexOf(e, 0);
      if (index > -1) {
        this.selected.splice(index, 1);
      }
    } else {
      this.selected = null;
    }

    this.controlDir.control.updateValueAndValidity();
    this.onChange(this.selected);
    this.ref.detectChanges();
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

  showList() {
    return this.multiple && this.selected && this.selected.length > 0;
  }

  valueSelected() {
    if (this.multiple) {
      return this.selected && this.selected.length > 0;
    } else {
      return this.selected;
    }
  }

}

