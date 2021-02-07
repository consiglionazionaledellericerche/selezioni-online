import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_condanne_penali',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_condanne_penali' | translate" 
            formControlName="jconon_application:fl_condanne_penali">
          </app-control-toggle>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="false" class="form-group col-md-12">
              <app-control-textarea 
                [showValidation]="true"
                [focus]="true"
                rows="5" 
                [inline]="true" 
                [label]="'label.jconon_application.estremi_sentenze_penali'| translate" 
                formControlName="jconon_application:estremi_sentenze_penali">
              </app-control-textarea>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectCondannePenaliComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_condanne_penali';
      this.control = new FormControl(this.data.fl_condanne_penali, Validators.required);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:estremi_sentenze_penali', 
        new FormControl(this.data.estremi_sentenze_penali)
      );
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:estremi_sentenze_penali'].patchValue(null);
      }
      this.form.controls['jconon_application:estremi_sentenze_penali']
        .setValidators(this.isToggle()? undefined: Validators.required);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_condanne_penali'].value;      
    }
}
