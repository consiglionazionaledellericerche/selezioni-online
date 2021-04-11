import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_diversamente_abile',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_diversamente_abile' | translate" 
            formControlName="jconon_application:fl_diversamente_abile">
          </app-control-toggle>             
          <div class="form-row w-100 py-1">
            <label *ngSwitchCase="true" class="px-2">{{'label.jconon_application.fl_diversamente_abile_subtitle'| translate}}</label>
          </div>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="true"
                [inline]="true" 
                [label]="'label.jconon_application.tempi_aggiuntivi_diversamente_abile'| translate" 
                formControlName="jconon_application:tempi_aggiuntivi_diversamente_abile">
              </app-control-text>
            </div>
          </div>  
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.ausili_diversamente_abile'| translate" 
                formControlName="jconon_application:ausili_diversamente_abile">
              </app-control-text>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectDiversmenteAbileComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_diversamente_abile';
      this.control = new FormControl(this.data.fl_diversamente_abile);
      this.form.addControl(this.propertyName, this.control);

      this.form.addControl(
        'jconon_application:tempi_aggiuntivi_diversamente_abile', 
        new FormControl(this.data.tempi_aggiuntivi_diversamente_abile)
      );
      this.form.addControl(
        'jconon_application:ausili_diversamente_abile', 
        new FormControl(this.data.ausili_diversamente_abile)
      );

      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:tempi_aggiuntivi_diversamente_abile'].patchValue(null);
        this.form.controls['jconon_application:ausili_diversamente_abile'].patchValue(null);
      }
      this.form.controls['jconon_application:tempi_aggiuntivi_diversamente_abile']
        .setValidators(this.isToggle()? Validators.required : undefined);
        this.form.controls['jconon_application:ausili_diversamente_abile']
        .setValidators(this.isToggle()? Validators.required : undefined);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_diversamente_abile'].value;      
    }
}
