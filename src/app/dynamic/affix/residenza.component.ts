import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { Comune } from '../../common/model/comune.model';
import { Helpers } from '../../common/helpers/helpers';
import { AffixComponent } from './affix.component';
import { Select2Template } from '../../common/template/select2-template';
import { CallService } from '../../core/call/call.service';

@Component({
  standalone: false,
    selector: 'affix_tabResidenza',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <div class="row gx-2">
          <div class="form-group col-md-3">
            <app-control-nazione
              [label]="'label.jconon_application.nazione_residenza'| translate"
              [placeholder]="'placeholder.select.country'| translate"
              (changed)="onChangeNazioneResidenza()"
              formControlName="jconon_application:nazione_residenza">
            </app-control-nazione>
          </div>
          <div [hidden]="!isForeign()" class="form-group col-md-6">
            <app-control-text 
              *ngIf="isForeign()" 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_application.luogo_residenza'| translate" 
              formControlName="jconon_application:comune_residenza">
            </app-control-text>
          </div>
          <div [hidden]="isForeign()" class="form-group col-md-5">
            <app-control-comune
              *ngIf="!isForeign()"
              [label]="'label.jconon_application.comune_residenza'| translate"
              [placeholder]="'placeholder.select.place'| translate"
              [attivi]="true"
              (changed)="onChangeComune($event)"
              formControlName="jconon_application:comune_residenza">
            </app-control-comune>          
          </div>
          <div [hidden]="isForeign()" class="form-group col-md-1">
            <label class="form-label active">{{'label.jconon_application.provincia_residenza' | translate}}</label>
            <input class="form-control" 
              id="jconon_application:provincia_residenza" 
              type="text" 
              readonly
              formControlName="jconon_application:provincia_residenza" />
          </div>
          <div class="form-group col-md-3">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_application.cap_residenza'| translate" 
              formControlName="jconon_application:cap_residenza">
            </app-control-text>
          </div>
        </div>
        <div class="row gx-2">
          <div class="form-group col-md-9">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_application.indirizzo_residenza'| translate" 
              formControlName="jconon_application:indirizzo_residenza">
            </app-control-text>
          </div>
          <div class="form-group col-md-3">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_application.num_civico_residenza'| translate" 
              formControlName="jconon_application:num_civico_residenza">
            </app-control-text>
          </div>
        </div>
      </form>
    `
  })
export class JcononAffixResidenzaComponent extends AffixComponent {
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
      this.form.addControl('jconon_application:nazione_residenza', 
        new FormControl(
          this.data.nazione_residenza, 
          this.isRequiredValidator('jconon_application:nazione_residenza', this.data.call)
        )
      );
      this.form.addControl('jconon_application:comune_residenza', 
        new FormControl(
            this.isForeign() ? this.data.comune_residenza : 
            (this.data.comune_residenza ? new Comune(this.data.comune_residenza, this.data.provincia_residenza):undefined),
            this.isRequiredValidator('jconon_application:comune_residenza', this.data.call)
        )
      );
      this.form.addControl('jconon_application:provincia_residenza', new FormControl(this.data.provincia_residenza));
      this.form.addControl('jconon_application:cap_residenza', new FormControl(
          this.data.cap_residenza,
          [
            this.isRequiredValidator('jconon_application:cap_residenza', this.data.call),
            Helpers.minlengthValidator(5, {minlength5: true}),
            Helpers.maxlengthValidator(5, {maxlength5: true}),
            Helpers.patternValidator(/^\d+$/, { hasOnlyNumber: true })
          ]
        )
      );

      this.form.addControl('jconon_application:indirizzo_residenza', 
        new FormControl(
          this.data.indirizzo_residenza, 
          this.isRequiredValidator('jconon_application:indirizzo_residenza', this.data.call)
        )
      );
      this.form.addControl('jconon_application:num_civico_residenza', 
        new FormControl(
          this.data.num_civico_residenza, 
          this.isRequiredValidator('jconon_application:num_civico_residenza', this.data.call)
        )
      );
    }

    public isForeign(): boolean {
      return this.form.controls['jconon_application:nazione_residenza'].value !== Helpers.ITALIA;
    }
      
    public onChangeComune(comune: any) {
      // provincia dal comune scelto (archivio ANPR)
      this.form.controls['jconon_application:provincia_residenza'].patchValue(comune ? comune.provincia : null);
    }

    public onChangeNazioneResidenza() {
      this.form.controls['jconon_application:comune_residenza'].patchValue(null);
      this.form.controls['jconon_application:provincia_residenza'].patchValue(null);
    }
}
