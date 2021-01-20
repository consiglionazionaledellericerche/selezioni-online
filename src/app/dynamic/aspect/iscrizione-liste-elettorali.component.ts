import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Comune } from '../../common/model/comune.model';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_iscrizione_liste_elettorali',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlIscrittoListeElettorali()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark">{{'label.jconon_application.fl_iscritto_liste_elettorali' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_iscritto_liste_elettorali">
                    <input type="checkbox" (change)="onChangeFlIscrittoListeElettorali(true)" id="fl_iscritto_liste_elettorali" formControlName="jconon_application:fl_iscritto_liste_elettorali">
                    <span class="lever"></span>
                    <div *ngIf=isInvalid() class="text-truncate text-danger mt-n2">
                      <span *ngFor="let error of hasErrors()" class="pr-1">
                        <small class="align-top">{{ 'message.validation.' + error | translate }}</small>
                      </span>
                    </div>
                </label>
            </div>
          </div>
          <div class="form-row w-100 pt-1">
            <div [hidden]="!isFlIscrittoListeElettorali()" class="form-group col-md-9">
              <app-control-select-model
                [inline]="true"
                [noLabel]="true"
                [items]="comuni"
                (onChangeEvent)="onChangeComune($event)"
                [showValidation]="true"
                [allowClear]="true"
                [showValidation]="true"
                [placeholder]="'placeholder.select.place'| translate"
                formControlName="jconon_application:comune_liste_elettorali">
                </app-control-select-model>          
              <label for="comune_liste_elettorali" class="active">{{'label.jconon_application.comune_liste_elettorali'| translate}}</label>
            </div>
            <div *ngSwitchCase="true" class="form-group col-md-3">
              <app-control-text 
                [disabled]="true" 
                [showValidation]="false" 
                type="text" 
                [inline]="true" 
                [label]="'label.jconon_application.provincia_liste_elettorali' | translate" 
                formControlName="jconon_application:provincia_liste_elettorali">
              </app-control-text>
            </div>
            <div *ngSwitchCase="false" class="form-group col-md-12">
              <app-control-textarea 
                [showValidation]="true"
                rows="5" 
                [inline]="true" 
                [label]="'label.jconon_application.motivazione_no_iscrizione_liste_elettorali'| translate" 
                formControlName="jconon_application:motivazione_no_iscrizione_liste_elettorali">
              </app-control-textarea>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectIscrizioneListeElettoraliComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    comuni: Comune[];

    ngOnInit(): void {
      this.cacheService.comuni().subscribe((comuni) => {
        this.comuni = comuni;
      });

      this.propertyName = 'jconon_application:fl_iscritto_liste_elettorali';
      this.control = new FormControl(this.data.fl_iscritto_liste_elettorali, Validators.required);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl('jconon_application:comune_liste_elettorali', new FormControl(
          new Comune(this.data.comune_liste_elettorali, this.data.provincia_liste_elettorali)
        )
      );
      this.form.addControl('jconon_application:provincia_liste_elettorali', new FormControl(this.data.provincia_liste_elettorali));
      this.form.addControl(
        'jconon_application:motivazione_no_iscrizione_liste_elettorali', 
        new FormControl(this.data.motivazione_no_iscrizione_liste_elettorali)
      );
      this.onChangeFlIscrittoListeElettorali(false);
      super.ngOnInit();
    }

    public onChangeComune(comune: any) {
      if (comune) {
        this.form.controls['jconon_application:provincia_liste_elettorali'].patchValue(comune.provincia);
      }
    }

    public onChangeFlIscrittoListeElettorali(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:comune_liste_elettorali'].patchValue(null);
        this.form.controls['jconon_application:provincia_liste_elettorali'].patchValue(null);
        this.form.controls['jconon_application:motivazione_no_iscrizione_liste_elettorali'].patchValue(null);
      }
      if (this.isFlIscrittoListeElettorali()) {
        this.form.controls['jconon_application:motivazione_no_iscrizione_liste_elettorali'].setValidators(undefined);
        this.form.controls['jconon_application:comune_liste_elettorali'].setValidators(Validators.required);
      } else {
        this.form.controls['jconon_application:motivazione_no_iscrizione_liste_elettorali'].setValidators(Validators.required);
        this.form.controls['jconon_application:comune_liste_elettorali'].setValidators(undefined);
      }
    }

    public isFlIscrittoListeElettorali(): boolean {
      return this.form.controls['jconon_application:fl_iscritto_liste_elettorali'].value;      
    }
}
