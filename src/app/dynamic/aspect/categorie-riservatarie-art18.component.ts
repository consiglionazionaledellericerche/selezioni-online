import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_categorie_riservatarie_art18',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_categorie_riservatarie_art18' | translate" 
            formControlName="jconon_application:fl_categorie_riservatarie_art18">
          </app-control-toggle>
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
export class JcononAspectCategorieRiservatarieArt18Component extends DynamicComponent<Application> {
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
        .setValidators(this.isToggle()? 
        [Validators.required] : undefined);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_categorie_riservatarie_art18'].value;      
    }
}
