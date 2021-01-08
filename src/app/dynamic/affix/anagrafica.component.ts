import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AdMetadataComponent } from '../../shared/tags/show/ad-metadata.component';
import { Application } from '../../core/application/application.model';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { Comune } from '../../common/model/comune.model';
import { Helpers } from '../../common/helpers/helpers';

@Component({
    selector: 'affix_tabAnagrafica',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <div class="form-row">
          <div class="form-group col-md-6">
            <app-control-text 
              type="text" 
              [disabled]="true" 
              [inline]="true" 
              [label]="'user.firstname'| translate"
              formControlName="nome">
            </app-control-text>
          </div>
          <div class="form-group col-md-6">
            <app-control-text 
              type="text" 
              [disabled]="true" 
              [inline]="true" 
              [label]="'user.lastname'| translate" 
              formControlName="cognome">
            </app-control-text>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-3">
            <label for="statoestero" class="active">{{'application.nazione_nascita'| translate}}</label>
            <app-control-select-model
              [inline]="true"
              [noLabel]="true"
              [strings]="paesi"
              [showValidation]="true"
              [allowClear]="true"
              [showValidation]="true"
              [placeholder]="'placeholder.select.country'| translate"
              (onChangeEvent)="onChangeNazioneNascita()"
              formControlName="nazione_nascita">
            </app-control-select-model>
          </div>
          <div *ngIf="isForeign()" class="form-group col-md-6">
            <app-control-text 
              *ngIf="isForeign()" 
              type="text" 
              [inline]="true" 
              [label]="'application.luogo_nascita'| translate" 
              formControlName="comune_nascita_estero">
            </app-control-text>
          </div>
          <div *ngIf="!isForeign()" class="form-group col-md-5">
            <app-control-select-model
              *ngIf="!isForeign()"
              [inline]="true"
              [noLabel]="true"
              [items]="comuni"
              (onChangeEvent)="onChangeComune($event)"
              [showValidation]="true"
              [allowClear]="true"
              [showValidation]="true"
              [placeholder]="'placeholder.select.place'| translate"
              formControlName="comune_nascita">
              </app-control-select-model>          
            <label for="comune_nascita" class="active">{{'application.comune_nascita'| translate}}</label>
          </div>
          <div *ngIf="!isForeign()" class="form-group col-md-1">
            <app-control-text 
              *ngIf="!isForeign()" 
              [disabled]="true" 
              [showValidation]="false" 
              type="text" 
              [inline]="true" 
              [label]="'application.provincia_nascita'| translate" 
              formControlName="provincia_nascita">
            </app-control-text>
          </div>
          <div class="form-group col-md-3">
            <app-control-datepicker
                type="text"
                [inline]="true" 
                [label]="'user.dataDiNascita'| translate" 
                formControlName="data_nascita">
            </app-control-datepicker>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-3">
            <div class="form-check form-check-inline">
              <input formControlName="sesso" type="radio" id="radiomale" value="M">
              <label for="radiomale">{{'user.male'|translate}}</label>
            </div>
            <div class="form-check form-check-inline">
              <input formControlName="sesso" type="radio" id="radiofemale" value="F">
              <label for="radiofemale">{{'user.female'|translate}}</label>
            </div>
            <label for="sesso" class="active">{{'user.sex'| translate}}</label>
          </div>
          <div class="form-group col-md-3">
            <div class="form-check form-check-inline">
              <input (change)="onChangeCittadinanza()" formControlName="fl_cittadino_italiano" type="radio" id="radioitaly" value="true">
              <label for="radioitaly">{{'user.cittadinanza.italy'|translate}}</label>
            </div>
            <div class="form-check form-check-inline">
              <input (change)="onChangeCittadinanza()" formControlName="fl_cittadino_italiano" type="radio" id="radioforeign" value="false">
              <label for="radioforeign">{{'user.cittadinanza.foreign'|translate}}</label>
            </div>
            <label for="cittadinanza" class="active">{{'user.cittadinanza.label'| translate}}</label>
          </div>
          <div *ngIf="!isStraniero()" class="form-group col-md-6">
            <app-control-text 
                type="text" 
                inputClass="uppercase"
                [inline]="true" 
                [label]="'user.codicefiscale'| translate"
                formControlName="codicefiscale"></app-control-text>
          </div>
          <div *ngIf="isStraniero()" class="form-group col-md-6">
            <label for="nazione_cittadinanza" class="active">{{'user.statoestero'| translate}}</label>
            <app-control-select-model
              [inline]="true"
              [noLabel]="true"
              [strings]="paesi"
              [showValidation]="true"
              [allowClear]="true"
              [showValidation]="true"
              [placeholder]="'placeholder.select.country'| translate"
              formControlName="nazione_cittadinanza">
            </app-control-select-model>
          </div>
        </div>
      </form>
    `
  })
export class JcononAffixAnagraficaComponent implements AdMetadataComponent, OnInit {
    @Input() data: Application;
    @Input() form: FormGroup;
    paesi: string[];
    comuni: Comune[];
    constructor(
      protected cacheService: CacheService,
      private changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngAfterViewChecked() {
      this.changeDetectorRef.detectChanges();
    }

    ngOnInit(): void {
      this.cacheService.paesi().subscribe((paesi) => {
        this.paesi = paesi;
      });
      this.cacheService.comuni().subscribe((comuni) => {
        this.comuni = comuni;
      });
      this.form.addControl('nome', new FormControl({value: this.data.nome, disabled: true}));
      this.form.addControl('cognome', new FormControl({value: this.data.cognome, disabled: true}));
      this.form.addControl('nazione_nascita', new FormControl(this.data.nazione_nascita));
      this.form.controls.nazione_nascita.setValidators([
        Validators.required
      ]);
      this.onChangeNazioneNascita();
      this.form.addControl('data_nascita', new FormControl(this.data.data_nascita||undefined));
      this.form.controls.data_nascita.setValidators([
        Validators.required
      ]);
      this.form.addControl('sesso', new FormControl(String(this.data.sesso || 'M')));
      this.form.controls.sesso.setValidators([
        Validators.required
      ]);
      this.form.addControl('fl_cittadino_italiano', new FormControl(this.data.fl_cittadino_italiano ? String(this.data.fl_cittadino_italiano) : 'false'));
      this.form.controls.fl_cittadino_italiano.setValidators([
        Validators.required
      ]);
      this.onChangeCittadinanza();
    }

    public isForeign(): boolean {
      return this.form.controls.nazione_nascita.value !== 'Italia';
    }
    
    public isStraniero(): boolean {
      return this.form.controls.fl_cittadino_italiano.value == 'false';
    }

    public isLoaded(): boolean {
      return this.form !== undefined;
    }

    protected comuneNascitaEsteroControl() : AbstractControl {
      let comune_nascita_estero = new FormControl(this.data.comune_nascita);
      comune_nascita_estero.setValidators([
        Validators.required
      ]);
      return comune_nascita_estero;
    }

    protected comuneNascitaControl() : AbstractControl {
      let comune_nascita = new FormControl(new Comune(this.data.comune_nascita, this.data.provincia_nascita));
      comune_nascita.setValidators([
        Validators.required
      ]);
      return comune_nascita;
    }

    protected codiceFiscaleControl() : AbstractControl {
      let codiceFiscale = new FormControl(this.data.codice_fiscale);
      codiceFiscale.setValidators([
        Validators.required,
        Helpers.patternValidator(Helpers.regExpCodiceFiscale, {codicefiscale: true})
      ]);
      return codiceFiscale;
    }

    protected nazioneCittadinanzaControl() : AbstractControl {
      let nazioneCittadinanza = new FormControl(this.data.nazione_cittadinanza);
      nazioneCittadinanza.setValidators([
        Validators.required
      ]);
      return nazioneCittadinanza;
    }

    public onChangeNazioneNascita() {
      if (this.form.controls.nazione_nascita.value === 'Italia') {
        this.form.removeControl('comune_nascita_estero');
        this.form.addControl('comune_nascita', this.comuneNascitaControl());
        this.form.addControl('provincia_nascita', new FormControl(this.data.provincia_nascita));
      } else {
        if (this.form.contains('comune_nascita')) {
          this.form.removeControl('comune_nascita');
        }
        if (this.form.contains('provincia_nascita')) {
          this.form.removeControl('provincia_nascita');
        }
        this.form.addControl('comune_nascita_estero', this.comuneNascitaEsteroControl());
      }
    }

    public onChangeCittadinanza() {
      if (this.form.controls.fl_cittadino_italiano.value === 'false') {
        this.form.removeControl('codicefiscale');
        this.form.addControl('nazione_cittadinanza', this.nazioneCittadinanzaControl());
      } else {
        this.form.addControl('codicefiscale', this.codiceFiscaleControl());
        this.form.removeControl('nazione_cittadinanza');
      }
    }
 
    public onChangeComune(comune: any) {
      if (comune) {
        this.form.controls.provincia_nascita.setValue(comune.provincia);
      }
    }

}