import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { Comune } from '../../common/model/comune.model';
import { Helpers } from '../../common/helpers/helpers';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'affix_tabResidenza',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <div class="form-row">
          <div class="form-group col-md-3">
            <label for="statoestero" class="active">{{'application.nazione_residenza'| translate}}</label>
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
          <div [hidden]="!isForeign()" class="form-group col-md-6">
            <app-control-text 
              *ngIf="isForeign()" 
              type="text" 
              [inline]="true" 
              [label]="'application.luogo_residenza'| translate" 
              formControlName="jconon_application:comune_residenza">
            </app-control-text>
          </div>
          <div [hidden]="isForeign()" class="form-group col-md-5">
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
          <div [hidden]="isForeign()" class="form-group col-md-1">
            <label class="form-label active">{{'application.provincia_residenza' | translate}}</label>
            <input class="form-control" id="jconon_application:provincia_residenza" type="text" formControlName="jconon_application:provincia_residenza" />
          </div>
          <div class="form-group col-md-3">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'application.cap_residenza'| translate" 
              formControlName="jconon_application:cap_residenza">
            </app-control-text>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-9">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'application.indirizzo_residenza'| translate" 
              formControlName="jconon_application:indirizzo_residenza">
            </app-control-text>
          </div>
          <div class="form-group col-md-3">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'application.num_civico_residenza'| translate" 
              formControlName="jconon_application:num_civico_residenza">
            </app-control-text>
          </div>
        </div>
      </form>
    `
  })
export class JcononAffixResidenzaComponent extends DynamicComponent {
    paesi: string[];
    comuni: Comune[];
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.cacheService.paesi().subscribe((paesi) => {
        this.paesi = paesi;
      });
      this.cacheService.comuni().subscribe((comuni) => {
        this.comuni = comuni;
      });
      this.form.addControl('jconon_application:nazione_residenza', new FormControl(this.data.nazione_residenza, Validators.required));
      this.form.addControl('jconon_application:comune_residenza', 
        new FormControl(
            this.isForeign() ? this.data.comune_residenza : new Comune(this.data.comune_residenza, this.data.provincia_residenza),
            Validators.required
        )
      );
      this.form.addControl('jconon_application:provincia_residenza', new FormControl({value:this.data.provincia_residenza, disabled:true}));
      this.form.addControl('jconon_application:cap_residenza', new FormControl(
          this.data.cap_residenza,
          [
            Validators.required,
            Helpers.minlengthValidator(5, {minlength5: true}),
            Helpers.maxlengthValidator(5, {maxlength5: true}),
            Helpers.patternValidator(/^\d+$/, { hasOnlyNumber: true })
          ]
        )
      );

      this.form.addControl('jconon_application:indirizzo_residenza', new FormControl(this.data.indirizzo_residenza, Validators.required));
      this.form.addControl('jconon_application:num_civico_residenza', new FormControl(this.data.num_civico_residenza));
      super.ngOnInit();
    }

    public isForeign(): boolean {
      return this.form.controls['jconon_application:nazione_residenza'].value !== Helpers.ITALIA;
    }
      
    public onChangeComune(comune: any) {
      if (comune) {
        this.form.controls['jconon_application:provincia_residenza'].patchValue(comune.provincia);
      }
    }

    public onChangeNazioneResidenza() {
      this.form.controls['jconon_application:comune_residenza'].patchValue(null);
      this.form.controls['jconon_application:provincia_residenza'].patchValue(null);
    }

    onChangeToggle(reset: boolean){      
    }
}
