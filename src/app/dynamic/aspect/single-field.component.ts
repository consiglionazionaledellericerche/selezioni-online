import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_single_field',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
          <div class="pt-3" [ngClass]="hoverClass" (mouseover)="hoverClass='shadow-lg'" (mouseout)="hoverClass=''">
            <div class="form-row w-100 pt-3 pl-2">
              <div class="form-group {{class}}">                
                <app-control-text
                  *ngIf="type == 'text'"
                  [inline]="true"
                  [focus]="true"
                  [showValidation]="true"
                  [label]="label| translate"
                  formControlName="{{propertyName}}">
                </app-control-text>
                <app-control-datepicker
                  *ngIf="type == 'date'"
                  [inline]="true"
                  [focus]="true"
                  [showValidation]="true"
                  [label]="label | translate"
                  formControlName="{{propertyName}}">
                </app-control-datepicker>
              </div>
            </div>  
          </div>  
      </form>
    `
  })
export class JcononAspectSingleFieldComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    public hoverClass : string;
    public isRequired = true;
    public name: string;
    public label: string;
    public class: string = 'col-md-12';
    public type: string = 'text';


    ngOnInit(): void {
      this.control = new FormControl(this.data[this.name], this.isRequired ? Validators.required : undefined);
      this.form.addControl(this.propertyName, this.control);
      super.ngOnInit();
    }
}
