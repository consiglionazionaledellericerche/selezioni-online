import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_servizio_altre_amministrazioni',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlServizioAltreAmministrazioni()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark c-pointer" (click)="toggle()">{{'label.jconon_application.fl_servizio_altre_amministrazioni' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_servizio_altre_amministrazioni">
                    <input type="checkbox" (change)="onChangeToggle(true)" id="fl_servizio_altre_amministrazioni" 
                      formControlName="jconon_application:fl_servizio_altre_amministrazioni">
                    <span class="lever"></span>
                    <div *ngIf=isInvalid() class="text-truncate text-danger mt-n2">
                      <span *ngFor="let error of hasErrors()" class="pr-2">
                        <small class="align-top">{{ 'message.validation.' + error | translate }}</small>
                      </span>
                    </div>
                </label>
            </div>
          </div>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="true"
                [inline]="true" 
                [label]="'label.jconon_application.struttura_altre_amministrazioni'| translate" 
                formControlName="jconon_application:struttura_altre_amministrazioni">
              </app-control-text>
            </div>
          </div>  
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.titolo_servizio_altre_amministrazioni'| translate" 
                formControlName="jconon_application:titolo_servizio_altre_amministrazioni">
              </app-control-text>
            </div>
          </div>
          <div [hidden]="!hiddenRisoluzione" class="form-row w-100 pt-1">
            <label *ngSwitchCase="true" class="px-2">{{'label.jconon_application.servizio_altre_amministrazioni_etichetta'| translate}}</label>
          </div>
          <div [hidden]="hiddenRisoluzione" class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-textarea 
                [showValidation]="true"
                rows="3" 
                [inline]="true" 
                [label]="'label.jconon_application.cause_risoluzione_servizio_altre_amministrazioni'| translate" 
                formControlName="jconon_application:cause_risoluzione_servizio_altre_amministrazioni">
              </app-control-textarea>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectServizioAltreAmministrazioniComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    public hiddenRisoluzione = true;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_servizio_altre_amministrazioni';
      this.control = new FormControl(this.data.fl_servizio_altre_amministrazioni);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:struttura_altre_amministrazioni', 
        new FormControl(this.data.struttura_altre_amministrazioni)
      );
      this.form.addControl(
        'jconon_application:titolo_servizio_altre_amministrazioni', 
        new FormControl(this.data.titolo_servizio_altre_amministrazioni)
      );
      this.form.addControl(
        'jconon_application:cause_risoluzione_servizio_altre_amministrazioni', 
        new FormControl(this.data.cause_risoluzione_servizio_altre_amministrazioni)
      );

      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:struttura_altre_amministrazioni'].patchValue(null);
        this.form.controls['jconon_application:titolo_servizio_altre_amministrazioni'].patchValue(null);
      }
      this.form.controls['jconon_application:struttura_altre_amministrazioni']
        .setValidators(!this.isFlServizioAltreAmministrazioni()? undefined : Validators.required);
        this.form.controls['jconon_application:titolo_servizio_altre_amministrazioni']
        .setValidators(!this.isFlServizioAltreAmministrazioni()? undefined : Validators.required);

    }

    public isFlServizioAltreAmministrazioni(): boolean {
      return this.form.controls['jconon_application:fl_servizio_altre_amministrazioni'].value;      
    }
}
