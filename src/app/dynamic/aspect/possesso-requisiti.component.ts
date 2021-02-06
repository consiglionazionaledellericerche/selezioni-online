import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_possesso_requisiti',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <a class="it-has-checkbox flex-column">
            <div class="align-self-start pl-1 text-dark c-pointer" (click)="toggle()">{{'application.possesso_requisiti' | translate:{value: data.call.requisiti_link} }}</div>
            <div class="it-right-zone w-100 border-bottom-0">
                <div class="text-dark c-pointer" (click)="toggle()" [innerHtml]="data.call.requisiti | safeHtml"></div>
                <div class="toggles mr-1">
                    <label for="fl_possesso_requisiti">
                        <input type="checkbox" id="fl_possesso_requisiti" formControlName="jconon_application:fl_possesso_requisiti">
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
export class JcononAspectPossessoRequisitiComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    
    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_possesso_requisiti';
      this.control = new FormControl(this.data.fl_possesso_requisiti, Validators.requiredTrue);
      this.form.addControl(this.propertyName, this.control);
      super.ngOnInit();
    }

    onChangeToggle(reset: boolean) {
      
    }
}
