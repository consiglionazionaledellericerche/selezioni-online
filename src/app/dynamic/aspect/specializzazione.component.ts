import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_specializzazione',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_specializzazione' | translate" 
            formControlName="jconon_application:fl_specializzazione">
          </app-control-toggle>            
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="true"
                [inline]="true" 
                [label]="'label.jconon_application.tipo_specializzazione'| translate" 
                formControlName="jconon_application:tipo_specializzazione">
              </app-control-text>
            </div>
          </div>  
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-9">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.istituto_specializzazione'| translate" 
                formControlName="jconon_application:istituto_specializzazione">
              </app-control-text>
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-3">
              <app-control-datepicker 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.data_specializzazione'| translate" 
                formControlName="jconon_application:data_specializzazione">
              </app-control-datepicker>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectSpecializzazioneComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    public isFlRequired = false;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_specializzazione';
      this.control = new FormControl(this.data.fl_specializzazione);
      this.form.addControl(this.propertyName, this.control);
      this.form.controls[this.propertyName]
        .setValidators(this.isFlRequired? Validators.requiredTrue : undefined);

      this.form.addControl(
        'jconon_application:tipo_specializzazione', 
        new FormControl(this.data.tipo_specializzazione)
      );
      this.form.addControl(
        'jconon_application:istituto_specializzazione', 
        new FormControl(this.data.istituto_specializzazione)
      );
      this.form.addControl(
        'jconon_application:data_specializzazione', 
        new FormControl(this.data.data_specializzazione)
      );

      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:tipo_specializzazione'].patchValue(null);
        this.form.controls['jconon_application:istituto_specializzazione'].patchValue(null);
        this.form.controls['jconon_application:data_specializzazione'].patchValue(null);
      }
      this.form.controls['jconon_application:tipo_specializzazione']
        .setValidators(this.isToggle()? Validators.required : undefined);
        this.form.controls['jconon_application:istituto_specializzazione']
        .setValidators(this.isToggle()? Validators.required : undefined);
        this.form.controls['jconon_application:data_specializzazione']
        .setValidators(this.isToggle()? Validators.required : undefined);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_specializzazione'].value;      
    }
}
