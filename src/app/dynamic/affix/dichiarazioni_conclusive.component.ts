import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AdMetadataComponent } from '../../shared/tags/show/ad-metadata.component';
import { Application } from '../../core/application/application.model';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { Comune } from '../../common/model/comune.model';
import { Helpers } from '../../common/helpers/helpers';

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
export class JcononAffixDichiarazioniConclusiveComponent implements AdMetadataComponent, OnInit {
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
      this.form.addControl('jconon_application:fl_dichiarazione_sanzioni_penali', new FormControl(this.data.fl_dichiarazione_sanzioni_penali));
      this.form.controls['jconon_application:fl_dichiarazione_sanzioni_penali'].setValidators([
        Validators.required
      ]);
      this.form.addControl('jconon_application:fl_dichiarazione_dati_personali', new FormControl(this.data.fl_dichiarazione_dati_personali));
      this.form.controls['jconon_application:fl_dichiarazione_dati_personali'].setValidators([
        Validators.required
      ]);
    }

    public isLoaded(): boolean {
      return this.form !== undefined;
    }

}