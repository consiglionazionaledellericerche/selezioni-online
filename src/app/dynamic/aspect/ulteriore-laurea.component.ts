import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_ulteriore_laurea',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_ulteriore_laurea' | translate" 
            formControlName="jconon_application:fl_ulteriore_laurea">
          </app-control-toggle>            
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="true"
                [inline]="true" 
                [label]="'label.jconon_application.tipo_ulteriore_laurea'| translate" 
                formControlName="jconon_application:tipo_ulteriore_laurea">
              </app-control-text>
            </div>
          </div>  
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.istituto_ulteriore_laurea'| translate" 
                formControlName="jconon_application:istituto_ulteriore_laurea">
              </app-control-text>
            </div>
          </div>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-4">
              <app-control-datepicker 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.data_ulteriore_laurea'| translate" 
                formControlName="jconon_application:data_ulteriore_laurea">
              </app-control-datepicker>
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-4">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.punteggio_ulteriore_laurea'| translate" 
                formControlName="jconon_application:punteggio_ulteriore_laurea">
              </app-control-text>
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-4">
              <div class="form-check w-100">
                <input id="fl_ulteriore_laurea_equipollente" type="checkbox" formControlName="jconon_application:fl_ulteriore_laurea_equipollente">
                <label for="fl_ulteriore_laurea_equipollente" class="pl-5">{{'label.jconon_application.fl_ulteriore_laurea_equipollente'| translate}}</label>
              </div>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectUlterioreLaureaComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    public isFlRequired = true;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_ulteriore_laurea';
      this.control = new FormControl(this.data.fl_ulteriore_laurea);
      this.form.addControl(this.propertyName, this.control);
      this.form.controls[this.propertyName]
        .setValidators(this.isFlRequired? Validators.requiredTrue : undefined);

      this.form.addControl(
        'jconon_application:tipo_ulteriore_laurea', 
        new FormControl(this.data.tipo_ulteriore_laurea)
      );
      this.form.addControl(
        'jconon_application:istituto_ulteriore_laurea', 
        new FormControl(this.data.istituto_ulteriore_laurea)
      );
      this.form.addControl(
        'jconon_application:data_ulteriore_laurea', 
        new FormControl(this.data.data_ulteriore_laurea)
      );
      this.form.addControl(
        'jconon_application:punteggio_ulteriore_laurea', 
        new FormControl(this.data.punteggio_ulteriore_laurea)
      );
      this.form.addControl(
        'jconon_application:fl_ulteriore_laurea_equipollente', 
        new FormControl(this.data.fl_ulteriore_laurea_equipollente)
      );

      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:tipo_ulteriore_laurea'].patchValue(null);
        this.form.controls['jconon_application:istituto_ulteriore_laurea'].patchValue(null);
        this.form.controls['jconon_application:data_ulteriore_laurea'].patchValue(null);
        this.form.controls['jconon_application:punteggio_ulteriore_laurea'].patchValue(null);
        this.form.controls['jconon_application:fl_ulteriore_laurea_equipollente'].patchValue(null);
      }
      this.form.controls['jconon_application:tipo_ulteriore_laurea']
        .setValidators(this.isToggle()? Validators.required : undefined);
        this.form.controls['jconon_application:istituto_ulteriore_laurea']
        .setValidators(this.isToggle()? Validators.required : undefined);
        this.form.controls['jconon_application:data_ulteriore_laurea']
        .setValidators(this.isToggle()? Validators.required : undefined);
        this.form.controls['jconon_application:punteggio_ulteriore_laurea']
        .setValidators(this.isToggle()? Validators.required : undefined);
        this.form.controls['jconon_application:fl_ulteriore_laurea_equipollente']
        .setValidators(this.isToggle()? Validators.requiredTrue : undefined);

    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_ulteriore_laurea'].value;      
    }
}
