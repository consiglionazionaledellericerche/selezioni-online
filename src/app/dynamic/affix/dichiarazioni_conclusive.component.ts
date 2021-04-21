import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { AffixComponent } from './affix.component';

@Component({
    selector: 'affix_tabDichiarazioniConclusive',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" class="pb-2">
        <div class="form-row">
          <app-control-toggle
            divToggleClass="d-flex border-bottom-0"
            labelClass="text-dark c-pointer text-justify" 
            [label]="'label.jconon_application.fl_dichiarazione_sanzioni_penali' | translate" 
            formControlName="jconon_application:fl_dichiarazione_sanzioni_penali">
          </app-control-toggle>
        </div>  
        <div class="form-row">
          <app-control-toggle
            divToggleClass="d-flex border-bottom-0" 
            labelClass="text-dark c-pointer text-justify"
            [label]="'label.jconon_application.fl_dichiarazione_dati_personali' | translate" 
            formControlName="jconon_application:fl_dichiarazione_dati_personali">
          </app-control-toggle>
        </div>
      </form>
    `
  })
export class JcononAffixDichiarazioniConclusiveComponent extends AffixComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      super.ngOnInit();
      this.form.addControl('jconon_application:fl_dichiarazione_sanzioni_penali', new FormControl(
          this.data.fl_dichiarazione_sanzioni_penali,
          Validators.requiredTrue
        )
      );
      this.form.addControl('jconon_application:fl_dichiarazione_dati_personali', new FormControl(
          this.data.fl_dichiarazione_dati_personali,
          Validators.requiredTrue
        )
      );
    }
}
