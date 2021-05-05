import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_titolo_preferenza_posti',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_titolo_preferenza_posti' | translate" 
            formControlName="jconon_application:fl_titolo_preferenza_posti">
          </app-control-toggle>            
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-textarea 
                [showValidation]="true"
                [focus]="!form.pristine"
                rows="5" 
                [inline]="true" 
                [label]="'label.jconon_application.motivazione_preferenza_posti'| translate" 
                formControlName="jconon_application:motivazione_preferenza_posti">
              </app-control-textarea>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectTitoloPreferenzaPostiComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_titolo_preferenza_posti';
      this.control = new FormControl(this.data.fl_titolo_preferenza_posti);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:motivazione_preferenza_posti', 
        new FormControl(this.data.motivazione_preferenza_posti)
      );
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      this.addRequiredValidatorForm('jconon_application:motivazione_preferenza_posti', this.data.call, Validators.required, this.isToggle(), reset);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_titolo_preferenza_posti'].value;      
    }
}
