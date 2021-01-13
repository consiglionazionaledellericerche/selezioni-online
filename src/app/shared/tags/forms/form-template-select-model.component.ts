import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output, Self
} from '@angular/core';
import {
  ControlValueAccessor, NgControl
} from '@angular/forms';
import {CmisObject} from '../../../common/model/cmisobject.model';
import {AuthService} from '../../../auth/auth.service';
import {ValidationHelper} from '../../../common/validation/validation-helper';
import {Enum} from '../../../common/model/enum.model';
import {ConfigService} from '../../../core/config.service';
import {Select2AngularComponent} from './select2-angular.component';
import { TranslateService } from '@ngx-translate/core';

// declare var jquery: any;   // not required
declare var $: any;   // not required

@Component({
  selector: 'app-control-select-model',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
     `
      <app-form-layout [controlDir]="controlDir"
                       [inline]="inline"
                       [label]="label"
                       [noLabel]="noLabel"
                       [prepend]="prepend"
                       [ttip]="ttip"
                       [append]="append"
                       [appendText]="appendText"
                       [prependText]="prependText"
                       [ttipAppend]="ttipAppend"
                       [showValidation]="showValidation">

          <select class="custom-select select2-single" [ngClass]="selectClasses()">
            <option *ngIf="allowClear"></option>
            
            <option *ngFor="let type of types" [value]="type.id" [selected]="isItemSelected(type.queryName)">
              {{ type.id | translate}}
            </option>

            <option *ngFor="let string of strings" [value]="string" [selected]="isStringSelected(string)">
              {{ string | translate}}
            </option>

            <option *ngFor="let item of items" [value]=item.getId() [selected]="isItemSelected(item.getId())">
              {{ item.getLabel(detailedLabel) }}
            </option>

            <option *ngFor="let item of enums" [value]=item.getEnumValue() [selected]="isEnumSelected(item.getEnumValue())">
              {{ item.getEnumValue() | translate }}
            </option>

            <!--<option *ngIf="isSingleAsync() && selected" [value]="selected"> {{ selected.getLabel() }}</option>-->
          </select>

        <div *ngIf="showList()" class="col-12 p-0 mt-0">
            <ul class="list-group">
              <li *ngFor="let s of showListItems()" class="list-group-item pt-1 pb-1 pr-1">
                <div class="d-flex">
                  <div *ngIf="template" [innerHtml]=template(s)></div>
                  <div *ngIf="!template">
                    {{ s.getLabel() }}
                  </div>
                  <div class="ml-auto">
                    <button type="button" class="btn btn-outline-secondary btn-sm pt-0 pb-0 pl-1 pr-1"
                            (click)="unselect(s)">
                      <i class="fa fa-times"></i>
                    </button>
                  </div>
                </div>
              </li>
            </ul>
        </div>

    </app-form-layout>

    `
})
export class FormTemplateSelectModelComponent extends Select2AngularComponent implements ControlValueAccessor, OnInit, OnChanges {

  @Input() types: any[];

  @Input() items: CmisObject[];

  @Input() enums: Enum[];

  @Input() strings: string[];

  @Input() showAsList: false;

  @Input() detailedLabel: false;

  @Output() onChangeEvent = new EventEmitter<any>();

  selected;

  /**
   * Self permette di poter innestare form controls... ci assicuriamo
   * che sia esattamente quello fornito dal parent.
   * @param {NgControl} controlDir
   */
  constructor(@Optional() @Self() public controlDir: NgControl,
              private ref: ChangeDetectorRef,
              protected authService: AuthService,
              protected configService: ConfigService,
              protected translateService: TranslateService) {
    super(authService, configService, translateService);
    controlDir.valueAccessor = this;
  }

  /**
   * Implementazione Hook angular.
   */
  ngOnInit() {
    const control = this.controlDir.control;

    // se volessi aggiungere dei validatori di default al tag, nell'esempio required.
    // const validators = control.validator ? [control.validator, Validators.required] : Validators.required;
    const validators = control.validator;
    // console.log('I validatori sono', validators);
    control.setValidators(validators);
    control.updateValueAndValidity();

    this.initializeSelect2();
  }

  ngOnChanges() {
    if (!this.asyncInitialized) {
      this.initializeSelect2();
    }
  }

  /**
   * Implementazione callback necessarie alla select2.
   */
  protected select(e) {
    const data = e.params.data;

    if (this.isSingleSync()) {
      this.updateSigleSync(data);
      return;
    }

    if (this.isSingleSyncType()) {
      this.updateSigleSyncType(data);
      return;
    }

    if (this.isSingleSyncString()) {
      this.updateSigleSyncString(data);
      return;
    }

    if (this.isSingleAsync()) {
      this.updateSigleAsync(data);
      return;
    }

    if (this.isMultiSync()) {
      this.updateMultiSync(data);
      return;
    }

    if (this.isMultiAsync()) {
      this.updateMultiAsync(data);
      return;
    }

    if (this.isEnum()) {
      this.updateEnum(data);
      return;
    }
  }

  protected unselect(e) {

    if (this.multiple) {
      const index = this.selected.indexOf(e, 0);
      if (index > -1) {
        this.selected.splice(index, 1);
      }

    } else {
      this.selected = null;
      const s = this.cssSelector();
      $(s).val(null).trigger('change');
    }

    this.controlDir.control.updateValueAndValidity();

    this.completeOnChange();
  }

  protected getSelected() {
    return this.selected;
  }

  private isSingleSync() {
    return this.items && !this.multiple && !this.path;
  }

  private isSingleSyncType() {
    return this.types && !this.multiple && !this.path;
  }

  private isSingleSyncString() {
    return this.strings && !this.multiple && !this.path;
  }

  private isSingleAsync() {
    return !this.multiple && this.path;
  }

  private isEnum() {
    return this.enums;
  }

  private isMultiSync() {
    return this.multiple && !this.path;
  }

  private isMultiAsync() {
    return this.multiple && this.path;
  }

  private updateSigleSync(data) {
    // same value prevent change detection
    if (this.selected && this.selected.getId && this.selected.getId() === +data.id) {
      return;
    }
    // update value
    this.selected = this.items.filter((item) => item.getObjectId() === data.id)[0];

    this.completeOnChange();
  }

  private updateSigleSyncType(data) {
    // same value prevent change detection
    if (this.selected && this.selected.id && this.selected.id === +data.id) {
      return;
    }
    // update value
    this.selected = this.types.filter((type) => type.id === data.id)[0].queryName;

    this.completeOnChange();
  }

  private updateSigleSyncString(data) {
    // same value prevent change detection
    if (this.selected && this.selected && this.selected === +data.id) {
      return;
    }
    // update value
    this.selected = this.strings.filter((type) => type === data.id)[0];

    this.completeOnChange();
  }

  private updateSigleAsync(data) {
    // same value prevent change detection
    if (this.selected && this.selected.getId && this.selected.getId() === data.id) {
      return;
    }

    // Update value
    this.selected = this.buildValue(data);

    this.completeOnChange();
  }

  private updateEnum(data) {
    // same value prevent change detection
    if (this.selected && this.selected.getEnumValue && this.selected.getEnumValue() === data.id) {
      return;
    }
    // update value
    this.selected = this.enums.filter( (en) => en.getEnumValue() === data.id)[0];

    this.completeOnChange();
  }

  private updateMultiSync(data) {
    const s = this.cssSelector();
    $(s).val(null).trigger('change');

    if (!this.selected) {
      this.selected = [];
    }

    // same value prevent change detection
    if (this.selected.length > 0) {
      const values = this.selected.filter( item =>  item.getObjectId() === +data.id);
      if (values.length > 0) {
        return;
      }
    }

    // update value
    this.selected.push(this.items.filter((item) => item.getObjectId() === data.id)[0]);

    this.completeOnChange();
  }

  private updateMultiAsync(data) {

    const s = this.cssSelector();
    $(s).val(null).trigger('change');

    if (!this.selected) {
      this.selected = [];
    }

    // same value prevent change detection
    if (this.selected.length > 0) {
      const values = this.selected.filter( item =>  item.getId() === +data.id);
      if (values.length > 0) {
        return;
      }
    }

    // update value
    this.selected.push(this.buildValue(data));

    this.completeOnChange();
  }

  private completeOnChange() {
    this.onChange(this.selected);
    this.ref.detectChanges();
    this.onChangeEvent.emit(this.selected);
  }

  /*
  ControlValueAccess Impl.
   */

  onChange(value: CmisObject) {}

  onTouched = () => {};

  writeValue(value: any): void {
    this.selected = value;

    if (this.asyncInitialized) {
      // Quando injetto nuovi valori nella form async devo creare le option, per comodità la reinizializzo.
      this.asyncInitialized = false;
      $(this.cssSelector()).data('select2').destroy();
      this.initializeSelect2();
    }

    if (this.controlDir.control) {
      this.controlDir.control.markAsDirty();
      this.controlDir.control.updateValueAndValidity();
    }
    this.ref.detectChanges();
    
    $(this.cssSelector()).trigger('change');

  }

  registerOnChange(fn: (value: CmisObject) => void): void {
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

  isItemSelected(value: any) {
    if (this.isSingleSync() || this.isSingleAsync()) {
      return this.selected ? this.selected.getId() === value : false;
    }
    if (this.isSingleSyncType()) {
      return this.selected ? this.selected === value : false;
    } 
    if (this.isMultiSync()) {
      return false; // this.selected ? this.selected.filter(item => item === value).lenght > 0 : false;
    }
  }

  isStringSelected(value: any) {
    if (this.isSingleSyncString() || this.isSingleAsync()) {
      return this.selected ? this.selected === value : false;
    }
    if (this.isMultiSync()) {
      return false; // this.selected ? this.selected.filter(item => item === value).lenght > 0 : false;
    }
  }

  isEnumSelected(value: any) {
    return this.selected ? this.selected.getEnumValue() === value : false;
  }

  selectClasses() {
    const classes = {
      'is-valid': this.isValid(),
      'is-invalid': this.isInvalid(),
    };
    classes[this.id] = true;
    return classes;
  }

  showList() {
    if (this.multiple) {
      return this.selected && this.selected.length > 0;
    }
    if (this.showAsList && this.selected) {
      return true;
    }
    return false;
  }

  showListItems() {
    if (this.multiple) {
      return this.selected;
    }
    if (this.selected) {
      return [this.selected];
    }
    return [];
  }

  buildValue(data) {
    if (this.baseBuilder && data.entity) {
      return this.baseBuilder(data.entity);
    }
    return data.id;
  }
}

