import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_destituito_altro_impiego',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_destituito_altro_impiego' | translate" 
            formControlName="jconon_application:fl_destituito_altro_impiego">
          </app-control-toggle>  
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="false" class="form-group col-md-12">
              <app-control-textarea 
                [showValidation]="true"
                [focus]="true"
                rows="5" 
                [inline]="true" 
                [label]="'label.jconon_application.motivazione_destituito_altro_impiego'| translate" 
                formControlName="jconon_application:motivazione_destituito_altro_impiego">
              </app-control-textarea>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectDestituitoAltroImpiegoComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_destituito_altro_impiego';
      this.control = new FormControl(this.data.fl_destituito_altro_impiego, Validators.required);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:motivazione_destituito_altro_impiego', 
        new FormControl(this.data.motivazione_destituito_altro_impiego)
      );
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:motivazione_destituito_altro_impiego'].patchValue(null);
      }
      this.form.controls['jconon_application:motivazione_destituito_altro_impiego']
        .setValidators(this.isToggle()? undefined : Validators.required);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_destituito_altro_impiego'].value;      
    }
}
