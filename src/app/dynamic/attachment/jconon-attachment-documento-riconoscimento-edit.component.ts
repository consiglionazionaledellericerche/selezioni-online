import { ChangeDetectorRef, Component } from '@angular/core';
import { DocumentoRiconoscimento } from '../../common/model/documento_riconoscimento.model';
import { FormControl, Validators } from '@angular/forms';
import { DynamicComponent } from '../dynamic.component';
import { CacheService } from '../../core/cache.service';

@Component({
    selector: 'D:jconon_documento_riconoscimento:attachment',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <div class="form-row w-100 pt-1">
          <div class="form-group col-md-12">
            <app-control-text 
              [showValidation]="true"
              [focus]="true"
              [inline]="true" 
              [label]="'label.jconon_documento_riconoscimento.tipologia'| translate" 
              formControlName="jconon_documento_riconoscimento:tipologia">
            </app-control-text>
          </div>
        </div>  
        <div class="form-row w-100 pt-1">
          <div class="form-group col-md-6">
            <app-control-text 
              [showValidation]="true"
              [inline]="true" 
              [label]="'label.jconon_documento_riconoscimento.numero'| translate" 
              formControlName="jconon_documento_riconoscimento:numero">
            </app-control-text>
          </div>
          <div class="form-group col-md-6">
            <app-control-datepicker 
              [showValidation]="true"
              [inline]="true" 
              [label]="'label.jconon_documento_riconoscimento.data_scadenza'| translate" 
              formControlName="jconon_documento_riconoscimento:data_scadenza">
            </app-control-datepicker>
          </div>
        </div>  
        <div class="form-row w-100 pt-1">
          <div class="form-group col-md-12">
            <app-control-text 
              [showValidation]="true"
              [inline]="true" 
              [label]="'label.jconon_documento_riconoscimento.emittente'| translate" 
              formControlName="jconon_documento_riconoscimento:emittente">
            </app-control-text>
          </div>
        </div>  
      </form>
  `
  })
export class JcononAttachmentDocumentoRiconoscimentoEditComponent extends DynamicComponent<DocumentoRiconoscimento> {
  constructor(
    protected cacheService: CacheService,
    protected changeDetectorRef: ChangeDetectorRef,
  ) {
    super(cacheService, changeDetectorRef);
  }

  ngOnInit(): void {
    this.form.addControl(
      'jconon_documento_riconoscimento:tipologia', 
      new FormControl(this.data ? this.data.tipologia: undefined, Validators.required)
    );
    this.form.addControl(
      'jconon_documento_riconoscimento:numero', 
      new FormControl(this.data ? this.data.numero: undefined, Validators.required)
    );
    this.form.addControl(
      'jconon_documento_riconoscimento:data_scadenza', 
      new FormControl(this.data ? this.data.data_scadenza: undefined, Validators.required)
    );
    this.form.addControl(
      'jconon_documento_riconoscimento:emittente', 
      new FormControl(this.data ? this.data.emittente: undefined, Validators.required)
    );
 
    super.ngOnInit();
  }

}