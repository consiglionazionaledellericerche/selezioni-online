import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_altre_borse_studio',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_altre_borse_studio' | translate" 
            formControlName="jconon_application:fl_altre_borse_studio">
          </app-control-toggle>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="false" class="form-group col-md-12">
              <app-control-textarea 
                [showValidation]="true"
                [focus]="!form.pristine"
                rows="5" 
                [inline]="true" 
                [label]="'label.jconon_application.descrizione_altre_borse_studio'| translate" 
                formControlName="jconon_application:descrizione_altre_borse_studio">
              </app-control-textarea>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectAltreBorseStudioComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_altre_borse_studio';
      this.control = new FormControl(this.data.fl_altre_borse_studio, this.isRequiredValidator(this.propertyName, this.data.call));
      this.form.addControl(this.propertyName, this.control);

      this.form.addControl(
        'jconon_application:descrizione_altre_borse_studio', 
        new FormControl(this.data.descrizione_altre_borse_studio)
      );
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      this.addRequiredValidatorForm('jconon_application:descrizione_altre_borse_studio', this.data.call, Validators.required, !this.isToggle(), reset);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_altre_borse_studio'].value;      
    }
}
