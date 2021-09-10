import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { Helpers } from '../../common/helpers/helpers';
import { CallService } from '../../core/call/call.service';
import { Select2Template } from '../../common/template/select2-template';
import { Call } from '../../core/call/call.model';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'affix_tabCallSettings',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <div class="form-row">
          <div class="form-check col-md-2 mb-3">
            <app-control-checkbox 
              [showValidation]="true"
              [inline]="true" 
              [label]="'label.jconon_call.aspect_macro_call'| translate" 
              formControlName="jconon_call:aspect_macro_call">
            </app-control-checkbox>
          </div>
          <div class="form-group col-md-4">
            <app-control-text 
              *ngIf="isBandoMultiplo()"
              [showValidation]="true"
              [inline]="true" 
              [label]="'label.jconon_call.numero_max_domande'| translate" 
              formControlName="jconon_call:numero_max_domande">
            </app-control-text>
          </div>
        </div>
      </form>
    `
  })
export class JcononAffixCallSettingsComponent extends DynamicComponent<Call> {

    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
      protected callService: CallService,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      super.ngOnInit();

      this.form.addControl('jconon_call:aspect_macro_call', 
        new FormControl(this.data.secondaryObjectTypeIds ? 
          this.data.secondaryObjectTypeIds.indexOf('P:jconon_call:aspect_macro_call') != -1 : false, Validators.required));
      this.form.addControl('jconon_call:numero_max_domande', 
        new FormControl(this.data.numero_max_domande, [Helpers.patternValidator(/^[0-9]+$/, { onlyNumber: true })]));
    }

    public isBandoMultiplo(): boolean {
      return this.form.controls['jconon_call:aspect_macro_call'].value;      
    }

}
