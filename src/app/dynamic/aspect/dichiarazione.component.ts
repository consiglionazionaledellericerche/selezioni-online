import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'app-application-aspects',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            [label]="label | translate" 
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

    ngOnInit(): void {
      this.control = new FormControl(this.data[this.name]);
      if (this.required) {
        this.control.setValidators(Validators.requiredTrue);
      }  
      this.form.addControl(this.propertyName, this.control);
      super.ngOnInit();
    }

    onChangeToggle(reset: boolean){}
}
