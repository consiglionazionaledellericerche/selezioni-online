import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { ObjectTypeService } from '../../core/object-type.service';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_toggle_with_single_field',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="toggleLabel | translate" 
            formControlName="{{propertyName}}">
          </app-control-toggle>            
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="toggle" class="form-group {{textClass}}">
              <app-control-text 
                *ngIf="textType == 'text'"
                [showValidation]="true"
                [focus]="true"
                [inline]="true" 
                [label]="textLabel| translate" 
                formControlName="{{textPropertyName}}">
              </app-control-text>
              <app-control-datepicker
                *ngIf="textType == 'date'"
                [inline]="true"
                [focus]="true"
                [showValidation]="true"
                [label]="textLabel | translate"
                formControlName="{{textPropertyName}}">
              </app-control-datepicker>
              <app-control-textarea 
                *ngIf="textType == 'textarea'"
                [showValidation]="true"
                rows="5"
                [focus]="true"
                [inline]="true" 
                [label]="textLabel| translate" 
                formControlName="{{textPropertyName}}">
              </app-control-textarea>
              <app-control-select-model
                *ngIf="textType == 'select'"
                [inline]="true"
                [focus]="true"
                [label]="textLabel| translate"
                [labelactive]="'true'"
                [strings]="choice"
                [allowClear]="true"
                [showValidation]="true"
                [placeholder]="textLabelPlaceHolder| translate"
                formControlName="{{textPropertyName}}">
              </app-control-select-model>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectToggleWithSingleFieldComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected objectTypeService: ObjectTypeService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    public aspectName: string;
    public toggle: boolean = true;
    public requiredTrue = false;
    public required = false;
    public toggleName: string;
    public toggleLabel: string;
    
    public textClass = 'col-md-12';
    public textPropertyName: string;
    public textName: string;
    public textLabel: string;
    public textType: string = 'text';
    public textLabelPlaceHolder: string = 'placeholder.select.generic';

    private validators: ValidatorFn[] = [];
    protected choice: string[];

    ngOnInit(): void {
      if (this.textType === 'select') {
        this.objectTypeService.listChoice(
          this.aspectName,
          this.textPropertyName
        ).subscribe((choice) => {
          this.choice = choice;
        });
      }
      if (this.required) {
        this.validators.push(Validators.required);
      }
      if (this.requiredTrue) {
        this.validators.push(Validators.requiredTrue);
      }

      this.control = new FormControl(this.data[this.toggleName], this.validators);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(this.textPropertyName,new FormControl(this.data[this.textName]));
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls[this.textPropertyName].patchValue(null);
      }
      this.form.controls[this.textPropertyName]
        .setValidators(this.toggle ? (this.isToggle()? Validators.required : undefined) :
          (this.isToggle()? undefined : Validators.required));
    }

    public isToggle(): boolean {
      return this.form.controls[this.propertyName].value;      
    }
}
