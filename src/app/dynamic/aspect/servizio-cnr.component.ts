import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_servizioCNR',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_servizioCNR' | translate" 
            formControlName="jconon_application:fl_servizioCNR">
          </app-control-toggle>         
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="true"
                [inline]="true" 
                [label]="'label.jconon_application.struttura_cnr'| translate" 
                formControlName="jconon_application:struttura_cnr">
              </app-control-text>
            </div>
          </div>  
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-8">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.titolo_servizio_cnr'| translate" 
                formControlName="jconon_application:titolo_servizio_cnr">
              </app-control-text>
            </div>
            <div [hidden]="hiddenDirettore" *ngSwitchCase="true" class="form-group col-md-4">
              <div class="form-check w-100">
                <input id="fl_direttore" type="checkbox" formControlName="jconon_application:fl_direttore">
                <label for="fl_direttore" class="pl-5">{{'label.jconon_application.fl_direttore'| translate}}</label>
              </div>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectServizioCNRComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    public hiddenDirettore = false;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_servizioCNR';
      this.control = new FormControl(this.data.fl_servizioCNR);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:struttura_cnr', 
        new FormControl(this.data.struttura_cnr)
      );
      this.form.addControl(
        'jconon_application:titolo_servizio_cnr', 
        new FormControl(this.data.titolo_servizio_cnr)
      );
      this.form.addControl(
        'jconon_application:fl_direttore', 
        new FormControl(this.data.fl_direttore)
      );
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:struttura_cnr'].patchValue(null);
        this.form.controls['jconon_application:titolo_servizio_cnr'].patchValue(null);
        this.form.controls['jconon_application:fl_direttore'].patchValue(null);
      }
      this.form.controls['jconon_application:struttura_cnr']
        .setValidators(!this.isToggle()? undefined : Validators.required);
        this.form.controls['jconon_application:titolo_servizio_cnr']
        .setValidators(!this.isToggle()? undefined : Validators.required);

    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_servizioCNR'].value;      
    }
}
