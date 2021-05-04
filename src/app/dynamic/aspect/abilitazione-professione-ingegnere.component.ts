import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ObjectTypeService } from '../../core/object-type.service';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_abilitazione_professione_ingegnere',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_abilitazione_professione_ingegnere' | translate" 
            formControlName="jconon_application:fl_abilitazione_professione_ingegnere">
          </app-control-toggle>            
          <div *ngSwitchCase="true" class="form-row w-100 pt-1">
            <div class="form-group col-md-3">
              <app-control-datepicker
                [inline]="true"
                [focus]="true"
                [label]="'label.jconon_application.data_abilitazione_professione_ingegnere'| translate"
                [showValidation]="true"
                [showValidation]="true"
                formControlName="jconon_application:data_abilitazione_professione_ingegnere">
              </app-control-datepicker>
            </div>
            <div class="form-group col-md-3">
              <app-control-toggle
                class="w-100 border-bottom-0" 
                (onChangeToggle)="onChangeIscrizione(true)"
                [label]="'label.jconon_application.fl_iscrizione_albo_professione_ingegnere' | translate" 
                formControlName="jconon_application:fl_iscrizione_albo_professione_ingegnere">
              </app-control-toggle>
            </div>
            <div *ngIf="isIscrizioneAlbo()" class="form-group col-md-3">
              <app-control-datepicker 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.data_iscrizione_albo_professione_ingegnere'| translate" 
                formControlName="jconon_application:data_iscrizione_albo_professione_ingegnere">
              </app-control-datepicker>
            </div>
            <div *ngIf="isIscrizioneAlbo()" class="form-group col-md-3">
              <app-control-select-model
                [inline]="true"
                [focus]="true"
                [label]="'label.jconon_application.provincia_iscrizione_albo_professione_ingegnere'| translate"
                [labelactive]="'true'"
                [strings]="choiceProvincia"
                [showValidation]="true"
                [allowClear]="true"
                [showValidation]="true"
                [placeholder]="'label.jconon_application.provincia_iscrizione_albo_professione_ingegnere_placeholder'| translate"
                formControlName="jconon_application:provincia_iscrizione_albo_professione_ingegnere">
              </app-control-select-model>
            </div>
          </div>  
          <div *ngSwitchCase="true" class="form-row w-100 pt-1">  
            <div *ngIf="isIscrizioneAlbo()" class="form-group col-md-6">
              <app-control-select-model
                [inline]="true"
                [focus]="true"
                [label]="'label.jconon_application.sezione_iscrizione_albo_professione_ingegnere'| translate"
                [labelactive]="'true'"
                [strings]="choiceSezione"
                [showValidation]="true"
                [allowClear]="true"
                [showValidation]="true"
                [placeholder]="'label.jconon_application.sezione_iscrizione_albo_professione_ingegnere_placeholder'| translate"
                formControlName="jconon_application:sezione_iscrizione_albo_professione_ingegnere">
              </app-control-select-model>
            </div>
            <div *ngIf="isIscrizioneAlbo()" class="form-group col-md-6">
              <app-control-select-model
                [inline]="true"
                [focus]="true"
                [label]="'label.jconon_application.settore_iscrizione_albo_professione_ingegnere'| translate"
                [labelactive]="'true'"
                [strings]="choiceSettore"
                [showValidation]="true"
                [allowClear]="true"
                [showValidation]="true"
                [placeholder]="'label.jconon_application.settore_iscrizione_albo_professione_ingegnere_placeholder'| translate"
                formControlName="jconon_application:settore_iscrizione_albo_professione_ingegnere">
              </app-control-select-model>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectAbilitazioneProfessioneIngegnereComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected objectTypeService: ObjectTypeService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    protected choiceProvincia: string[];
    protected choiceSezione: string[];
    protected choiceSettore: string[];

    ngOnInit(): void {
      this.objectTypeService.listChoice(
        'P:jconon_application:aspect_abilitazione_professione_ingegnere',
        'jconon_application:provincia_iscrizione_albo_professione_ingegnere').subscribe((choice) => {
        this.choiceProvincia = choice;
      });
      this.objectTypeService.listChoice(
        'P:jconon_application:aspect_abilitazione_professione_ingegnere',
        'jconon_application:sezione_iscrizione_albo_professione_ingegnere').subscribe((choice) => {
        this.choiceSezione = choice;
      });
      this.objectTypeService.listChoice(
        'P:jconon_application:aspect_abilitazione_professione_ingegnere',
        'jconon_application:settore_iscrizione_albo_professione_ingegnere').subscribe((choice) => {
        this.choiceSettore = choice;
      });

      this.propertyName = 'jconon_application:fl_abilitazione_professione_ingegnere';
      this.control = new FormControl(
        this.data.fl_abilitazione_professione_ingegnere, 
        this.isRequiredValidator('jconon_application:fl_abilitazione_professione_ingegnere', this.data.call, Validators.requiredTrue)
      );
      this.form.addControl(this.propertyName, this.control);

      this.form.addControl(
        'jconon_application:data_abilitazione_professione_ingegnere', 
        new FormControl(this.data.data_abilitazione_professione_ingegnere)
      );
      this.form.addControl(
        'jconon_application:fl_iscrizione_albo_professione_ingegnere', 
        new FormControl(this.data.fl_iscrizione_albo_professione_ingegnere)
      );
      this.form.addControl(
        'jconon_application:data_iscrizione_albo_professione_ingegnere', 
        new FormControl(this.data.data_iscrizione_albo_professione_ingegnere)
      );
      this.form.addControl(
        'jconon_application:provincia_iscrizione_albo_professione_ingegnere', 
        new FormControl(this.data.provincia_iscrizione_albo_professione_ingegnere)
      );
      this.form.addControl(
        'jconon_application:sezione_iscrizione_albo_professione_ingegnere', 
        new FormControl(this.data.sezione_iscrizione_albo_professione_ingegnere)
      );
      this.form.addControl(
        'jconon_application:settore_iscrizione_albo_professione_ingegnere', 
        new FormControl(this.data.settore_iscrizione_albo_professione_ingegnere)
      );

      this.onChangeToggle(false);
      this.onChangeIscrizione(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      this.addRequiredValidatorForm('jconon_application:data_abilitazione_professione_ingegnere',
        this.data.call, Validators.required, this.isToggle() && this.isIscrizioneAlbo(), reset);
      this.addRequiredValidatorForm('jconon_application:fl_iscrizione_albo_professione_ingegnere',
        this.data.call, Validators.requiredTrue, this.isToggle() && this.isIscrizioneAlbo(), reset);
      this.onChangeIscrizione(reset);
    }

    public onChangeIscrizione(reset: boolean) {
      this.addRequiredValidatorForm('jconon_application:data_iscrizione_albo_professione_ingegnere', 
        this.data.call, Validators.required, this.isToggle() && this.isIscrizioneAlbo(), reset);
      this.addRequiredValidatorForm('jconon_application:provincia_iscrizione_albo_professione_ingegnere', 
        this.data.call, Validators.required, this.isToggle() && this.isIscrizioneAlbo(), reset);
      this.addRequiredValidatorForm('jconon_application:sezione_iscrizione_albo_professione_ingegnere', 
        this.data.call, Validators.required, this.isToggle() && this.isIscrizioneAlbo(), reset);
      this.addRequiredValidatorForm('jconon_application:settore_iscrizione_albo_professione_ingegnere', 
        this.data.call, Validators.required, this.isToggle() && this.isIscrizioneAlbo(), reset);;
    }

    public isIscrizioneAlbo(): boolean {
      return this.form.controls['jconon_application:fl_iscrizione_albo_professione_ingegnere'].value;      
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_abilitazione_professione_ingegnere'].value;      
    }
}
