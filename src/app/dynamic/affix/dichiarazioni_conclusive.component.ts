import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'affix_tabDichiarazioniConclusive',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" class="pb-2">
        <div class="form-row">
          <div class="form-check col-12">
            <div class="toggles">
              <label for="fl_dichiarazione_sanzioni_penali">
                <span class="text-justify">{{'application.fl_dichiarazione_sanzioni_penali' | translate}}</span>
                <input type="checkbox" id="fl_dichiarazione_sanzioni_penali" formControlName="jconon_application:fl_dichiarazione_sanzioni_penali">
                <span class="lever"></span>
              </label>
            </div>
          </div>
          <div class="form-check col-12">
            <div class="toggles">
              <label for="fl_dichiarazione_dati_personali">
                <span class="text-justify">{{'application.fl_dichiarazione_dati_personali' | translate}}</span>
                <input type="checkbox" id="fl_dichiarazione_dati_personali" formControlName="jconon_application:fl_dichiarazione_dati_personali">
                <span class="lever"></span>
              </label>
            </div>
          </div>
        </div>
      </form>
    `
  })
export class JcononAffixDichiarazioniConclusiveComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.form.addControl('jconon_application:fl_dichiarazione_sanzioni_penali', new FormControl(
          this.data.fl_dichiarazione_sanzioni_penali,
          Validators.required
        )
      );
      this.form.addControl('jconon_application:fl_dichiarazione_dati_personali', new FormControl(
          this.data.fl_dichiarazione_dati_personali,
          Validators.required
        )
      );
      super.ngOnInit();
    }
    
    onChangeToggle(reset: boolean){      
    }
}