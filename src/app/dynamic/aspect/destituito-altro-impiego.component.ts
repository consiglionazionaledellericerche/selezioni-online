import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_destituito_altro_impiego',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlDestituitoAltroImpiego()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark c-pointer" (click)="toggle()">{{'label.jconon_application.fl_destituito_altro_impiego' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_destituito_altro_impiego">
                    <input type="checkbox" (change)="onChangeToggle(true)" id="fl_destituito_altro_impiego" 
                      formControlName="jconon_application:fl_destituito_altro_impiego">
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
            <div *ngSwitchCase="false" class="form-group col-md-12">
              <app-control-textarea 
                [showValidation]="true"
                [focus]="true"
                rows="5" 
                [inline]="true" 
                [label]="'label.jconon_application.motivazione_destituito_altro_impiego'| translate" 
                formControlName="jconon_application:motivazione_destituito_altro_impiego">
              </app-control-textarea>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectDestituitoAltroImpiegoComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_destituito_altro_impiego';
      this.control = new FormControl(this.data.fl_destituito_altro_impiego, Validators.required);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:motivazione_destituito_altro_impiego', 
        new FormControl(this.data.motivazione_destituito_altro_impiego)
      );
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:motivazione_destituito_altro_impiego'].patchValue(null);
      }
      this.form.controls['jconon_application:motivazione_destituito_altro_impiego']
        .setValidators(this.isFlDestituitoAltroImpiego()? undefined : Validators.required);
    }

    public isFlDestituitoAltroImpiego(): boolean {
      return this.form.controls['jconon_application:fl_destituito_altro_impiego'].value;      
    }
}