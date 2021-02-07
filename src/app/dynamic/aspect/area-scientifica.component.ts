import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ObjectTypeService } from '../../core/object-type.service';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_area_scientifica',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
          <div class="pt-3" [ngClass]="hoverClass" (mouseover)="hoverClass='shadow-lg'" (mouseout)="hoverClass=''">
            <div class="form-row w-100 pt-3 pl-2">
              <div class="form-group col-md-12">
                <app-control-select-model
                  [inline]="true"
                  [label]="'label.jconon_application.area_scientifica'| translate"
                  [labelactive]="'true'"
                  [strings]="choice"
                  [showValidation]="true"
                  [allowClear]="true"
                  [placeholder]="'label.jconon_application.area_scientifica_placeholder'| translate"
                  formControlName="jconon_application:area_scientifica">
                </app-control-select-model>
              </div>
            </div>  
          </div>  
      </form>
    `
  })
export class JcononAspectAreaScientificaComponent extends DynamicComponent {
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
      this.propertyName = 'jconon_application:area_scientifica';
      this.objectTypeService.listChoice('P:jconon_application:aspect_area_scientifica',this.propertyName).subscribe((choice) => {
        this.choice = choice;
      });
      this.control = new FormControl(this.data.area_scientifica ? this.data.area_scientifica[0] : undefined, 
        this.isRequired ? Validators.required : undefined);
      this.form.addControl(this.propertyName, this.control);
      super.ngOnInit();
    }
}
