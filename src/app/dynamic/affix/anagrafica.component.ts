import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { Comune } from '../../common/model/comune.model';
import { Helpers } from '../../common/helpers/helpers';
import { AffixComponent } from './affix.component';
import { CallService } from '../../core/call/call.service';
import { Select2Template } from '../../common/template/select2-template';

@Component({
    selector: 'affix_tabAnagrafica',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <div class="form-row">
          <div class="form-group col-md-6">
            <label class="form-label active">{{'label.jconon_application.firstname' | translate}}</label>
            <input class="form-control" id="jconon_application:nome" type="text" formControlName="jconon_application:nome" />
          </div>
          <div class="form-group col-md-6">
            <label class="form-label active">{{'label.jconon_application.lastname' | translate}}</label>
            <input class="form-control" id="jconon_application:cognome" type="text" formControlName="jconon_application:cognome" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-3">
            <app-control-select-model
              [inline]="true"
              [focus]="true"
              [label]="'label.jconon_application.nazione_nascita'| translate"
              [labelactive]="'true'"
              [strings]="paesi"
              [showValidation]="true"
              [allowClear]="true"
              [showValidation]="true"
              [placeholder]="'placeholder.select.country'| translate"
              (onChangeEvent)="onChangeNazioneNascita()"
              formControlName="jconon_application:nazione_nascita">
            </app-control-select-model>
          </div>
          <div *ngIf="isForeign()" class="form-group col-md-6">
            <app-control-text 
              *ngIf="isForeign()" 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_application.luogo_nascita'| translate" 
              formControlName="jconon_application:comune_nascita">
            </app-control-text>
          </div>
          <div [hidden]="isForeign()" class="form-group col-md-5">
            <app-control-select-model
              *ngIf="!isForeign()"
              [term]="''"
              [template]="comuniTemplate"
              [path]="callService.getComuniMapping()"
              [label]="'label.jconon_application.comune_nascita'| translate"
              [labelactive]="'true'"
              (onChangeEvent)="onChangeComune($event)"
              [inline]="'false'"
              [resultName]="'comuni'"
              [allowClear]="'true'"
              [placeholder]="'placeholder.select.place'| translate"
              formControlName="jconon_application:comune_nascita">
            </app-control-select-model>
          </div>
          <div *ngIf="!isForeign()" class="form-group col-md-1">
            <label class="form-label active">{{'label.jconon_application.provincia_nascita' | translate}}</label>
            <input 
              class="form-control" 
              id="jconon_application:provincia_nascita" 
              type="text"
              readonly               
              formControlName="jconon_application:provincia_nascita" />
          </div>
          <div class="form-group col-md-3">
            <app-control-datepicker
                type="text"
                [inline]="true" 
                [label]="'user.dataDiNascita'| translate" 
                formControlName="jconon_application:data_nascita">
            </app-control-datepicker>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-3">
            <div class="form-check form-check-inline">
              <input formControlName="jconon_application:sesso" type="radio" id="radiomale" value="M">
              <label for="radiomale">{{'user.male'|translate}}</label>
            </div>
            <div class="form-check form-check-inline">
              <input formControlName="jconon_application:sesso" type="radio" id="radiofemale" value="F">
              <label for="radiofemale">{{'user.female'|translate}}</label>
            </div>
            <label for="sesso" class="active">{{'user.sex'| translate}}</label>
          </div>
          <div class="form-group col-md-3">
            <div class="form-check form-check-inline">
              <input (change)="onChangeCittadinanza(true)" formControlName="jconon_application:fl_cittadino_italiano" type="radio" id="radioitaly" value="true">
              <label for="radioitaly">{{'user.cittadinanza.italy'|translate}}</label>
            </div>
            <div class="form-check form-check-inline">
              <input (change)="onChangeCittadinanza(true)" formControlName="jconon_application:fl_cittadino_italiano" type="radio" id="radioforeign" value="false">
              <label for="radioforeign">{{'user.cittadinanza.foreign'|translate}}</label>
            </div>
            <label for="cittadinanza" class="active">{{'user.cittadinanza.label'| translate}}</label>
          </div>
          <div [hidden]="isStraniero()" class="form-group col-md-6">
            <app-control-text 
                type="text" 
                inputClass="text-uppercase"
                [inline]="true" 
                [label]="'label.jconon_application.codice_fiscale'| translate"
                formControlName="jconon_application:codice_fiscale"></app-control-text>
          </div>
          <div [hidden]="!isStraniero()" class="form-group col-md-6">
            <label for="nazione_cittadinanza" class="active" translate>label.jconon_application.nazione_cittadinanza</label>
            <app-control-select-model
              [inline]="true"
              [noLabel]="true"
              [strings]="paesi"
              [showValidation]="true"
              [allowClear]="true"
              [showValidation]="true"
              [placeholder]="'placeholder.select.country'| translate"
              formControlName="jconon_application:nazione_cittadinanza">
            </app-control-select-model>
          </div>
        </div>
      </form>
    `
  })
export class JcononAffixAnagraficaComponent extends AffixComponent {
    paesi: string[];
    public comuniTemplate = Select2Template.comuni;

    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
      protected callService: CallService,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      super.ngOnInit();
      this.cacheService.paesi().subscribe((paesi) => {
        this.paesi = paesi;
      });

      this.form.addControl('jconon_application:nome', new FormControl({value:this.data.nome, disabled: true}));
      this.form.addControl('jconon_application:cognome', new FormControl({value:this.data.cognome, disabled: true}));
      this.form.addControl('jconon_application:nazione_nascita', 
        new FormControl(this.data.nazione_nascita, this.isRequiredValidator('jconon_application:nazione_nascita', this.data.call)));
      
      this.form.addControl('jconon_application:comune_nascita', 
        new FormControl(
            this.isForeign() ? this.data.comune_nascita : 
              (this.data.comune_nascita ? new Comune(this.data.comune_nascita, this.data.provincia_nascita): undefined),
              this.isRequiredValidator('jconon_application:comune_nascita', this.data.call)
        )
      );
      this.form.addControl('jconon_application:provincia_nascita', new FormControl(this.data.provincia_nascita));
      this.form.addControl('jconon_application:data_nascita', 
        new FormControl(this.data.data_nascita||undefined, this.isRequiredValidator('jconon_application:data_nascita', this.data.call)));
      this.form.addControl('jconon_application:sesso', 
        new FormControl(String(this.data.sesso || 'M'),this.isRequiredValidator('jconon_application:sesso', this.data.call)));

      this.form.addControl('jconon_application:fl_cittadino_italiano', new FormControl(
          this.data.fl_cittadino_italiano ? String(this.data.fl_cittadino_italiano) : 'false',
          this.isRequiredValidator('jconon_application:fl_cittadino_italiano', this.data.call)
        )
      );
      this.form.addControl('jconon_application:nazione_cittadinanza', new FormControl(this.data.nazione_cittadinanza));
      this.form.addControl('jconon_application:codice_fiscale', new FormControl(this.data.codice_fiscale));
      this.onChangeCittadinanza(false);
    }

    public isForeign(): boolean {
      return this.form.controls['jconon_application:nazione_nascita'].value !== Helpers.ITALIA;
    }
    
    public isStraniero(): boolean {
      return this.form.controls['jconon_application:fl_cittadino_italiano'].value == 'false';
    }

    public onChangeNazioneNascita() {
      this.form.controls['jconon_application:comune_nascita'].patchValue(null);
      this.form.controls['jconon_application:provincia_nascita'].patchValue(null);
    }

    public onChangeCittadinanza(reset: boolean) {
      if (this.isStraniero()) {
        this.form.controls['jconon_application:codice_fiscale'].setValidators(undefined);
        this.form.controls['jconon_application:nazione_cittadinanza'].setValidators(
          this.isRequiredValidator('jconon_application:nazione_cittadinanza', this.data.call)
        );
      } else {
        this.form.controls['jconon_application:codice_fiscale'].setValidators([
          this.isRequiredValidator('jconon_application:codice_fiscale', this.data.call),
          Helpers.patternValidator(Helpers.regExpCodiceFiscale, {codicefiscale: true})
        ]);
        this.form.controls['jconon_application:nazione_cittadinanza'].setValidators(undefined);
      }
      if (reset) {
        this.form.controls['jconon_application:codice_fiscale'].patchValue(null);
        this.form.controls['jconon_application:nazione_cittadinanza'].patchValue(null);
      }
    }
 
    public onChangeComune(comune: string) {
      if (comune) {
        this.callService.getComune(comune).subscribe((result) => {
          this.form.controls['jconon_application:provincia_nascita'].patchValue(result.provincia);
        });
      } else {
        this.form.controls['jconon_application:provincia_nascita'].patchValue(null);
      }
    }
}
