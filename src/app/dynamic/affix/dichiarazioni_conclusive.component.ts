import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CallSectionFields } from '../../core/call/call-section-fields';
import { CallBulkinfoService } from '../../core/call/call-bulkinfo.service';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { AffixComponent } from './affix.component';

@Component({
  standalone: false,
    selector: 'affix_tabDichiarazioniConclusive',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" class="pb-2">
        <div class="row gx-2" *ngIf="section.shows('jconon_application:fl_dichiarazione_sanzioni_penali')">
          <app-control-toggle
            divToggleClass="d-flex border-bottom-0"
            labelClass="text-dark c-pointer text-justify" 
            [label]="'label.jconon_application.fl_dichiarazione_sanzioni_penali' | translate" 
            formControlName="jconon_application:fl_dichiarazione_sanzioni_penali">
          </app-control-toggle>
        </div>  
        <div class="row gx-2" *ngIf="section.shows('jconon_application:fl_dichiarazione_dati_personali')">
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
    /**
     * Dichiarazioni previste: tutte, oppure (BRAND.callSectionsFromBulkinfo) quelle del form
     * affix_tabDichiarazioniConclusive del bulkinfo della domanda (es. Lincei senza la dichiarazione sui dati personali).
     */
    public readonly section = new CallSectionFields();
    private readonly bulkinfoService = inject(CallBulkinfoService);

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
      // dopo aver creato i controlli (la risposta del bulkinfo può arrivare subito, se già letta): le dichiarazioni
      // non previste dal bulkinfo si tolgono dal form, così non vengono né controllate né inviate
      this.section.load(this.bulkinfoService, 'F:jconon_application:folder', 'affix_tabDichiarazioniConclusive',
        this.changeDetectorRef, () => ['jconon_application:fl_dichiarazione_sanzioni_penali',
          'jconon_application:fl_dichiarazione_dati_personali']
          .filter(property => !this.section.shows(property))
          .forEach(property => this.form.removeControl(property)));
    }
}
