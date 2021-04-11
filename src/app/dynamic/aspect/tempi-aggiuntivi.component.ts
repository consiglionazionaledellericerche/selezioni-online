import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_tempi_aggiuntivi',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_tempi_aggiuntivi' | translate" 
            formControlName="jconon_application:fl_tempi_aggiuntivi">
          </app-control-toggle>            
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="true"
                [inline]="true" 
                [label]="'label.jconon_application.tempi_aggiuntivi'| translate" 
                formControlName="jconon_application:tempi_aggiuntivi">
              </app-control-text>
            </div>
          </div>  
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.ausili'| translate" 
                formControlName="jconon_application:ausili">
              </app-control-text>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectTempiAggiuntiviComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_tempi_aggiuntivi';
      this.control = new FormControl(this.data.fl_tempi_aggiuntivi);
      this.form.addControl(this.propertyName, this.control);

      this.form.addControl(
        'jconon_application:tempi_aggiuntivi', 
        new FormControl(this.data.tempi_aggiuntivi)
      );
      this.form.addControl(
        'jconon_application:ausili', 
        new FormControl(this.data.ausili)
      );

      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:tempi_aggiuntivi'].patchValue(null);
        this.form.controls['jconon_application:ausili'].patchValue(null);
      }
      this.form.controls['jconon_application:tempi_aggiuntivi']
        .setValidators(this.isToggle()? Validators.required : undefined);
        this.form.controls['jconon_application:ausili']
        .setValidators(this.isToggle()? Validators.required : undefined);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_tempi_aggiuntivi'].value;      
    }
}
