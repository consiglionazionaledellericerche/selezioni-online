import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Comune } from '../../common/model/comune.model';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';
import { CallService } from '../../core/call/call.service';
import { Select2Template } from '../../common/template/select2-template';

@Component({
    selector: 'P:jconon_application:aspect_iscrizione_liste_elettorali',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_iscritto_liste_elettorali' | translate" 
            formControlName="jconon_application:fl_iscritto_liste_elettorali">
          </app-control-toggle>
          <div class="form-row w-100 pt-1">
            <div [hidden]="!isToggle()" class="form-group col-md-9">
              <app-control-select-model
                [term]="''"
                [template]="comuniTemplate"
                [path]="callService.getComuniMapping()"
                [label]="'label.jconon_application.comune_liste_elettorali'| translate"
                [labelactive]="'true'"
                (onChangeEvent)="onChangeComune($event)"
                [inline]="'false'"
                [resultName]="'comuni'"
                [allowClear]="'true'"
                [placeholder]="'placeholder.select.place'| translate"
                formControlName="jconon_application:comune_liste_elettorali">
              </app-control-select-model>          
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-3">
              <app-control-text 
                [disabled]="true" 
                [showValidation]="false" 
                type="text" 
                [inline]="true" 
                [label]="'label.jconon_application.provincia_liste_elettorali' | translate" 
                formControlName="jconon_application:provincia_liste_elettorali">
              </app-control-text>
            </div>
            <div *ngSwitchCase="false" class="form-group col-md-12">
              <app-control-textarea 
                [showValidation]="true"
                rows="5" 
                [inline]="true" 
                [label]="'label.jconon_application.motivazione_no_iscrizione_liste_elettorali'| translate" 
                formControlName="jconon_application:motivazione_no_iscrizione_liste_elettorali">
              </app-control-textarea>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectIscrizioneListeElettoraliComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
      protected callService: CallService,      
    ) {
      super(cacheService, changeDetectorRef);
    }
    public comuniTemplate = Select2Template.comuni;    

    ngOnInit(): void {

      this.propertyName = 'jconon_application:fl_iscritto_liste_elettorali';
      this.control = new FormControl(this.data.fl_iscritto_liste_elettorali, this.isRequiredValidator(this.propertyName, this.data.call));
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl('jconon_application:comune_liste_elettorali', new FormControl(
          this.data.comune_liste_elettorali ? 
            new Comune(this.data.comune_liste_elettorali, this.data.provincia_liste_elettorali) : undefined
        )
      );
      this.form.addControl('jconon_application:provincia_liste_elettorali', new FormControl(this.data.provincia_liste_elettorali));
      this.form.addControl(
        'jconon_application:motivazione_no_iscrizione_liste_elettorali', 
        new FormControl(this.data.motivazione_no_iscrizione_liste_elettorali)
      );
      this.onChangeToggle(false);
      super.ngOnInit();
    }
    
    public onChangeComune(comune: string) {
      if (comune) {
        this.callService.getComune(comune).subscribe((result) => {
          this.form.controls['jconon_application:provincia_liste_elettorali'].patchValue(result.provincia);
        });
      } else {
        this.form.controls['jconon_application:provincia_liste_elettorali'].patchValue(null);
      }
    }

    public onChangeToggle(reset: boolean) {
      this.addRequiredValidatorForm('jconon_application:comune_liste_elettorali', this.data.call, Validators.required, this.isToggle(), reset);
      this.addRequiredValidatorForm('jconon_application:provincia_liste_elettorali', this.data.call, Validators.required, this.isToggle(), reset);
      this.addRequiredValidatorForm('jconon_application:motivazione_no_iscrizione_liste_elettorali', this.data.call, Validators.required, !this.isToggle(), reset);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_iscritto_liste_elettorali'].value;      
    }
}
