import { CallSectionFields } from '../../core/call/call-section-fields';
import { CallBulkinfoService } from '../../core/call/call-bulkinfo.service';
import { BRAND } from '../../../brand/brand';
import { AuthService } from '../../auth/auth.service';
import { ManageCallService } from '../../core/call/manage-call.service';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { Helpers } from '../../common/helpers/helpers';
import { CallService } from '../../core/call/call.service';
import { Select2Template } from '../../common/template/select2-template';
import { Call } from '../../core/call/call.model';
import { DynamicComponent } from '../dynamic.component';
import { ObjectTypeService } from '../../core/object-type.service';
import { Sede } from '../../common/model/sede.model';

@Component({
  standalone: false,
    selector: 'affix_tabCallDetail',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" class="call-detail-form">
        <div class="d-flex justify-content-end english-toggle">
          <app-control-toggle [inline]="true" [label]="'label.jconon_call.english_call_toggle' | translate"
            formControlName="english_call_toggle"></app-control-toggle>
        </div>

        <fieldset class="form-block">
          <legend class="form-block-title">{{ 'call_manage.block.identification' | translate }}</legend>
          <div class="row g-3">
            <div class="form-group col-md-8 col-lg-4">
              <app-control-text type="text" [inline]="true" [showValidation]="true" [label]="'label.jconon_call.codice' | translate"
                formControlName="jconon_call:codice"></app-control-text>
            </div>
            <div class="form-group col-md-4 col-lg-2">
              <app-control-text type="number" [inline]="true" [showValidation]="true" [label]="'label.jconon_call.numero_posti' | translate"
                formControlName="jconon_call:numero_posti"></app-control-text>
            </div>
            <div *ngIf="!data.isDirector() && shows('jconon_call:profilo')" class="form-group col-lg-6">
              <app-control-select-model [inline]="true" [label]="'label.jconon_call.profilo' | translate" [labelactive]="'true'"
                [strings]="profiles" [showValidation]="true" [allowClear]="true"
                [placeholder]="'label.jconon_call.profilo_placeholder' | translate" formControlName="jconon_call:profilo">
              </app-control-select-model>
            </div>
            <div *ngIf="shows('jconon_call:elenco_tipo_selezione')" class="form-group" [ngClass]="data.isDirector() ? 'col-lg-6' : 'col-12'">
              <app-control-select-model [inline]="true" [label]="'label.jconon_call.elenco_tipo_selezione' | translate" [labelactive]="'true'"
                [multiple]="true" [strings]="selectionTypes" [showValidation]="true"
                [placeholder]="'label.jconon_call.elenco_tipo_selezione_placeholder' | translate" formControlName="jconon_call:elenco_tipo_selezione">
              </app-control-select-model>
            </div>
          </div>
          <!-- campi in più dell'installazione (es. disciplina dei bandi Lincei), vedi src/brand -->
          <app-aspect-generic *ngIf="extraForm" [data]="data" [form]="form" [aspectType]="data.objectTypeId"
            [formName]="extraForm" [handledProperties]="handledProperties()" aspectMode="call"></app-aspect-generic>
        </fieldset>

        <fieldset class="form-block">
          <legend class="form-block-title">{{ 'call_manage.block.texts' | translate }}</legend>
          <div class="row g-3">
          <div class="form-group" [ngClass]="isEnglishCallToggle() ? 'col-lg-6' : 'col-12'">
            <app-control-ckeditor [inline]="true" [label]="'label.jconon_call.descrizione' | translate" formControlName="jconon_call:descrizione"></app-control-ckeditor>
          </div>
          <div *ngIf="isEnglishCallToggle()" class="form-group col-lg-6">
            <app-control-ckeditor [inline]="true" [label]="'label.jconon_call.descrizione_en' | translate" formControlName="jconon_call:descrizione_en"></app-control-ckeditor>
          </div>
          <div class="form-group" [ngClass]="isEnglishCallToggle() ? 'col-lg-6' : 'col-12'">
            <app-control-ckeditor [inline]="true" [label]="'label.jconon_call.descrizione_ridotta' | translate" formControlName="jconon_call:descrizione_ridotta"></app-control-ckeditor>
          </div>
          <div *ngIf="isEnglishCallToggle()" class="form-group col-lg-6">
            <app-control-ckeditor [inline]="true" [label]="'label.jconon_call.descrizione_ridotta_en' | translate" formControlName="jconon_call:descrizione_ridotta_en"></app-control-ckeditor>
          </div>
          </div>
        </fieldset>

        <fieldset class="form-block">
          <legend class="form-block-title">{{ 'call_manage.block.place' | translate }}</legend>
          <div class="row g-3">
            <div class="form-group col-12" *ngIf="sedi.length > 0 && shows('jconon_call:sede_id')">
              <app-control-select-model [inline]="true" [label]="'label.jconon_call.sede_id' | translate" [labelactive]="'true'"
                (onChangeEvent)="onChangeSede($event)" [items]="sedi" [showValidation]="true" [allowClear]="true"
                [placeholder]="'label.jconon_call.sede_id_placeholder' | translate" formControlName="jconon_call:sede_id">
              </app-control-select-model>
            </div>
            <div class="form-group col-lg-6">
              <app-control-text type="text" [inline]="true" [labelactive]="true" [disabled]="sedi.length > 0 && !canEditPlace"
                [label]="'label.jconon_call.struttura_destinataria' | translate" formControlName="jconon_call:struttura_destinataria"></app-control-text>
            </div>
            <div class="form-group col-lg-6">
              <app-control-text type="text" [inline]="true" [labelactive]="true" [disabled]="sedi.length > 0 && !canEditPlace"
                [label]="'label.jconon_call.sede' | translate" formControlName="jconon_call:sede"></app-control-text>
            </div>
            <ng-container *ngIf="isEnglishCallToggle()">
              <div class="form-group col-lg-6">
                <app-control-text type="text" [inline]="true" [label]="'label.jconon_call.struttura_destinataria_en' | translate"
                  formControlName="jconon_call:struttura_destinataria_en"></app-control-text>
              </div>
              <div class="form-group col-lg-6">
                <app-control-text type="text" [inline]="true" [label]="'label.jconon_call.sede_en' | translate"
                  formControlName="jconon_call:sede_en"></app-control-text>
              </div>
            </ng-container>
          </div>
        </fieldset>

        <fieldset class="form-block">
          <legend class="form-block-title">{{ 'call_manage.block.requirements' | translate }}</legend>
          <div class="row g-3">
          <div class="form-group" [ngClass]="isEnglishCallToggle() ? 'col-lg-6' : 'col-12'">
            <app-control-text type="text" [inline]="true" [label]="'label.jconon_call.requisiti_link' | translate"  formControlName="jconon_call:requisiti_link"></app-control-text>
          </div>
          <div *ngIf="isEnglishCallToggle()" class="form-group col-lg-6">
            <app-control-text type="text" [inline]="true" [label]="'label.jconon_call.requisiti_link_en' | translate"  formControlName="jconon_call:requisiti_link_en"></app-control-text>
          </div>
          <div class="form-group" [ngClass]="isEnglishCallToggle() ? 'col-lg-6' : 'col-12'">
            <app-control-ckeditor [inline]="true" [label]="'label.jconon_call.requisiti' | translate" formControlName="jconon_call:requisiti"></app-control-ckeditor>
          </div>
          <div *ngIf="isEnglishCallToggle()" class="form-group col-lg-6">
            <app-control-ckeditor [inline]="true" [label]="'label.jconon_call.requisiti_en' | translate" formControlName="jconon_call:requisiti_en"></app-control-ckeditor>
          </div>
          </div>
        </fieldset>

        <fieldset class="form-block">
          <legend class="form-block-title">{{ 'call_manage.block.period' | translate }}</legend>
          <div class="row g-3">
            <div class="col-12" *ngIf="data.pubblicato">
              <p class="small text-secondary mb-0">{{ 'call_manage.dates.published_info' | translate }}</p>
            </div>
            <div class="form-group col-md-6">
              <app-control-datepicker [time]="true" [inline]="true" [label]="'label.jconon_call.data_inizio_invio_domande' | translate"
                formControlName="jconon_call:data_inizio_invio_domande"></app-control-datepicker>
              <div class="effective-date" *ngIf="data.data_inizio_invio_domande">
                {{ 'call_manage.dates.effective' | translate }} <strong>{{ data.data_inizio_invio_domande | date:'dd/MM/yyyy HH:mm' }}</strong>
                <span *ngIf="changed(data.data_inizio_invio_domande_initial, data.data_inizio_invio_domande)" class="badge rounded-pill bg-warning text-dark ms-1">{{ 'call_manage.dates.extended' | translate }}</span>
              </div>
            </div>
            <div class="form-group col-md-6">
              <app-control-datepicker [time]="true" [inline]="true" [label]="'label.jconon_call.data_fine_invio_domande' | translate"
                formControlName="jconon_call:data_fine_invio_domande"></app-control-datepicker>
              <div class="effective-date" *ngIf="data.data_fine_invio_domande">
                {{ 'call_manage.dates.effective' | translate }} <strong>{{ data.data_fine_invio_domande | date:'dd/MM/yyyy HH:mm' }}</strong>
                <span *ngIf="changed(data.data_fine_invio_domande_initial, data.data_fine_invio_domande)" class="badge rounded-pill bg-warning text-dark ms-1">{{ 'call_manage.dates.extended' | translate }}</span>
              </div>
            </div>
          </div>
        </fieldset>
      </form>
    `
  })
export class JcononAffixCallDetailComponent extends DynamicComponent<Call> {
    public comuniTemplate = Select2Template.comuni;
    public profiles: string[];
    public selectionTypes: string[];
    public sedi: Sede[] = [];
    public sediLabel: string[];

    constructor(
      protected cacheService: CacheService,
      protected objectTypeService: ObjectTypeService,
      protected changeDetectorRef: ChangeDetectorRef,
      protected callService: CallService,
      protected manageCallService: ManageCallService,
      protected authService: AuthService,
    ) {
      super(cacheService, changeDetectorRef);
    }

    /**
     * Sedi selezionabili come nel legacy (ui.gestorisedi): per i gestori limitati ad alcune sedi solo quelle abilitate
     * per la tipologia di bando (più quella già scelta, se non è tra queste); altrimenti tutte le sedi attive.
     */
    /** Campi in più dell'installazione (form del bulkinfo, vedi src/brand). */
    public readonly extraForm = BRAND.callExtraForms.detail;
    private handled: string[];

    /** Campi mostrati: tutti, oppure quelli del bulkinfo affix_sezione_1 dell'installazione, meno callDetailHidden. */
    public readonly section = new CallSectionFields(BRAND.callDetailHidden || []);
    private readonly bulkinfoService = inject(CallBulkinfoService);

    public shows(property: string): boolean {
      return this.section.shows(property);
    }

    /** Proprietà già gestite da questa sezione: il componente generico non le ripete. */
    handledProperties(): string[] {
      if (!this.handled) {
        this.handled = Object.keys(this.form.controls).filter(key => !key.startsWith('aspect:'))
          .concat(BRAND.callDetailHidden || []);
      }
      return this.handled;
    }

    /** Amministratori e gruppo CONCORSI: sede facoltativa e sede di lavoro/struttura modificabili a mano. */
    public get canEditPlace(): boolean {
      return ManageCallService.isConcorsi(this.authService.getUser());
    }

    private loadSedi(): void {
      if (!this.shows('jconon_call:sede_id')) {
        this.sedi = [];
        this.sediLabel = [];
        return;
      }
      const show = (sedi: Sede[]) => {
        this.sedi = sedi;
        this.sediLabel = sedi.map((sede: Sede) => sede.label);
        // senza elenco delle sedi il campo non compare: non può essere obbligatorio
        const control = this.form.controls['jconon_call:sede_id'];
        if (control && !sedi.length) {
          control.clearValidators();
          control.updateValueAndValidity({ emitEvent: false });
        }
        this.changeDetectorRef.markForCheck();
      };
      this.manageCallService.managersSedi(this.data.objectTypeId).subscribe(result => {
        if (!result?.restricted) {
          this.cacheService.sedi('true').subscribe(show);
          return;
        }
        const enabled = (result.sedi || []).map((s: any) => new Sede(s.sedeId, s.label, s.citta, s.descrizione));
        const current = this.data.sede_id;
        if (current && !enabled.some(s => s.sedeId === current)) {
          this.cacheService.sedi('false').subscribe(all => show(enabled.concat(all.filter(s => s.sedeId === current))));
        } else {
          show(enabled);
        }
      }, () => this.cacheService.sedi('true').subscribe(show));
    }

    ngOnInit(): void {
      super.ngOnInit();
      // sede prescelta non prevista dal bulkinfo dell'installazione: non obbligatoria
      this.section.load(this.bulkinfoService, this.data.objectTypeId, 'affix_sezione_1', this.changeDetectorRef, () => {
        const sede = this.form.controls['jconon_call:sede_id'];
        if (sede && !this.shows('jconon_call:sede_id')) {
          sede.clearValidators();
          sede.updateValueAndValidity({ emitEvent: false });
        }
      });
      this.objectTypeService.listChoice('P:jconon_call:aspect_inquadramento','jconon_call:profilo').subscribe((choice) => {
        this.profiles = choice;
      });
      this.objectTypeService.listChoice('P:jconon_call:aspect_tipo_selezione','jconon_call:elenco_tipo_selezione').subscribe((choice) => {
        this.selectionTypes = choice;
      });
      this.loadSedi();

      this.form.addControl('english_call_toggle', 
        new FormControl(this.data.isDirector()));

      this.form.addControl('jconon_call:codice', 
        new FormControl(this.data.codice, Validators.required));
      this.form.addControl('jconon_call:numero_posti', 
        new FormControl(this.data.numero_posti, [Validators.required, Helpers.patternValidator(/^[0-9]*$/, { onlyNumber: true })]));
      this.form.addControl('jconon_call:descrizione', 
        new FormControl(this.data.descrizione, Validators.required));
      this.form.addControl('jconon_call:descrizione_en', 
        new FormControl(this.data.descrizione_en));
      this.form.addControl('jconon_call:descrizione_ridotta', 
        new FormControl(this.data.descrizione_ridotta));
      this.form.addControl('jconon_call:descrizione_ridotta_en', 
        new FormControl(this.data.descrizione_ridotta_en));
      // obbligatoria tranne che per amministratori e gruppo CONCORSI (controllo anche nel backend)
      this.form.addControl('jconon_call:sede_id', 
        new FormControl(this.data.sede_id, this.canEditPlace || !this.shows('jconon_call:sede_id') ? null : Validators.required));

      this.form.addControl('jconon_call:struttura_destinataria', 
        new FormControl(this.data.struttura_destinataria||''));
      this.form.addControl('jconon_call:struttura_destinataria_en', 
        new FormControl(this.data.struttura_destinataria_en));
      this.form.addControl('jconon_call:sede', 
        new FormControl(this.data.sede));
      this.form.addControl('jconon_call:sede_en', 
        new FormControl(this.data.sede_en));

      if (!this.data.isDirector()) {
        this.form.addControl('jconon_call:profilo', new FormControl(this.data.profilo));
      }
      this.form.addControl('jconon_call:elenco_tipo_selezione', 
        new FormControl(this.data.elenco_tipo_selezione));
      this.form.addControl('jconon_call:requisiti_link', 
        new FormControl(this.data.requisiti_link));
      this.form.addControl('jconon_call:requisiti_link_en', 
        new FormControl(this.data.requisiti_link_en));

      this.form.addControl('jconon_call:requisiti', 
        new FormControl(this.data.requisiti, Validators.required));
      this.form.addControl('jconon_call:requisiti_en', 
        new FormControl(this.data.requisiti_en));
      // si modificano le date iniziali (jconon_call:data_*_invio_domande): il backend le copia nelle effettive
      // (_index) finché il bando non è pubblicato; dopo la pubblicazione le effettive cambiano solo con le proroghe
      this.form.addControl('jconon_call:data_inizio_invio_domande',
        new FormControl({ value: this.data.data_inizio_invio_domande_initial || this.data.data_inizio_invio_domande, disabled: !!this.data.pubblicato }));
      this.form.addControl('jconon_call:data_fine_invio_domande',
        new FormControl({ value: this.data.data_fine_invio_domande_initial || this.data.data_fine_invio_domande, disabled: !!this.data.pubblicato }));
    }

    public isEnglishCallToggle(): boolean {
      return this.form.controls['english_call_toggle'].value;      
    }

    public onChangeSede(sede: Sede) {
      this.form.controls['jconon_call:struttura_destinataria'].patchValue(sede ? sede.citta : '');
      this.form.controls['jconon_call:sede'].patchValue(sede ? sede.descrizione : '');
    }


  /** La data effettiva è diversa da quella iniziale (proroga o riapertura). */
  changed(initial: Date, effective: Date): boolean {
    return !!initial && !!effective && new Date(initial).getTime() !== new Date(effective).getTime();
  }
}  
