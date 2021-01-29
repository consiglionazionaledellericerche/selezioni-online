import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_diploma',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlDiploma()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark">{{'label.jconon_application.fl_diploma' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_diploma">
                    <input type="checkbox" (change)="onChangeFlDiploma(true)" id="fl_diploma" 
                      formControlName="jconon_application:fl_diploma">
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
                [label]="'label.jconon_application.tipo_diploma'| translate" 
                formControlName="jconon_application:tipo_diploma">
              </app-control-text>
            </div>
          </div>  
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-6">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.istituto_diploma'| translate" 
                formControlName="jconon_application:istituto_diploma">
              </app-control-text>
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-3">
              <app-control-datepicker 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.data_diploma'| translate" 
                formControlName="jconon_application:data_diploma">
              </app-control-datepicker>
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-3">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.punteggio_diploma'| translate" 
                formControlName="jconon_application:punteggio_diploma">
              </app-control-text>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectDiplomaComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    public isFlRequired = true;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_diploma';
      this.control = new FormControl(this.data.fl_diploma);
      this.form.addControl(this.propertyName, this.control);
      this.form.controls[this.propertyName]
        .setValidators(this.isFlRequired? Validators.requiredTrue : undefined);

      this.form.addControl(
        'jconon_application:tipo_diploma', 
        new FormControl(this.data.tipo_diploma)
      );
      this.form.addControl(
        'jconon_application:istituto_diploma', 
        new FormControl(this.data.istituto_diploma)
      );
      this.form.addControl(
        'jconon_application:data_diploma', 
        new FormControl(this.data.data_diploma)
      );
      this.form.addControl(
        'jconon_application:punteggio_diploma', 
        new FormControl(this.data.punteggio_diploma)
      );

      this.onChangeFlDiploma(false);
      super.ngOnInit();
    }

    public onChangeFlDiploma(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:tipo_diploma'].patchValue(null);
        this.form.controls['jconon_application:istituto_diploma'].patchValue(null);
        this.form.controls['jconon_application:data_diploma'].patchValue(null);
        this.form.controls['jconon_application:punteggio_diploma'].patchValue(null);

      }
      this.form.controls['jconon_application:tipo_diploma']
        .setValidators(this.isFlDiploma()? Validators.required : undefined);
        this.form.controls['jconon_application:istituto_diploma']
        .setValidators(this.isFlDiploma()? Validators.required : undefined);
        this.form.controls['jconon_application:data_diploma']
        .setValidators(this.isFlDiploma()? Validators.required : undefined);
        this.form.controls['jconon_application:punteggio_diploma']
        .setValidators(this.isFlDiploma()? Validators.required : undefined);
    }

    public isFlDiploma(): boolean {
      return this.form.controls['jconon_application:fl_diploma'].value;      
    }
}
