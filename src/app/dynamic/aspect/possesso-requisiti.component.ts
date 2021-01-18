import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_possesso_requisiti',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <a class="it-has-checkbox flex-column">
            <div class="align-self-start pl-1 text-dark">{{'application.possesso_requisiti' | translate:{value: data.call.requisiti_link} }}</div>
            <div class="it-right-zone w-100">
                <div class="text-dark" [innerHtml]="data.call.requisiti | safeHtml"></div>
                <div class="toggles">
                    <label for="fl_possesso_requisiti">
                        <input type="checkbox" id="fl_possesso_requisiti" formControlName="jconon_application:fl_possesso_requisiti">
                        <span class="lever"></span>
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
      console.log(this.data.call.requisiti);
      this.form.addControl('jconon_application:fl_possesso_requisiti', new FormControl(
          this.data.fl_possesso_requisiti, 
          Validators.required
        )
      );
      super.ngOnInit();
    }
}