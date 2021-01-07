import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AdMetadataComponent } from '../../shared/tags/show/ad-metadata.component';
import { Application } from '../../core/application/application.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { Comune } from '../../common/model/comune.model';
import { Helpers } from '../../common/helpers/helpers';

@Component({
    selector: 'affix_tabResidenza',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
          TESTTTT
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
      this.form.addControl('nome', new FormControl({value: this.data.nome, disabled: true}));
      this.form.addControl('cognome', new FormControl({value: this.data.cognome, disabled: true}));
      this.form.addControl('nazione_nascita', new FormControl(this.data.nazione_nascita));
      this.form.controls.nazione_nascita.setValidators([
        Validators.required
      ]);
      this.form.addControl('comune_nascita_estero', new FormControl(this.data.comune_nascita));
      this.form.controls.comune_nascita_estero.setValidators([
        Validators.required
      ]);
      this.form.addControl(
        'comune_nascita', 
        new FormControl(
          new Comune(this.data.comune_nascita, this.data.provincia_nascita)
        )
      );
      this.form.controls.comune_nascita.setValidators([
        Validators.required
      ]);
      this.form.addControl('provincia_nascita', new FormControl(this.data.provincia_nascita));
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
      this.form.addControl('codicefiscale', new FormControl(this.data.codice_fiscale));
      this.form.controls.codicefiscale.setValidators([
        Validators.required,
        Helpers.patternValidator(Helpers.regExpCodiceFiscale, {codicefiscale: true})
      ]);
      this.form.addControl('nazione_cittadinanza', new FormControl(this.data.nazione_cittadinanza));
      this.form.controls.nazione_cittadinanza.setValidators([
        Validators.required
      ]);

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
 
    public onChangeComune(comune: any) {
      if (comune) {
        this.form.controls.provincia_nascita.setValue(comune.provincia);
      }
    }

}