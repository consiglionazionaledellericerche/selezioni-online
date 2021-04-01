import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { ObjectTypeService } from '../../core/object-type.service';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_single_field',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
          <div class="pt-3" [ngClass]="hoverClass" (mouseover)="hoverClass='shadow-lg'" (mouseout)="hoverClass=''">
            <div class="form-row w-100 pt-3 pl-2">
              <div class="form-group {{class}}">                
                <app-control-text
                  *ngIf="type == 'text'"
                  [inline]="true"
                  [focus]="true"
                  [showValidation]="true"
                  [label]="label| translate"
                  formControlName="{{propertyName}}">
                </app-control-text>
                <app-control-textarea
                  *ngIf="type == 'textarea'"
                  [inline]="true"
                  [focus]="true"
                  rows="{{rows}}"
                  [showValidation]="true"
                  [label]="label| translate"
                  formControlName="{{propertyName}}">
                </app-control-textarea>              
                <app-control-datepicker
                  *ngIf="type == 'date'"
                  [inline]="true"
                  [focus]="true"
                  [showValidation]="true"
                  [label]="label | translate"
                  formControlName="{{propertyName}}">
                </app-control-datepicker>
                <app-control-select-model
                  *ngIf="type == 'select'"
                  [inline]="true"
                  [focus]="true"
                  [label]="label|translate"
                  [labelactive]="'true'"
                  [strings]="choice"
                  [allowClear]="true"
                  [showValidation]="true"
                  [placeholder]="labelPlaceHolder|translate"
                  formControlName="{{propertyName}}">
                </app-control-select-model>
              </div>
            </div>  
          </div>  
      </form>
    `
  })
export class JcononAspectSingleFieldComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected objectTypeService: ObjectTypeService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }    
    public aspectName: string;
    public hoverClass: string;
    public isRequired = true;
    public name: string;
    public label: string;
    public rows = "5";
    public class: string = 'col-md-12';
    public type: string = 'text';
    public validators: ValidatorFn[];
    protected choice: string[];
    public labelPlaceHolder: string = 'placeholder.select.generic';

    ngOnInit(): void {
      if (this.type === 'select') {
        this.objectTypeService.listChoice(
          this.aspectName,
          this.propertyName
        ).subscribe((choice) => {
          this.choice = choice;
        });
      }
      this.control = new FormControl(this.data[this.name], this.isRequired ? Validators.required : undefined);
      if (this.validators) {
        this.control.setValidators(this.validators);
      } 
      this.form.addControl(this.propertyName, this.control);
      super.ngOnInit();
    }
}
