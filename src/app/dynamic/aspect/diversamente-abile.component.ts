import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_diversamente_abile',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlDiversamenteAbile()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark">{{'label.jconon_application.fl_diversamente_abile' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_diversamente_abile">
                    <input type="checkbox" (change)="onChangeFlDiversamenteAbile(true)" id="fl_diversamente_abile" 
                      formControlName="jconon_application:fl_diversamente_abile">
                    <span class="lever"></span>
                    <div *ngIf=isInvalid() class="text-truncate text-danger mt-n2">
                      <span *ngFor="let error of hasErrors()" class="pr-2">
                        <small class="align-top">{{ 'message.validation.' + error | translate }}</small>
                      </span>
                    </div>
                </label>
            </div>
          </div>
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
export class JcononAspectDiversmenteAbileComponent extends DynamicComponent {
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

      this.onChangeFlDiversamenteAbile(false);
      super.ngOnInit();
    }

    public onChangeFlDiversamenteAbile(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:tempi_aggiuntivi_diversamente_abile'].patchValue(null);
        this.form.controls['jconon_application:ausili_diversamente_abile'].patchValue(null);
      }
      this.form.controls['jconon_application:tempi_aggiuntivi_diversamente_abile']
        .setValidators(this.isFlDiversamenteAbile()? Validators.required : undefined);
        this.form.controls['jconon_application:ausili_diversamente_abile']
        .setValidators(this.isFlDiversamenteAbile()? Validators.required : undefined);
    }

    public isFlDiversamenteAbile(): boolean {
      return this.form.controls['jconon_application:fl_diversamente_abile'].value;      
    }
}
