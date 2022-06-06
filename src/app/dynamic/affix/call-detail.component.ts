import { ChangeDetectorRef, Component } from '@angular/core';
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
    selector: 'affix_tabCallDetail',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <div class="form-row pb-2">
          <div class="form-group col-md-4">
            <app-control-text 
              type="text" 
              [focus]="true"
              [inline]="true" 
              [label]="'label.jconon_call.codice'| translate" 
              formControlName="jconon_call:codice">
            </app-control-text>
          </div>
          <div class="form-group col-md-2">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_call.numero_posti'| translate" 
              formControlName="jconon_call:numero_posti">
            </app-control-text>
          </div>
          <div class="form-group col-md-6 pb-5 mt-n3">
            <app-control-toggle
              class="it-right-zone w-100 border-bottom-3" 
              [label]="'label.jconon_call.english_call_toggle' | translate" 
              formControlName="english_call_toggle">
            </app-control-toggle>
          </div>
        </div>
        <div class="form-row pb-2">
          <div class="form-group col-md-6">
            <app-control-ckeditor 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_call.descrizione'| translate" 
              formControlName="jconon_call:descrizione">
            </app-control-ckeditor>
          </div>
          <div *ngIf="isEnglishCallToggle()" class="form-group col-md-6">
            <app-control-ckeditor 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_call.descrizione_en'| translate" 
              formControlName="jconon_call:descrizione_en">
            </app-control-ckeditor>
          </div>
          <div class="form-group col-md-6">
            <app-control-ckeditor 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_call.descrizione_ridotta'| translate" 
              formControlName="jconon_call:descrizione_ridotta">
            </app-control-ckeditor>
          </div>
          <div *ngIf="isEnglishCallToggle()" class="form-group col-md-6">
            <app-control-ckeditor 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_call.descrizione_ridotta_en'| translate" 
              formControlName="jconon_call:descrizione_ridotta_en">
            </app-control-ckeditor>
          </div>
        </div>
        <div class="form-row pb-2">
          <div *ngIf="!data.isDirector()" class="form-group col-md-4">
            <app-control-select-model
              [inline]="true"
              [label]="'label.jconon_call.profilo'| translate"
              [labelactive]="'true'"
              [strings]="profiles"
              [showValidation]="true"
              [allowClear]="true"
              [placeholder]="'label.jconon_call.profilo_placeholder'| translate"
              formControlName="jconon_call:profilo">
            </app-control-select-model>
          </div>
          <div class="form-group col-md-2">
            <app-control-text 
              type="text" 
              [inline]="true"
              [labelactive]="sedi.length > 0"
              [disabled]="sedi.length > 0"
              [label]="'label.jconon_call.struttura_destinataria'| translate" 
              formControlName="jconon_call:struttura_destinataria">
            </app-control-text>
          </div>
          <div *ngIf="isEnglishCallToggle()" class="form-group col-md-2">
            <app-control-text 
              type="text" 
              [inline]="true"
              [label]="'label.jconon_call.struttura_destinataria_en'| translate" 
              formControlName="jconon_call:struttura_destinataria_en">
            </app-control-text>
          </div>
          <div class="form-group" [ngClass]="{'col-md-6': !data.isDirector(), 'col-md-4': data.isDirector()}">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [labelactive]="sedi.length > 0"
              [disabled]="sedi.length > 0"
              [label]="'label.jconon_call.sede'| translate" 
              formControlName="jconon_call:sede">
            </app-control-text>
          </div>
          <div *ngIf="isEnglishCallToggle()" class="form-group" [ngClass]="{'col-md-6': !data.isDirector(), 'col-md-4': data.isDirector()}">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_call.sede_en'| translate" 
              formControlName="jconon_call:sede_en">
            </app-control-text>
          </div>
          <div class="form-group" *ngIf="sedi.length > 0" [ngClass]="{'col-md-6': !isEnglishCallToggle(), 'col-md-12': isEnglishCallToggle()||!data.isDirector()}">
            <app-control-select-model              
              [inline]="true"
              [label]="'label.jconon_call.sede_id'| translate"
              [labelactive]="'true'"
              (onChangeEvent)="onChangeSede($event)"
              [items]="sedi"
              [showValidation]="true"
              [allowClear]="true"
              [placeholder]="'label.jconon_call.sede_id_placeholder'| translate"
              formControlName="jconon_call:sede_id">
            </app-control-select-model>
          </div>          
        </div>
        <div class="form-row pb-2">
          <div class="form-group col-md-6">
            <app-control-select-model
              [inline]="true"
              [label]="'label.jconon_call.elenco_tipo_selezione'| translate"
              [labelactive]="'true'"
              [multiple]="true"
              [popoverMulti]="true"
              [strings]="selectionTypes"
              [showValidation]="true"
              [allowClear]="true"
              [placeholder]="'label.jconon_call.elenco_tipo_selezione_placeholder'| translate"
              formControlName="jconon_call:elenco_tipo_selezione">
            </app-control-select-model>
          </div>
          <div class="form-group" [ngClass]="{'col-md-6': !isEnglishCallToggle(), 'col-md-3': isEnglishCallToggle()}">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_call.requisiti_link'| translate" 
              formControlName="jconon_call:requisiti_link">
            </app-control-text>
          </div>
          <div *ngIf="isEnglishCallToggle()" class="form-group col-md-3">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_call.requisiti_link_en'| translate" 
              formControlName="jconon_call:requisiti_link_en">
            </app-control-text>
          </div>
        </div>
        <div class="form-row pb-2">
          <div class="form-group" [ngClass]="{'col-md-12': !isEnglishCallToggle(), 'col-md-6': isEnglishCallToggle()}">
            <app-control-ckeditor 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_call.requisiti'| translate" 
              formControlName="jconon_call:requisiti">
            </app-control-ckeditor>
          </div>
          <div *ngIf="isEnglishCallToggle()" class="form-group col-md-6">
            <app-control-ckeditor 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_call.requisiti_en'| translate" 
              formControlName="jconon_call:requisiti_en">
            </app-control-ckeditor>
          </div>
        </div>
        <div class="form-row pb-2">
          <div class="form-group col-md-12 col-lg-6 col-xl-4">
            <app-control-datepicker
                type="text"
                [time]="true"
                [inline]="false" 
                [label]="'label.jconon_call.data_inizio_invio_domande' | translate"
                formControlName="jconon_call:data_inizio_invio_domande_index">
            </app-control-datepicker>
          </div>        
          <div class="form-group col-md-12 col-lg-6 col-xl-4">
            <app-control-datepicker
                type="text"
                [time]="true"
                [inline]="false" 
                [label]="'label.jconon_call.data_fine_invio_domande' | translate"
                formControlName="jconon_call:data_fine_invio_domande_index">
            </app-control-datepicker>
          </div>        
        </div>        
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
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      super.ngOnInit();
      this.objectTypeService.listChoice('P:jconon_call:aspect_inquadramento','jconon_call:profilo').subscribe((choice) => {
        this.profiles = choice;
      });
      this.objectTypeService.listChoice('P:jconon_call:aspect_tipo_selezione','jconon_call:elenco_tipo_selezione').subscribe((choice) => {
        this.selectionTypes = choice;
      });
      this.cacheService.sedi('true').subscribe((sedi) => {
        this.sedi = sedi;
        this.sediLabel = sedi.map((sede: Sede) => {
          return sede.label;
        })
      });

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
      this.form.addControl('jconon_call:sede_id', 
        new FormControl(this.data.sede_id));

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
      this.form.addControl('jconon_call:data_inizio_invio_domande_index', 
        new FormControl(this.data.data_inizio_invio_domande));
      this.form.addControl('jconon_call:data_fine_invio_domande_index', 
        new FormControl(this.data.data_fine_invio_domande));
    }

    public isEnglishCallToggle(): boolean {
      return this.form.controls['english_call_toggle'].value;      
    }

    public onChangeSede(sede: Sede) {
      this.form.controls['jconon_call:struttura_destinataria'].patchValue(sede ? sede.citta : '');
      this.form.controls['jconon_call:sede'].patchValue(sede ? sede.descrizione : '');
    }

}  
