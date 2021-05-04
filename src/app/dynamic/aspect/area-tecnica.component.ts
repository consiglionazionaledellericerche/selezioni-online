import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { ObjectTypeService } from '../../core/object-type.service';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_area_tecnica',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_area_tecnica' | translate" 
            formControlName="jconon_application:fl_area_tecnica">
          </app-control-toggle>  
          <div class="form-row w-100 pt-1">
            <div [hidden]="!isToggle()" class="form-group col-md-12">
              <app-control-select-model
                [inline]="true"
                [focus]="true"
                [label]="'label.jconon_application.area_tecnica'| translate"
                [labelactive]="'true'"
                [strings]="choice"
                [showValidation]="true"
                [allowClear]="true"
                [showValidation]="true"
                [placeholder]="'label.jconon_application.area_tecnica_placeholder'| translate"
                formControlName="jconon_application:area_tecnica">
                </app-control-select-model>          
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectAreaTecnicaComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected objectTypeService: ObjectTypeService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    protected choice: string[];

    ngOnInit(): void {
      this.objectTypeService.listChoice(
          'P:jconon_application:aspect_area_tecnica',
          'jconon_application:area_tecnica'
        ).subscribe((choice) => {
        this.choice = choice;
      });

      this.propertyName = 'jconon_application:fl_area_tecnica';
      this.control = new FormControl(this.data.fl_area_tecnica);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl('jconon_application:area_tecnica', new FormControl(this.data.area_tecnica ? this.data.area_tecnica[0] : undefined));
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      this.addRequiredValidatorForm('jconon_application:area_tecnica', this.data.call, Validators.required, this.isToggle(), reset);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_area_tecnica'].value;      
    }
}
