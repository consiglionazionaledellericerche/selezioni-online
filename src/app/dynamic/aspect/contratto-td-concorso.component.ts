import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ObjectTypeService } from '../../core/object-type.service';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_contratto_td_concorso',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_contratto_td_concorso_presso' | translate" 
            formControlName="jconon_application:fl_contratto_td_concorso_presso">
          </app-control-toggle>            
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-select-model
                [focus]="!form.pristine"
                [inline]="true"
                [label]="'label.jconon_application.contratto_td_concorso_ente'| translate"
                [labelactive]="'true'"
                [strings]="choice"
                [showValidation]="true"
                [allowClear]="true"
                [showValidation]="true"
                (onChangeEvent)="onChangeToggle(false)"
                [placeholder]="'label.jconon_application.contratto_td_concorso_ente_placeholder'| translate"
                formControlName="jconon_application:contratto_td_concorso_ente">
              </app-control-select-model>
            </div>
          </div>  
          <div *ngSwitchCase="true" class="form-row w-100 pt-1">
            <div *ngIf="!isCNR()" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.contratto_td_concorso_altro_ente'| translate" 
                formControlName="jconon_application:contratto_td_concorso_altro_ente">
              </app-control-text>
            </div>
          </div>
          <div class="form-row w-100 pt-1">  
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-textarea 
                [showValidation]="true"
                rows="5"
                [inline]="true" 
                [label]="'label.jconon_application.contratto_td_concorso_codice_riferimento'| translate" 
                formControlName="jconon_application:contratto_td_concorso_codice_riferimento">
              </app-control-textarea>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectContrattoTDConcorsoComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected objectTypeService: ObjectTypeService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    protected choice: string[];

    ngOnInit(): void {
      this.objectTypeService.listChoice(
        'P:jconon_application:aspect_contratto_td_concorso',
        'jconon_application:contratto_td_concorso_ente'
      ).subscribe((choice) => {
        this.choice = choice;
      });

      this.propertyName = 'jconon_application:fl_contratto_td_concorso_presso';
      this.control = new FormControl(
        this.data.fl_contratto_td_concorso_presso, 
        this.isRequiredValidator(this.propertyName, this.data.call, Validators.requiredTrue)
      );
      this.form.addControl(this.propertyName, this.control);

      this.form.addControl(
        'jconon_application:contratto_td_concorso_ente', 
        new FormControl(this.data.contratto_td_concorso_ente)
      );
      this.form.addControl(
        'jconon_application:contratto_td_concorso_altro_ente', 
        new FormControl(this.data.contratto_td_concorso_altro_ente)
      );
      this.form.addControl(
        'jconon_application:contratto_td_concorso_codice_riferimento', 
        new FormControl(this.data.contratto_td_concorso_codice_riferimento)
      );

      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      this.addRequiredValidatorForm('jconon_application:contratto_td_concorso_ente', this.data.call, Validators.required, this.isToggle(), reset);
      this.addRequiredValidatorForm('jconon_application:contratto_td_concorso_altro_ente', this.data.call, Validators.required, this.isToggle() && !this.isCNR(), reset);
      this.addRequiredValidatorForm('jconon_application:contratto_td_concorso_codice_riferimento', this.data.call, Validators.required, this.isToggle(), reset);
    }

    public isCNR(): boolean {
      return this.form.controls['jconon_application:contratto_td_concorso_ente'].value === 'CNR';      
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_contratto_td_concorso_presso'].value;      
    }
}
