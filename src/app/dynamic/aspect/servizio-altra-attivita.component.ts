import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_servizio_altra_attivita',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlServizioAltraAttivita()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark">{{'label.jconon_application.fl_servizio_altra_attivita' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_servizio_altra_attivita">
                    <input type="checkbox" (change)="onChangeFlServizioAltraAttivita(true)" id="fl_servizio_altra_attivita" 
                      formControlName="jconon_application:fl_servizio_altra_attivita">
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
            <label *ngSwitchCase="true" class="px-2">{{'label.jconon_application.servizio_altra_attivita_etichetta'| translate}}</label>
          </div>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="true"
                [inline]="true" 
                [label]="'label.jconon_application.ruolo_altra_attivita'| translate" 
                formControlName="jconon_application:ruolo_altra_attivita">
              </app-control-text>
            </div>
          </div>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.sede_altra_attivita'| translate" 
                formControlName="jconon_application:sede_altra_attivita">
              </app-control-text>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectServizioAltraAttivitaComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_servizio_altra_attivita';
      this.control = new FormControl(this.data.fl_servizio_altra_attivita);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:ruolo_altra_attivita', 
        new FormControl(this.data.ruolo_altra_attivita)
      );
      this.form.addControl(
        'jconon_application:sede_altra_attivita', 
        new FormControl(this.data.sede_altra_attivita)
      );

      this.onChangeFlServizioAltraAttivita(false);
      super.ngOnInit();
    }

    public onChangeFlServizioAltraAttivita(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:sede_altra_attivita'].patchValue(null);
        this.form.controls['jconon_application:ruolo_altra_attivita'].patchValue(null);
      }
      this.form.controls['jconon_application:sede_altra_attivita']
        .setValidators(this.isFlServizioAltraAttivita()? Validators.required : undefined);
        this.form.controls['jconon_application:ruolo_altra_attivita']
        .setValidators(this.isFlServizioAltraAttivita()? Validators.required : undefined);

    }

    public isFlServizioAltraAttivita(): boolean {
      return this.form.controls['jconon_application:fl_servizio_altra_attivita'].value;      
    }
}
