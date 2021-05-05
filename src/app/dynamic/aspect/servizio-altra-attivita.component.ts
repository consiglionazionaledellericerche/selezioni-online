import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_servizio_altra_attivita',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_servizio_altra_attivita' | translate" 
            formControlName="jconon_application:fl_servizio_altra_attivita">
          </app-control-toggle>   
          <div class="form-row w-100 py-1">
            <label *ngSwitchCase="true" class="px-2">{{'label.jconon_application.servizio_altra_attivita_etichetta'| translate}}</label>
          </div>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="!form.pristine"
                [inline]="true" 
                [label]="'label.jconon_application.ruolo_altra_attivita'| translate" 
                formControlName="jconon_application:ruolo_altra_attivita">
              </app-control-text>
            </div>
          </div>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.sede_altra_attivita'| translate" 
                formControlName="jconon_application:sede_altra_attivita">
              </app-control-text>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectServizioAltraAttivitaComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_servizio_altra_attivita';
      this.control = new FormControl(this.data.fl_servizio_altra_attivita);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:ruolo_altra_attivita', 
        new FormControl(this.data.ruolo_altra_attivita)
      );
      this.form.addControl(
        'jconon_application:sede_altra_attivita', 
        new FormControl(this.data.sede_altra_attivita)
      );

      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      this.addRequiredValidatorForm('jconon_application:sede_altra_attivita', this.data.call, Validators.required, this.isToggle(), reset);
      this.addRequiredValidatorForm('jconon_application:ruolo_altra_attivita', this.data.call, Validators.required, this.isToggle(), reset);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_servizio_altra_attivita'].value;      
    }
}
