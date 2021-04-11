import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_titolo_riserva_posti',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_titolo_riserva_posti' | translate" 
            formControlName="jconon_application:fl_titolo_riserva_posti">
          </app-control-toggle>             
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-textarea 
                [showValidation]="true"
                [focus]="true"
                rows="5" 
                [inline]="true" 
                [label]="'label.jconon_application.motivazione_riserva_posti'| translate" 
                formControlName="jconon_application:motivazione_riserva_posti">
              </app-control-textarea>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectTitoloRiservaPostiComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_titolo_riserva_posti';
      this.control = new FormControl(this.data.fl_titolo_riserva_posti, Validators.required);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:motivazione_riserva_posti', 
        new FormControl(this.data.motivazione_riserva_posti)
      );
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:motivazione_riserva_posti'].patchValue(null);
      }
      this.form.controls['jconon_application:motivazione_riserva_posti']
        .setValidators(this.isToggle()? Validators.required : undefined);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_titolo_riserva_posti'].value;      
    }
}
