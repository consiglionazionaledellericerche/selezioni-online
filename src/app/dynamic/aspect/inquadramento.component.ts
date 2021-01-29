import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ObjectTypeService } from '../../core/object-type.service';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_inquadramento',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
          <div class="pt-3" [ngClass]="hoverClass" (mouseover)="hoverClass='shadow-lg'" (mouseout)="hoverClass=''">
            <div class="form-row w-100 pt-3 pl-2">
              <div class="form-group col-md-12">
                <label for="jconon_application:profilo" class="font-weight-bold active">{{'label.jconon_application.profilo'| translate}}</label>
                <app-control-select-model
                  [inline]="true"
                  [noLabel]="true"
                  [strings]="choice"
                  [showValidation]="true"
                  [allowClear]="true"
                  [showValidation]="true"
                  [placeholder]="'label.jconon_application.profilo_placeholder'| translate"
                  formControlName="jconon_application:profilo">
                </app-control-select-model>
              </div>
            </div>  
          </div>  
      </form>
    `
  })
export class JcononAspectInquadramentoComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected objectTypeService: ObjectTypeService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    public choice: string[];
    public hoverClass : string;
    public isRequired = true;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:profilo';
      this.objectTypeService.listChoice('P:jconon_application:aspect_inquadramento',this.propertyName).subscribe((choice) => {
        this.choice = choice;
      });
      this.control = new FormControl(this.data.profilo, this.isRequired ? Validators.required : undefined);
      this.form.addControl(this.propertyName, this.control);
      super.ngOnInit();
    }

}
