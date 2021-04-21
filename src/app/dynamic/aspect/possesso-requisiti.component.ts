import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_possesso_requisiti',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <a class="it-has-checkbox flex-column">
          <div class="align-self-start pl-1 text-dark c-pointer" (click)="toggle()">{{'application.possesso_requisiti' | translate:{value: data.call.requisiti_link} }}</div>
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            [innerHtml]="data.call.requisiti | safeHtml" 
            formControlName="jconon_application:fl_possesso_requisiti">
          </app-control-toggle>
        </a>
      </form>
    `
  })
export class JcononAspectPossessoRequisitiComponent extends DynamicComponent<Application> {
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

    toggle() {
      let control = this.form.controls['jconon_application:fl_possesso_requisiti'];
      control.patchValue(!control.value); 
    }  
}
