import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_laurea',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlLaurea()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark">{{'label.jconon_application.fl_laurea' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_laurea">
                    <input type="checkbox" (change)="onChangeFlLaurea(true)" id="fl_laurea" 
                      formControlName="jconon_application:fl_laurea">
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
                [inline]="true" 
                [label]="'label.jconon_application.tipo_laurea'| translate" 
                formControlName="jconon_application:tipo_laurea">
              </app-control-text>
            </div>
          </div>  
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.istituto_laurea'| translate" 
                formControlName="jconon_application:istituto_laurea">
              </app-control-text>
            </div>
          </div>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-4">
              <app-control-datepicker 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.data_laurea'| translate" 
                formControlName="jconon_application:data_laurea">
              </app-control-datepicker>
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-4">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.punteggio_laurea'| translate" 
                formControlName="jconon_application:punteggio_laurea">
              </app-control-text>
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-4">
              <div class="form-check w-100">
                <input id="fl_laurea_equipollente" type="checkbox" formControlName="jconon_application:fl_laurea_equipollente">
                <label for="fl_laurea_equipollente" class="pl-5">{{'label.jconon_application.fl_laurea_equipollente'| translate}}</label>
              </div>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectLaureaComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    public isFlRequired = true;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_laurea';
      this.control = new FormControl(this.data.fl_laurea);
      this.form.addControl(this.propertyName, this.control);
      this.form.controls[this.propertyName]
        .setValidators(this.isFlRequired? Validators.requiredTrue : undefined);

      this.form.addControl(
        'jconon_application:tipo_laurea', 
        new FormControl(this.data.tipo_laurea)
      );
      this.form.addControl(
        'jconon_application:istituto_laurea', 
        new FormControl(this.data.istituto_laurea)
      );
      this.form.addControl(
        'jconon_application:data_laurea', 
        new FormControl(this.data.data_laurea)
      );
      this.form.addControl(
        'jconon_application:punteggio_laurea', 
        new FormControl(this.data.punteggio_laurea)
      );
      this.form.addControl(
        'jconon_application:fl_laurea_equipollente', 
        new FormControl(this.data.fl_laurea_equipollente)
      );

      this.onChangeFlLaurea(false);
      super.ngOnInit();
    }

    public onChangeFlLaurea(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:tipo_laurea'].patchValue(null);
        this.form.controls['jconon_application:istituto_laurea'].patchValue(null);
        this.form.controls['jconon_application:data_laurea'].patchValue(null);
        this.form.controls['jconon_application:punteggio_laurea'].patchValue(null);
        this.form.controls['jconon_application:fl_laurea_equipollente'].patchValue(null);
      }
      this.form.controls['jconon_application:tipo_laurea']
        .setValidators(this.isFlLaurea()? Validators.required : undefined);
        this.form.controls['jconon_application:istituto_laurea']
        .setValidators(this.isFlLaurea()? Validators.required : undefined);
        this.form.controls['jconon_application:data_laurea']
        .setValidators(this.isFlLaurea()? Validators.required : undefined);
        this.form.controls['jconon_application:punteggio_laurea']
        .setValidators(this.isFlLaurea()? Validators.required : undefined);
        this.form.controls['jconon_application:fl_laurea_equipollente']
        .setValidators(this.isFlLaurea()? Validators.requiredTrue : undefined);

    }

    public isFlLaurea(): boolean {
      return this.form.controls['jconon_application:fl_laurea'].value;      
    }
}
