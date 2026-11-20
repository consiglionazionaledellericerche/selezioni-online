import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
  standalone: false,
    selector: 'app-application-aspects',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            [label]="label | translate" 
            [yesNo]="!!radio && !!required"
            formControlName="{{propertyName}}">
          </app-control-toggle>
        </a>
      </form>
    `
  })
export class JcononAspectsDichiarazioneComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    public name: string;
    public required: boolean;
    public label: string;
    /** Sì/No del legacy (ui.radio): obbligatorio vuol dire rispondere, anche "No"; altrimenti (casella) serve "Sì". */
    public radio: boolean;

    ngOnInit(): void {
      const value = this.data[this.name];
      this.control = new FormControl(this.radio && this.required && (value === undefined || value === null) ? null : value);
      this.control.setValidators(this.isRequiredValidator(this.propertyName, this.data.call,
        this.radio ? Validators.required : Validators.requiredTrue, this.required));
      this.form.addControl(this.propertyName, this.control);
      super.ngOnInit();
    }

    onChangeToggle(reset: boolean){}
}
