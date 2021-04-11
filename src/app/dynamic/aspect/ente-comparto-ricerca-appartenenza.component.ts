import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { ObjectTypeService } from '../../core/object-type.service';
import { Comune } from '../../common/model/comune.model';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_ente_comparto_ricerca_appartenenza',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_ente_comparto_ricerca_appartenenza' | translate" 
            formControlName="jconon_application:fl_ente_comparto_ricerca_appartenenza">
          </app-control-toggle>            
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="true"
                [inline]="true" 
                [label]="'label.jconon_application.ente_comparto_ricerca_appartenenza'| translate" 
                formControlName="jconon_application:ente_comparto_ricerca_appartenenza">
              </app-control-text>
            </div>
          </div>  
          <div class="form-row w-100 pt-1">
            <div [hidden]="!isToggle()" class="form-group col-md-5">
              <app-control-select-model
                [inline]="true"
                [focus]="true"
                [label]="'label.jconon_application.comune_ente_comparto_ricerca_appartenenza'| translate"
                [labelactive]="'true'"
                [items]="comuni"
                (onChangeEvent)="onChangeComune($event)"
                [showValidation]="true"
                [allowClear]="true"
                [showValidation]="true"
                [placeholder]="'placeholder.select.place'| translate"
                formControlName="jconon_application:comune_ente_comparto_ricerca_appartenenza">
              </app-control-select-model>          
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-2">
              <app-control-text 
                [disabled]="true" 
                [showValidation]="false" 
                type="text" 
                [inline]="true" 
                [label]="'label.jconon_application.provincia_ente_comparto_ricerca_appartenenza' | translate" 
                formControlName="jconon_application:provincia_ente_comparto_ricerca_appartenenza">
              </app-control-text>
            </div>
            <div [hidden]="!isToggle()" class="form-group col-md-5">
              <app-control-select-model
                [inline]="true"
                [focus]="true"
                [label]="'label.jconon_application.profilo_ente_comparto_ricerca_appartenenza'| translate"
                [labelactive]="'true'"
                [strings]="choice"
                [showValidation]="true"
                [allowClear]="true"
                [showValidation]="true"
                [placeholder]="'label.jconon_application.profilo_ente_comparto_ricerca_appartenenza_placeholder'| translate"
                formControlName="jconon_application:profilo_ente_comparto_ricerca_appartenenza">
              </app-control-select-model>          
            </div>
          </div>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-4">
              <app-control-datepicker 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.ente_comparto_ricerca_appartenenza_anzianita_servizio'| translate" 
                formControlName="jconon_application:ente_comparto_ricerca_appartenenza_anzianita_servizio">
              </app-control-datepicker>
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-4">
              <app-control-datepicker 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.ente_comparto_ricerca_appartenenza_anzianita_profilo'| translate" 
                formControlName="jconon_application:ente_comparto_ricerca_appartenenza_anzianita_profilo">
              </app-control-datepicker>
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-4">
              <app-control-datepicker 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.ente_comparto_ricerca_appartenenza_anzianita_livello'| translate" 
                formControlName="jconon_application:ente_comparto_ricerca_appartenenza_anzianita_livello">
              </app-control-datepicker>
            </div>          
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectEnteCompartoRicercaAppartenenzaComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected objectTypeService: ObjectTypeService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    public choice: string[];
    public comuni: Comune[];
    public isFlRequired = false;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_ente_comparto_ricerca_appartenenza';
      this.objectTypeService.listChoice(
          'P:jconon_application:aspect_ente_comparto_ricerca_appartenenza',
          'jconon_application:profilo_ente_comparto_ricerca_appartenenza'
        ).subscribe((choice) => {
          this.choice = choice;
        }
      );
      this.cacheService.comuni().subscribe((comuni) => {
        this.comuni = comuni;
      });
      this.control = new FormControl(this.data.fl_ente_comparto_ricerca_appartenenza);
      this.form.addControl(this.propertyName, this.control);
      this.form.controls[this.propertyName]
        .setValidators(this.isFlRequired? Validators.requiredTrue : undefined);

      this.form.addControl(
        'jconon_application:ente_comparto_ricerca_appartenenza', 
        new FormControl(this.data.ente_comparto_ricerca_appartenenza)
      );
      this.form.addControl(
        'jconon_application:comune_ente_comparto_ricerca_appartenenza', 
        new FormControl(new Comune(this.data.comune_ente_comparto_ricerca_appartenenza,this.data.provincia_ente_comparto_ricerca_appartenenza))
      );
      this.form.addControl(
        'jconon_application:provincia_ente_comparto_ricerca_appartenenza', 
        new FormControl(this.data.provincia_ente_comparto_ricerca_appartenenza)
      );
      this.form.addControl(
        'jconon_application:profilo_ente_comparto_ricerca_appartenenza', 
        new FormControl(this.data.profilo_ente_comparto_ricerca_appartenenza)
      );
      this.form.addControl(
        'jconon_application:ente_comparto_ricerca_appartenenza_anzianita_servizio', 
        new FormControl(this.data.ente_comparto_ricerca_appartenenza_anzianita_servizio)
      );
      this.form.addControl(
        'jconon_application:ente_comparto_ricerca_appartenenza_anzianita_profilo', 
        new FormControl(this.data.ente_comparto_ricerca_appartenenza_anzianita_profilo)
      );
      this.form.addControl(
        'jconon_application:ente_comparto_ricerca_appartenenza_anzianita_livello', 
        new FormControl(this.data.ente_comparto_ricerca_appartenenza_anzianita_livello)
      );      
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeComune(comune: any) {
      if (comune) {
        this.form.controls['jconon_application:provincia_ente_comparto_ricerca_appartenenza'].patchValue(comune.provincia);
      } else {
        this.form.controls['jconon_application:provincia_ente_comparto_ricerca_appartenenza'].patchValue(null);
      }
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:ente_comparto_ricerca_appartenenza'].patchValue(null);
        this.form.controls['jconon_application:comune_ente_comparto_ricerca_appartenenza'].patchValue(null);
        this.form.controls['jconon_application:provincia_ente_comparto_ricerca_appartenenza'].patchValue(null);
        this.form.controls['jconon_application:profilo_ente_comparto_ricerca_appartenenza'].patchValue(null);
        this.form.controls['jconon_application:ente_comparto_ricerca_appartenenza_anzianita_servizio'].patchValue(null);
        this.form.controls['jconon_application:ente_comparto_ricerca_appartenenza_anzianita_profilo'].patchValue(null);
        this.form.controls['jconon_application:ente_comparto_ricerca_appartenenza_anzianita_livello'].patchValue(null);
      }
      this.form.controls['jconon_application:ente_comparto_ricerca_appartenenza']
        .setValidators(this.isToggle()? Validators.required : undefined);
      this.form.controls['jconon_application:comune_ente_comparto_ricerca_appartenenza']
        .setValidators(this.isToggle()? Validators.required : undefined);
      this.form.controls['jconon_application:provincia_ente_comparto_ricerca_appartenenza']
        .setValidators(this.isToggle()? Validators.required : undefined);
      this.form.controls['jconon_application:profilo_ente_comparto_ricerca_appartenenza']
        .setValidators(this.isToggle()? Validators.required : undefined);
      this.form.controls['jconon_application:ente_comparto_ricerca_appartenenza_anzianita_servizio']
        .setValidators(this.isToggle()? Validators.required : undefined);
      this.form.controls['jconon_application:ente_comparto_ricerca_appartenenza_anzianita_profilo']
        .setValidators(this.isToggle()? Validators.required : undefined);
      this.form.controls['jconon_application:ente_comparto_ricerca_appartenenza_anzianita_livello']
        .setValidators(this.isToggle()? Validators.required : undefined);

    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_ente_comparto_ricerca_appartenenza'].value;      
    }
}
