import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_dottorato',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlDottorato()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark c-pointer" (click)="toggle()">{{'label.jconon_application.fl_dottorato' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_dottorato">
                    <input type="checkbox" (change)="onChangeToggle(true)" id="fl_dottorato" 
                      formControlName="jconon_application:fl_dottorato">
                    <span class="lever"></span>
                    <div *ngIf=isInvalid() class="text-truncate text-danger mt-n2">
                      <span *ngFor="let error of hasErrors()" class="pr-2">
                        <small class="align-top">{{ 'message.validation.' + error | translate }}</small>
                      </span>
                    </div>
                </label>
            </div>
          </div>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="true"
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
export class JcononAspectDottoratoComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    public isFlRequired = true;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_dottorato';
      this.control = new FormControl(this.data.fl_dottorato);
      this.form.addControl(this.propertyName, this.control);
      this.form.controls[this.propertyName]
        .setValidators(this.isFlRequired? Validators.requiredTrue : undefined);

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
      if (reset) {
        this.form.controls['jconon_application:tipo_dottorato'].patchValue(null);
        this.form.controls['jconon_application:istituto_dottorato'].patchValue(null);
        this.form.controls['jconon_application:data_dottorato'].patchValue(null);
      }
      this.form.controls['jconon_application:tipo_dottorato']
        .setValidators(this.isFlDottorato()? Validators.required : undefined);
        this.form.controls['jconon_application:istituto_dottorato']
        .setValidators(this.isFlDottorato()? Validators.required : undefined);
        this.form.controls['jconon_application:data_dottorato']
        .setValidators(this.isFlDottorato()? Validators.required : undefined);
    }

    public isFlDottorato(): boolean {
      return this.form.controls['jconon_application:fl_dottorato'].value;      
    }
}