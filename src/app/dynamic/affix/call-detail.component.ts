import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { Comune } from '../../common/model/comune.model';
import { Helpers } from '../../common/helpers/helpers';
import { AffixComponent } from './affix.component';
import { CallService } from '../../core/call/call.service';
import { Select2Template } from '../../common/template/select2-template';
import { Call } from '../../core/call/call.model';
import { DynamicComponent } from '../dynamic.component';
import * as Editor from '../../core/libs/ckeditor5/build/ckeditor';

@Component({
    selector: 'affix_tabAnagrafica',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <div class="form-row">
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
          <div class="form-check col-md-2 mb-3">
            <app-control-checkbox 
              [showValidation]="true"
              [inline]="true" 
              [label]="'label.jconon_call.aspect_macro_call'| translate" 
              formControlName="jconon_call:aspect_macro_call">
            </app-control-checkbox>
          </div>
          <div class="form-group col-md-4">
            <app-control-text 
              *ngIf="isBandoMultiplo()"
              [showValidation]="true"
              [inline]="true" 
              [label]="'label.jconon_call.numero_max_domande'| translate" 
              formControlName="jconon_call:numero_max_domande">
            </app-control-text>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-6">
            <label class="form-label active">{{'label.jconon_call.descrizione' | translate}}</label>
            <ckeditor [config]="config" [editor]="Editor" formControlName="jconon_call:descrizione"></ckeditor>
          </div>
          <div class="form-group col-md-6">
            <label class="form-label active">{{'label.jconon_call.descrizione_ridotta' | translate}}</label>
            <ckeditor [config]="config" [editor]="Editor" formControlName="jconon_call:descrizione_ridotta"></ckeditor>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-12">
            <label class="form-label active">{{'label.jconon_call.requisiti' | translate}}</label>
            <ckeditor [config]="config" [editor]="Editor" formControlName="jconon_call:requisiti"></ckeditor>
          </div>
        </div>

      </form>
    `
  })
export class JcononAffixCallDetailComponent extends DynamicComponent<Call> {
    paesi: string[];
    public comuniTemplate = Select2Template.comuni;
    public Editor = Editor;
    config = {  
      toolbar: [ 
        'bold', 
        'italic', 
        'strikethrough', 
        'underline', 
        'indent', 
        '|', 
        'alignment', 
        'numberedList', 
        'bulletedList', 
        'link', 
        '|', 
        'undo', 
        'redo' 
      ] 
    };

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

      this.form.addControl('jconon_call:codice', 
        new FormControl(this.data.codice, Validators.required));
      this.form.addControl('jconon_call:numero_posti', 
        new FormControl(this.data.numero_posti, [Validators.required, Helpers.patternValidator(/^[0-9]*$/, { onlyNumber: true })]));
      this.form.addControl('jconon_call:aspect_macro_call', 
        new FormControl(this.data.secondaryObjectTypeIds ? 
          this.data.secondaryObjectTypeIds.indexOf('P:jconon_call:aspect_macro_call') != -1 : false, Validators.required));
      this.form.addControl('jconon_call:numero_max_domande', 
        new FormControl(this.data.numero_max_domande, [Validators.required, Helpers.patternValidator(/^[0-9]+$/, { onlyNumber: true })]));
      this.form.addControl('jconon_call:descrizione', 
        new FormControl(this.data.descrizione, Validators.required));
      this.form.addControl('jconon_call:descrizione_ridotta', 
        new FormControl(this.data.descrizione_ridotta, Validators.required));
      this.form.addControl('jconon_call:requisiti', 
        new FormControl(this.data.requisiti, Validators.required));
    }

    public isBandoMultiplo(): boolean {
      return this.form.controls['jconon_call:aspect_macro_call'].value;      
    }

}
