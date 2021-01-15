import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AdMetadataComponent } from '../../shared/tags/show/ad-metadata.component';
import { Application } from '../../core/application/application.model';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { Comune } from '../../common/model/comune.model';
import { Helpers } from '../../common/helpers/helpers';

@Component({
    selector: 'affix_tabResidenza',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
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
              (onChangeEvent)="onChangeNazioneResidenza()"
              formControlName="jconon_application:nazione_residenza">
            </app-control-select-model>
          </div>
          <div *ngIf="isForeign()" class="form-group col-md-6">
            <app-control-text 
              *ngIf="isForeign()" 
              type="text" 
              [inline]="true" 
              [label]="'application.luogo_nascita'| translate" 
              formControlName="jconon_application:comune_residenza_estero">
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
              formControlName="jconon_application:comune_residenza">
              </app-control-select-model>          
            <label for="comune_residenza" class="active">{{'application.comune_residenza'| translate}}</label>
          </div>
          <div *ngIf="!isForeign()" class="form-group col-md-1">
            <app-control-text 
              *ngIf="!isForeign()" 
              [disabled]="true" 
              [showValidation]="false" 
              type="text" 
              [inline]="true" 
              [label]="'application.provincia_residenza'| translate" 
              formControlName="jconon_application:provincia_residenza">
            </app-control-text>
          </div>
        </div>
      </form>
    `
  })
export class JcononAffixResidenzaComponent implements AdMetadataComponent, OnInit {
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
      this.form.addControl('jconon_application:nazione_residenza', new FormControl(this.data.nazione_residenza));
      this.form.controls['jconon_application:nazione_residenza'].setValidators([
        Validators.required
      ]);
      this.onChangeNazioneResidenza();
      this.form.addControl('jconon_application:cap_residenza', new FormControl(this.data.cap_residenza));
      this.form.controls['jconon_application:cap_residenza'].setValidators([
        Validators.required
      ]);
      this.form.addControl('jconon_application:indirizzo_residenza', new FormControl(this.data.indirizzo_residenza));
      this.form.controls['jconon_application:indirizzo_residenza'].setValidators([
        Validators.required
      ]);
      this.form.addControl('jconon_application:num_civico_residenza', new FormControl(this.data.num_civico_residenza));
    }

    public isForeign(): boolean {
      return this.form.controls['jconon_application:nazione_residenza'].value !== 'Italia';
    }
    
    public isLoaded(): boolean {
      return this.form !== undefined;
    }
 
    public onChangeComune(comune: any) {
      if (comune) {
        this.form.controls['jconon_application:provincia_residenza'].setValue(comune.provincia);
      }
    }

    protected comuneResidenzaEsteroControl() : AbstractControl {
      let comune_residenza_estero = new FormControl(this.data.comune_residenza);
      comune_residenza_estero.setValidators([
        Validators.required
      ]);
      return comune_residenza_estero;
    }

    protected comuneResidenzaControl() : AbstractControl {
      let comune_residenza = new FormControl(new Comune(this.data.comune_residenza, this.data.provincia_residenza));
      comune_residenza.setValidators([
        Validators.required
      ]);
      return comune_residenza;
    }

    public onChangeNazioneResidenza() {
      if (this.form.controls['jconon_application:nazione_residenza'].value === 'Italia') {
        this.form.removeControl('jconon_application:comune_residenza_estero');
        this.form.addControl('jconon_application:comune_residenza', this.comuneResidenzaControl());
        this.form.addControl('jconon_application:provincia_residenza', new FormControl(this.data.provincia_residenza));
      } else {
        if (this.form.contains('jconon_application:comune_residenza')) {
          this.form.removeControl('jconon_application:comune_residenza');
        }
        if (this.form.contains('jconon_application:provincia_residenza')) {
          this.form.removeControl('jconon_application:provincia_residenza');
        }
        this.form.addControl('jconon_application:comune_residenza_estero', this.comuneResidenzaEsteroControl());
      }
    }
}