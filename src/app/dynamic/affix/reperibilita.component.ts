import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { Comune } from '../../common/model/comune.model';
import { Helpers } from '../../common/helpers/helpers';
import { AffixComponent } from './affix.component';
import { Select2Template } from '../../common/template/select2-template';
import { CallService } from '../../core/call/call.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/model/user.model';

@Component({
    selector: 'affix_tabReperibilita',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <div class="form-row">
          <div class="form-group col-md-3">
            <app-control-select-model
              [inline]="true"
              [focus]="true"
              [label]="'label.jconon_application.nazione_comunicazioni'| translate"
              [labelactive]="'true'"
              [strings]="paesi"
              [showValidation]="true"
              [allowClear]="true"
              [showValidation]="true"
              [placeholder]="'placeholder.select.country'| translate"
              (onChangeEvent)="onChangeNazioneResidenza()"
              formControlName="jconon_application:nazione_comunicazioni">
            </app-control-select-model>
          </div>
          <div [hidden]="!isForeignComunicazioni()" class="form-group col-md-6">
            <app-control-text 
              *ngIf="isForeignComunicazioni()" 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_application.luogo_comunicazioni'| translate" 
              formControlName="jconon_application:comune_comunicazioni">
            </app-control-text>
          </div>
          <div [hidden]="isForeignComunicazioni()" class="form-group col-md-5">
            <app-control-select-model
              *ngIf="!isForeignComunicazioni()"
              [term]="''"
              [template]="comuniTemplate"
              [path]="callService.getComuniMapping()"
              [label]="'label.jconon_application.comune_comunicazioni'| translate"
              [labelactive]="'true'"
              (onChangeEvent)="onChangeComune($event)"
              [inline]="'false'"
              [resultName]="'comuni'"
              [allowClear]="'true'"
              [placeholder]="'placeholder.select.place'| translate"
              formControlName="jconon_application:comune_comunicazioni">
            </app-control-select-model>          
          </div>
          <div [hidden]="isForeignComunicazioni()" class="form-group col-md-1">
            <label class="form-label active">{{'label.jconon_application.provincia_comunicazioni' | translate}}</label>
            <input class="form-control" 
              id="jconon_application:provincia_comunicazioni" 
              type="text" 
              readonly
              formControlName="jconon_application:provincia_comunicazioni" />
          </div>
          <div class="form-group col-md-3">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_application.cap_comunicazioni'| translate" 
              formControlName="jconon_application:cap_comunicazioni">
            </app-control-text>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-9">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_application.indirizzo_comunicazioni'| translate" 
              formControlName="jconon_application:indirizzo_comunicazioni">
            </app-control-text>
          </div>
          <div class="form-group col-md-3">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_application.num_civico_comunicazioni'| translate" 
              formControlName="jconon_application:num_civico_comunicazioni">
            </app-control-text>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-4">
            <app-control-text 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_application.telefono_comunicazioni'| translate" 
              formControlName="jconon_application:telefono_comunicazioni">
            </app-control-text>
          </div>
          <div class="form-group col-md-8">
            <app-control-text
              *ngIf="isForeign()" 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_application.email_comunicazioni'| translate" 
              formControlName="jconon_application:email_comunicazioni">
            </app-control-text>
            <app-control-text
              *ngIf="!isForeign()" 
              type="text" 
              [inline]="true" 
              [label]="'label.jconon_application.email_pec_comunicazioni'| translate" 
              formControlName="jconon_application:email_pec_comunicazioni">
            </app-control-text>
          </div>
        </div>
      </form>
    `
  })
export class JcononAffixReperibilitaComponent extends AffixComponent {
    paesi: string[];
    public comuniTemplate = Select2Template.comuni;
    public user: User = null;

    constructor(
      protected cacheService: CacheService,
      private authService: AuthService,
      protected changeDetectorRef: ChangeDetectorRef,
      protected callService: CallService,
    ) {
      super(cacheService, changeDetectorRef);
      if (this.authService.isAuthenticated()) {
        this.user = this.authService.getUser();
      }  
    }

    ngOnInit(): void {
      super.ngOnInit();
      this.cacheService.paesi().subscribe((paesi) => {
        this.paesi = paesi;
      });
      this.form.addControl(
        'jconon_application:nazione_comunicazioni', 
        new FormControl(
          this.data.nazione_comunicazioni||this.data.nazione_residenza, 
          this.isRequiredValidator('jconon_application:nazione_comunicazioni', this.data.call)
        )
      );
      this.form.addControl('jconon_application:comune_comunicazioni', 
        new FormControl(
            this.isForeignComunicazioni() ? this.data.comune_comunicazioni||this.data.comune_residenza : 
            (this.data.comune_comunicazioni||this.data.comune_residenza ? 
              new Comune(this.data.comune_comunicazioni||this.data.comune_residenza, this.data.provincia_comunicazioni||this.data.provincia_residenza):undefined),
              this.isRequiredValidator('jconon_application:comune_comunicazioni', this.data.call)
        )
      );
      this.form.addControl('jconon_application:provincia_comunicazioni', new FormControl(this.data.provincia_comunicazioni||this.data.provincia_residenza));
      this.form.addControl('jconon_application:cap_comunicazioni', new FormControl(
          this.data.cap_comunicazioni||this.data.cap_residenza,
          [
            this.isRequiredValidator('jconon_application:cap_comunicazioni', this.data.call),
            Helpers.minlengthValidator(5, {minlength5: true}),
            Helpers.maxlengthValidator(5, {maxlength5: true}),
            Helpers.patternValidator(/^\d+$/, { hasOnlyNumber: true })
          ]
        )
      );

      this.form.addControl('jconon_application:indirizzo_comunicazioni', 
        new FormControl(
          this.data.indirizzo_comunicazioni||this.data.indirizzo_residenza, 
          this.isRequiredValidator('jconon_application:indirizzo_comunicazioni', this.data.call)
        )
      );
      this.form.addControl('jconon_application:num_civico_comunicazioni', 
        new FormControl(this.data.num_civico_comunicazioni||this.data.num_civico_residenza));
      this.form.addControl('jconon_application:telefono_comunicazioni', 
        new FormControl(this.data.telefono_comunicazioni, this.isRequiredValidator('jconon_application:telefono_comunicazioni', this.data.call)));
      this.form.addControl('jconon_application:email_comunicazioni', 
          new FormControl(this.data.email_comunicazioni||this.user.email||this.user.emailcertificatoperpuk));
      this.form.addControl('jconon_application:email_pec_comunicazioni', new FormControl(this.data.email_pec_comunicazioni));

      if (this.isForeign()) {
        this.form.controls['jconon_application:email_comunicazioni'].setValidators([
          this.isRequiredValidator('jconon_application:email_comunicazioni', this.data.call), 
          Validators.email
        ]);
      } else {
        this.form.controls['jconon_application:email_pec_comunicazioni'].setValidators([
          this.isRequiredValidator('jconon_application:email_pec_comunicazioni', this.data.call), 
          Validators.email
        ]);
      }
    }

    public isForeign(): boolean {
      return !this.data.fl_cittadino_italiano;
    }

    public isForeignComunicazioni(): boolean {
      return this.form.controls['jconon_application:nazione_comunicazioni'].value !== Helpers.ITALIA;
    }
      
    public onChangeComune(comune: string) {
      if (comune) {
        this.callService.getComune(comune).subscribe((result) => {
          this.form.controls['jconon_application:provincia_comunicazioni'].patchValue(result.provincia);
        });
      } else {
        this.form.controls['jconon_application:provincia_comunicazioni'].patchValue(null);
      }
    }

    public onChangeNazioneResidenza() {
      this.form.controls['jconon_application:comune_comunicazioni'].patchValue(null);
      this.form.controls['jconon_application:provincia_comunicazioni'].patchValue(null);
    }
}
