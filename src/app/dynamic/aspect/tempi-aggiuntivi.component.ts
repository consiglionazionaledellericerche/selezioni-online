import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_tempi_aggiuntivi',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlTempiAggiuntivi()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark c-pointer" (click)="toggle()">{{'label.jconon_application.fl_tempi_aggiuntivi' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_tempi_aggiuntivi">
                    <input type="checkbox" (change)="onChangeToggle(true)" id="fl_tempi_aggiuntivi" 
                      formControlName="jconon_application:fl_tempi_aggiuntivi">
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
                [label]="'label.jconon_application.tempi_aggiuntivi'| translate" 
                formControlName="jconon_application:tempi_aggiuntivi">
              </app-control-text>
            </div>
          </div>  
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [inline]="true" 
                [label]="'label.jconon_application.ausili'| translate" 
                formControlName="jconon_application:ausili">
              </app-control-text>
            </div>
          </div>
        </a>
      </form>
    `
  })
export class JcononAspectTempiAggiuntiviComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_tempi_aggiuntivi';
      this.control = new FormControl(this.data.fl_tempi_aggiuntivi);
      this.form.addControl(this.propertyName, this.control);

      this.form.addControl(
        'jconon_application:tempi_aggiuntivi', 
        new FormControl(this.data.tempi_aggiuntivi)
      );
      this.form.addControl(
        'jconon_application:ausili', 
        new FormControl(this.data.ausili)
      );

      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:tempi_aggiuntivi'].patchValue(null);
        this.form.controls['jconon_application:ausili'].patchValue(null);
      }
      this.form.controls['jconon_application:tempi_aggiuntivi']
        .setValidators(this.isFlTempiAggiuntivi()? Validators.required : undefined);
        this.form.controls['jconon_application:ausili']
        .setValidators(this.isFlTempiAggiuntivi()? Validators.required : undefined);
    }

    public isFlTempiAggiuntivi(): boolean {
      return this.form.controls['jconon_application:fl_tempi_aggiuntivi'].value;      
    }
}
