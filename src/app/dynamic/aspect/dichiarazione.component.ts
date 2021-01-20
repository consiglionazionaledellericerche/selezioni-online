import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'app-application-aspects',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <a class="it-has-checkbox flex-column">
            <div class="it-right-zone w-100 border-bottom-0">
                <label class="text-dark">{{label | translate }}</label>
                <div class="toggles mr-1">
                    <label for="{{name}}">
                        <input type="checkbox" id="{{name}}" formControlName="{{propertyName}}">
                        <span class="lever"></span>
                        <div *ngIf=isInvalid() class="text-truncate text-danger mt-n2">
                            <span *ngFor="let error of hasErrors()" class="pr-2">
                                <small class="align-top">{{ 'message.validation.' + error | translate }}</small>
                            </span>
                        </div>
                    </label>
                </div>
            </div>
        </a>
      </form>
    `
  })
export class JcononAspectsDichiarazioneComponent extends DynamicComponent {
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
}
