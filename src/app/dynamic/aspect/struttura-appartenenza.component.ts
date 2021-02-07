import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_struttura_appartenenza',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
          <div class="pt-3" [ngClass]="hoverClass" (mouseover)="hoverClass='shadow-lg'" (mouseout)="hoverClass=''">
            <div class="form-row w-100 pt-3 pl-2">
              <div class="form-group col-md-12">
                <app-control-text
                  [inline]="true"
                  [showValidation]="true"
                  [label]="'label.jconon_application.struttura_appartenenza'| translate"
                  formControlName="jconon_application:struttura_appartenenza">
                </app-control-text>
              </div>
            </div>  
          </div>  
      </form>
    `
  })
export class JcononAspectStrutturaAppartenenzaComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    public hoverClass : string;
    public isRequired = true;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:struttura_appartenenza';
      this.control = new FormControl(this.data.struttura_appartenenza, this.isRequired ? Validators.required : undefined);
      this.form.addControl(this.propertyName, this.control);
      super.ngOnInit();
    }
}
