import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Helpers } from '../../common/helpers/helpers';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_categorie_riservatarie_art18',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlCategorieRiservatarieArt18()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark c-pointer" (click)="toggle()">{{'label.jconon_application.fl_categorie_riservatarie_art18' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_categorie_riservatarie_art18">
                    <input type="checkbox" (change)="onChangeToggle(true)" id="fl_categorie_riservatarie_art18" 
                      formControlName="jconon_application:fl_categorie_riservatarie_art18">
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
            <div *ngSwitchCase="true" class="form-group col-md-12">
              <app-control-text 
                [showValidation]="true"
                [focus]="true"
                [inline]="true" 
                [label]="'label.jconon_application.categorie_riservatarie_codice'| translate" 
                formControlName="jconon_application:categorie_riservatarie_codice">
              </app-control-text>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectCategorieRiservatarieArt18Component extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_categorie_riservatarie_art18';
      this.control = new FormControl(this.data.fl_categorie_riservatarie_art18, Validators.requiredTrue);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:categorie_riservatarie_codice', 
        new FormControl(this.data.categorie_riservatarie_codice)
      );
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:categorie_riservatarie_codice'].patchValue(null);
      }
      this.form.controls['jconon_application:categorie_riservatarie_codice']
        .setValidators(this.isFlCategorieRiservatarieArt18()? 
        [Validators.required] : undefined);
    }

    public isFlCategorieRiservatarieArt18(): boolean {
      return this.form.controls['jconon_application:fl_categorie_riservatarie_art18'].value;      
    }
}
