import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_dottorato',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_dottorato' | translate" 
            formControlName="jconon_application:fl_dottorato">
          </app-control-toggle>    
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="!form.pristine"
                [inline]="true" 
                [label]="'label.jconon_application.tipo_dottorato'| translate" 
                formControlName="jconon_application:tipo_dottorato">
              </app-control-text>
            </div>
          </div>  
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-9">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.istituto_dottorato'| translate" 
                formControlName="jconon_application:istituto_dottorato">
              </app-control-text>
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-3">
              <app-control-datepicker 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.data_dottorato'| translate" 
                formControlName="jconon_application:data_dottorato">
              </app-control-datepicker>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectDottoratoComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_dottorato';
      this.control = new FormControl(this.data.fl_dottorato);
      this.form.addControl(this.propertyName, this.control);
      this.form.controls[this.propertyName]
        .setValidators(this.isRequiredValidator(this.propertyName, this.data.call, Validators.requiredTrue));

      this.form.addControl(
        'jconon_application:tipo_dottorato', 
        new FormControl(this.data.tipo_dottorato)
      );
      this.form.addControl(
        'jconon_application:istituto_dottorato', 
        new FormControl(this.data.istituto_dottorato)
      );
      this.form.addControl(
        'jconon_application:data_dottorato', 
        new FormControl(this.data.data_dottorato)
      );

      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      this.addRequiredValidatorForm('jconon_application:tipo_dottorato', this.data.call, Validators.required, this.isToggle(), reset);
      this.addRequiredValidatorForm('jconon_application:istituto_dottorato', this.data.call, Validators.required, this.isToggle(), reset);
      this.addRequiredValidatorForm('jconon_application:data_dottorato', this.data.call, Validators.required, this.isToggle(), reset);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_dottorato'].value;      
    }
}
