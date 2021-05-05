import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { ObjectTypeService } from '../../core/object-type.service';
import { Comune } from '../../common/model/comune.model';
import { Application } from '../../core/application/application.model';
import { CallService } from '../../core/call/call.service';
import { Select2Template } from '../../common/template/select2-template';

@Component({
    selector: 'P:jconon_application:aspect_ente_comparto_universita_appartenenza',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_ente_comparto_universita_appartenenza' | translate" 
            formControlName="jconon_application:fl_ente_comparto_universita_appartenenza">
          </app-control-toggle>            
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="!form.pristine"
                [inline]="true" 
                [label]="'label.jconon_application.ente_comparto_universita_appartenenza'| translate" 
                formControlName="jconon_application:ente_comparto_universita_appartenenza">
              </app-control-text>
            </div>
          </div>  
          <div class="form-row w-100 pt-1">
            <div [hidden]="!isToggle()" class="form-group col-md-5">
              <app-control-select-model
                [term]="''"
                [template]="comuniTemplate"
                [path]="callService.getComuniMapping()"
                [label]="'label.jconon_application.comune_ente_comparto_universita_appartenenza'| translate"
                [labelactive]="'true'"
                (onChangeEvent)="onChangeComune($event)"
                [inline]="'false'"
                [resultName]="'comuni'"
                [allowClear]="'true'"
                [placeholder]="'placeholder.select.place'| translate"
                formControlName="jconon_application:comune_ente_comparto_universita_appartenenza">
              </app-control-select-model>          
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-2">
              <app-control-text 
                [disabled]="true" 
                [showValidation]="false" 
                type="text" 
                [inline]="true" 
                [label]="'label.jconon_application.provincia_ente_comparto_universita_appartenenza' | translate" 
                formControlName="jconon_application:provincia_ente_comparto_universita_appartenenza">
              </app-control-text>
            </div>
            <div [hidden]="!isToggle()" class="form-group col-md-5">
              <app-control-text
                [inline]="true"
                [label]="'label.jconon_application.categoria_ente_comparto_universita_appartenenza'| translate"
                [showValidation]="true"
                formControlName="jconon_application:categoria_ente_comparto_universita_appartenenza">
              </app-control-text>          
            </div>
          </div>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-6">
              <app-control-datepicker 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.ente_comparto_universita_appartenenza_anzianita_servizio'| translate" 
                formControlName="jconon_application:ente_comparto_universita_appartenenza_anzianita_servizio">
              </app-control-datepicker>
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-6">
              <app-control-datepicker 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.ente_comparto_universita_appartenenza_anzianita_profilo'| translate" 
                formControlName="jconon_application:ente_comparto_universita_appartenenza_anzianita_profilo">
              </app-control-datepicker>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectEnteCompartoUniversitaAppartenenzaComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected objectTypeService: ObjectTypeService,
      protected changeDetectorRef: ChangeDetectorRef,
      protected callService: CallService,
    ) {
      super(cacheService, changeDetectorRef);
    }
    public comuniTemplate = Select2Template.comuni;
    
    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_ente_comparto_universita_appartenenza';
      this.control = new FormControl(this.data.fl_ente_comparto_universita_appartenenza);
      this.form.addControl(this.propertyName, this.control);

      this.form.addControl(
        'jconon_application:ente_comparto_universita_appartenenza', 
        new FormControl(this.data.ente_comparto_universita_appartenenza)
      );
      this.form.addControl(
        'jconon_application:comune_ente_comparto_universita_appartenenza', 
        new FormControl(this.data.comune_ente_comparto_universita_appartenenza ? 
          new Comune(this.data.comune_ente_comparto_universita_appartenenza,
                    this.data.provincia_ente_comparto_universita_appartenenza): undefined)
      );
      this.form.addControl(
        'jconon_application:provincia_ente_comparto_universita_appartenenza', 
        new FormControl(this.data.provincia_ente_comparto_universita_appartenenza)
      );
      this.form.addControl(
        'jconon_application:categoria_ente_comparto_universita_appartenenza', 
        new FormControl(this.data.categoria_ente_comparto_universita_appartenenza)
      );
      this.form.addControl(
        'jconon_application:ente_comparto_universita_appartenenza_anzianita_servizio', 
        new FormControl(this.data.ente_comparto_universita_appartenenza_anzianita_servizio)
      );
      this.form.addControl(
        'jconon_application:ente_comparto_universita_appartenenza_anzianita_profilo', 
        new FormControl(this.data.ente_comparto_universita_appartenenza_anzianita_profilo)
      );
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeComune(comune: string) {
      if (comune) {
        this.callService.getComune(comune).subscribe((result) => {
          this.form.controls['jconon_application:provincia_ente_comparto_universita_appartenenza'].patchValue(result.provincia);
        });
      } else {
        this.form.controls['jconon_application:provincia_ente_comparto_universita_appartenenza'].patchValue(null);
      }
    }

    public onChangeToggle(reset: boolean) {
      this.addRequiredValidatorForm('jconon_application:ente_comparto_universita_appartenenza', 
        this.data.call, Validators.required, this.isToggle(), reset);
      this.addRequiredValidatorForm('jconon_application:comune_ente_comparto_universita_appartenenza', 
        this.data.call, Validators.required, this.isToggle(), reset);
      this.addRequiredValidatorForm('jconon_application:provincia_ente_comparto_universita_appartenenza', 
        this.data.call, Validators.required, this.isToggle(), reset);
      this.addRequiredValidatorForm('jconon_application:categoria_ente_comparto_universita_appartenenza', 
        this.data.call, Validators.required, this.isToggle(), reset);
      this.addRequiredValidatorForm('jconon_application:ente_comparto_universita_appartenenza_anzianita_servizio', 
        this.data.call, Validators.required, this.isToggle(), reset);
      this.addRequiredValidatorForm('jconon_application:ente_comparto_universita_appartenenza_anzianita_profilo', 
        this.data.call, Validators.required, this.isToggle(), reset);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_ente_comparto_universita_appartenenza'].value;      
    }
}
