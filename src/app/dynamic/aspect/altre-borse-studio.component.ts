import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_altre_borse_studio',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlAltreBorseStudio()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark">{{'label.jconon_application.fl_altre_borse_studio' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_altre_borse_studio">
                    <input type="checkbox" (change)="onChangeFlAltreBorseStudio(true)" id="fl_altre_borse_studio" 
                      formControlName="jconon_application:fl_altre_borse_studio">
                    <span class="lever"></span>
                    <div *ngIf=isInvalid() class="text-truncate text-danger mt-n2">
                      <span *ngFor="let error of hasErrors()" class="pr-2">
                        <small class="align-top">{{ 'message.validation.' + error | translate }}</small>
                      </span>
                    </div>
                </label>
            </div>
          </div>
          <div class="form-row w-100 pt-1">
            <div *ngSwitchCase="false" class="form-group col-md-12">
              <app-control-textarea 
                [showValidation]="true"
                [focus]="true"
                rows="5" 
                [inline]="true" 
                [label]="'label.jconon_application.descrizione_altre_borse_studio'| translate" 
                formControlName="jconon_application:descrizione_altre_borse_studio">
              </app-control-textarea>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectAltreBorseStudioComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_altre_borse_studio';
      this.control = new FormControl(this.data.fl_altre_borse_studio, Validators.required);
      this.form.addControl(this.propertyName, this.control);
      this.form.controls[this.propertyName].setValidators(Validators.required);

      this.form.addControl(
        'jconon_application:descrizione_altre_borse_studio', 
        new FormControl(this.data.descrizione_altre_borse_studio)
      );
      this.onChangeFlAltreBorseStudio(false);
      super.ngOnInit();
    }

    public onChangeFlAltreBorseStudio(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:descrizione_altre_borse_studio'].patchValue(null);
      }
      this.form.controls['jconon_application:descrizione_altre_borse_studio']
        .setValidators(!this.isFlAltreBorseStudio()? Validators.required : undefined);
    }

    public isFlAltreBorseStudio(): boolean {
      return this.form.controls['jconon_application:fl_altre_borse_studio'].value;      
    }
}
