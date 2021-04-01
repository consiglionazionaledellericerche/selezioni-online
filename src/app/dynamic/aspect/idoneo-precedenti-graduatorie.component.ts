import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Helpers } from '../../common/helpers/helpers';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_idoneo_precedenti_graduatorie',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_idoneo_precedenti_graduatorie' | translate" 
            formControlName="jconon_application:fl_idoneo_precedenti_graduatorie">
          </app-control-toggle>            
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [focus]="true"
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.numero_bando_idoneo_precedenti_graduatorie'| translate"
                formControlName="jconon_application:numero_bando_idoneo_precedenti_graduatorie">
              </app-control-text>
            </div>
          </div>  
          <div *ngSwitchCase="true" class="form-row w-100 pt-1">
            <div class="form-group col-md-4">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.anno_bando_idoneo_precedenti_graduatorie'| translate" 
                formControlName="jconon_application:anno_bando_idoneo_precedenti_graduatorie">
              </app-control-text>
            </div>
            <div class="form-group col-md-4">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.numero_protocollo_idoneo_precedenti_graduatorie'| translate" 
                formControlName="jconon_application:numero_protocollo_idoneo_precedenti_graduatorie">
              </app-control-text>
            </div>
            <div class="form-group col-md-4">
              <app-control-datepicker 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.data_graduatoria_idoneo_precedenti_graduatorie'| translate" 
                formControlName="jconon_application:data_graduatoria_idoneo_precedenti_graduatorie">
              </app-control-datepicker>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectIdoneoPrecedentiGraduatorieComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_idoneo_precedenti_graduatorie';
      this.control = new FormControl(this.data.fl_idoneo_precedenti_graduatorie, Validators.required);
      this.form.addControl(this.propertyName, this.control);

      this.form.addControl(
        'jconon_application:numero_bando_idoneo_precedenti_graduatorie', 
        new FormControl(this.data.numero_bando_idoneo_precedenti_graduatorie)
      );
      this.form.addControl(
        'jconon_application:anno_bando_idoneo_precedenti_graduatorie', 
        new FormControl(this.data.anno_bando_idoneo_precedenti_graduatorie)
      );
      this.form.addControl(
        'jconon_application:numero_protocollo_idoneo_precedenti_graduatorie', 
        new FormControl(this.data.numero_protocollo_idoneo_precedenti_graduatorie)
      );
      this.form.addControl(
        'jconon_application:data_graduatoria_idoneo_precedenti_graduatorie', 
        new FormControl(this.data.data_graduatoria_idoneo_precedenti_graduatorie)
      );

      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:numero_bando_idoneo_precedenti_graduatorie'].patchValue(null);
        this.form.controls['jconon_application:anno_bando_idoneo_precedenti_graduatorie'].patchValue(null);
        this.form.controls['jconon_application:numero_protocollo_idoneo_precedenti_graduatorie'].patchValue(null);
        this.form.controls['jconon_application:data_graduatoria_idoneo_precedenti_graduatorie'].patchValue(null);
      }
      this.form.controls['jconon_application:numero_bando_idoneo_precedenti_graduatorie']
        .setValidators(this.isToggle()? Validators.required : undefined);
      this.form.controls['jconon_application:anno_bando_idoneo_precedenti_graduatorie']
        .setValidators(this.isToggle()? [Helpers.patternValidator(/^\d{4}$/, { hasYear: true }), Validators.required] : undefined);
      this.form.controls['jconon_application:numero_protocollo_idoneo_precedenti_graduatorie']
        .setValidators(this.isToggle()? Validators.required : undefined);
      this.form.controls['jconon_application:data_graduatoria_idoneo_precedenti_graduatorie']
        .setValidators(this.isToggle()? Validators.required : undefined);

    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_idoneo_precedenti_graduatorie'].value;      
    }
}
