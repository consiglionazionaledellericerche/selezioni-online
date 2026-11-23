import { CallSectionFields } from '../../core/call/call-section-fields';
import { CallBulkinfoService } from '../../core/call/call-bulkinfo.service';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DynamicComponent } from '../dynamic.component';
import { Call } from '../../core/call/call.model';
import { CacheService } from '../../core/cache.service';
import { CallService } from '../../core/call/call.service';
import { ObjectTypeService } from '../../core/object-type.service';
import { Helpers } from '../../common/helpers/helpers';
import { ASPECT_CONTROL_PREFIX, CallManagementCache, ManageCallService } from '../../core/call/manage-call.service';

export const ASPECT_MACRO_CALL = 'P:jconon_call:aspect_macro_call';

/**
 * Converte i valori booleani che il modello salva come testo ('true'/'false').
 */
export function toBoolean(value: any): boolean {
  return value === true || value === 'true';
}

export function hasAspect(call: Call, aspect: string): boolean {
  return !!(call && call.secondaryObjectTypeIds && call.secondaryObjectTypeIds.indexOf(aspect) !== -1);
}

/**
 * Sezione II del bando (ex affix_sezione_2 di cool-jconon): macro-bando, sezioni e campi della domanda,
 * stampe da allegare, sollecito, accesso SPID, blocco dell'invio, schede di valutazione e pagoPA.
 */
@Component({
  standalone: false,
    selector: 'affix_tabCallSettings',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded() && lists" class="call-section-form">
        <fieldset class="form-block">
          <legend class="form-block-title">{{ 'call_manage.block.application_structure' | translate }}</legend>
          <div class="row g-3">
            <div class="col-12" *ngIf="section.shows('aspect_macro_call')">
              <app-control-toggle [inline]="true" [label]="'label.jconon_call.aspect_macro_call' | translate"
                [formControlName]="macroControl"></app-control-toggle>
            </div>
            <ng-container *ngIf="isBandoMultiplo()">
              <div class="form-group col-md-4">
                <app-control-text type="number" [inline]="true" [showValidation]="true"
                  [label]="'label.jconon_call.numero_max_domande' | translate" formControlName="jconon_call:numero_max_domande"></app-control-text>
              </div>
              <div class="form-group col-md-8">
                <app-control-text [inline]="true" [label]="'label.jconon_call.group_multiple_application' | translate"
                  formControlName="jconon_call:group_multiple_application"></app-control-text>
              </div>
            </ng-container>
            <div class="form-group col-12" *ngIf="section.shows('jconon_call:elenco_sezioni_domanda')">
              <app-control-select-model [inline]="true" [multiple]="true" [labelactive]="'true'"
                [label]="'label.jconon_call.elenco_sezioni_domanda' | translate" [strings]="sezioniKeys"
                formControlName="jconon_call:elenco_sezioni_domanda"></app-control-select-model>
            </div>
            <div class="form-group col-12" *ngIf="section.shows('jconon_call:elenco_field_not_required')">
              <app-control-select-model [inline]="true" [multiple]="true" [labelactive]="'true'"
                [label]="'label.jconon_call.elenco_field_not_required' | translate" [strings]="fieldsKeys"
                formControlName="jconon_call:elenco_field_not_required"></app-control-select-model>
            </div>
            <div class="form-group col-12" *ngIf="lingue && section.shows('jconon_call:elenco_lingue_da_conoscere')">
              <app-control-select-model [inline]="true" [multiple]="true" [labelactive]="'true'"
                [label]="'label.jconon_call.elenco_lingue_da_conoscere' | translate" [strings]="lingue"
                formControlName="jconon_call:elenco_lingue_da_conoscere"></app-control-select-model>
            </div>
          </div>
        </fieldset>

        <fieldset class="form-block">
          <legend class="form-block-title">{{ 'call_manage.block.options' | translate }}</legend>
          <div class="row g-3">
            <ng-container *ngFor="let flag of flags"><div class="col-lg-6" *ngIf="section.shows('jconon_call:' + flag)">
              <app-control-toggle [inline]="true" [label]="'label.jconon_call.' + flag | translate"
                [formControlName]="'jconon_call:' + flag"></app-control-toggle>
            </div></ng-container>
          </div>
        </fieldset>

        <fieldset class="form-block">
          <legend class="form-block-title">{{ 'call_manage.block.reminder_payment' | translate }}</legend>
          <div class="row g-3">
            <div class="form-group col-md-6" *ngIf="section.shows('jconon_call:num_giorni_mail_sollecito')">
              <app-control-text type="number" [inline]="true" [showValidation]="true"
                [label]="'label.jconon_call.num_giorni_mail_sollecito' | translate" formControlName="jconon_call:num_giorni_mail_sollecito"></app-control-text>
            </div>
            <div class="form-group col-md-6" *ngIf="isChecked('pagamento_pagopa')">
              <app-control-text type="number" [inline]="true" [showValidation]="true"
                [label]="'label.jconon_call.importo_pagamento_pagopa' | translate" formControlName="jconon_call:importo_pagamento_pagopa"></app-control-text>
            </div>
            <div class="form-group col-12" *ngIf="isChecked('blocco_invio_domande')">
              <app-control-textarea [inline]="true" [rows]="3" [label]="'label.jconon_call.blocco_invio_domande_message' | translate"
                formControlName="jconon_call:blocco_invio_domande_message"></app-control-textarea>
            </div>
          </div>
        </fieldset>
      </form>
    `
  })
export class JcononAffixCallSettingsComponent extends DynamicComponent<Call> {

    public macroControl = ASPECT_CONTROL_PREFIX + ASPECT_MACRO_CALL;
    public flags = [
      'print_dic_sost',
      'print_trattamento_dati_personali',
      'only_user_spid_can_submit_application',
      'blocco_invio_domande',
      'scheda_valutazione',
      'pagamento_pagopa'
    ];
    public lists: CallManagementCache;
    public lingue: string[];
    public sezioniKeys: string[] = [];
    public fieldsKeys: string[] = [];

    /** Campi mostrati: tutti, oppure quelli del bulkinfo affix_sezione_2 dell'installazione. */
    public readonly section = new CallSectionFields();
    private readonly bulkinfoService = inject(CallBulkinfoService);

    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
      protected callService: CallService,
      protected objectTypeService: ObjectTypeService,
      protected manageCallService: ManageCallService
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      super.ngOnInit();
      this.section.load(this.bulkinfoService, this.data.objectTypeId, 'affix_sezione_2', this.changeDetectorRef);
      const data: any = this.data;
      this.manageCallService.callManagementCache().subscribe(lists => {
        this.sezioniKeys = this.keys(lists.jsonlistAffixApplication);
        this.fieldsKeys = this.keys(lists.jsonlistApplicationFieldsNotRequired);
        this.lists = lists;
      });
      this.objectTypeService.listChoice('P:jconon_call:aspect_lingue_da_conoscere', 'jconon_call:elenco_lingue_da_conoscere')
        .subscribe(choice => this.lingue = choice, () => this.lingue = undefined);

      this.form.addControl(this.macroControl, new FormControl(hasAspect(this.data, ASPECT_MACRO_CALL)));
      this.form.addControl('jconon_call:numero_max_domande',
        new FormControl(this.data.numero_max_domande, [Helpers.patternValidator(/^[0-9]*$/, { onlyNumber: true })]));
      this.form.addControl('jconon_call:group_multiple_application', new FormControl(data.group_multiple_application));
      this.form.addControl('jconon_call:elenco_sezioni_domanda', new FormControl(this.data.elenco_sezioni_domanda || []));
      this.form.addControl('jconon_call:elenco_field_not_required', new FormControl(this.data.elenco_field_not_required || []));
      this.form.addControl('jconon_call:elenco_lingue_da_conoscere', new FormControl(data.elenco_lingue_da_conoscere || []));
      this.flags.forEach(flag => this.form.addControl('jconon_call:' + flag, new FormControl(toBoolean(data[flag]))));
      this.form.addControl('jconon_call:num_giorni_mail_sollecito',
        new FormControl(this.data.num_giorni_mail_sollecito, [Helpers.patternValidator(/^[0-9]*$/, { onlyNumber: true })]));
      this.form.addControl('jconon_call:importo_pagamento_pagopa',
        new FormControl(data.importo_pagamento_pagopa, [Validators.min(0)]));
      this.form.addControl('jconon_call:blocco_invio_domande_message', new FormControl(this.data.blocco_invio_domande_message));
    }

    public keys(list: any[]): string[] {
      return (list || []).map(item => item.key);
    }

    public isBandoMultiplo(): boolean {
      return this.form.controls[this.macroControl].value;
    }

    public isChecked(flag: string): boolean {
      return toBoolean(this.form.controls['jconon_call:' + flag].value);
    }
}
