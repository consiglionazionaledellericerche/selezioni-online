import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { ObjectTypeService } from '../../core/object-type.service';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_conoscenza_lingue',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.fl_conoscenza_lingue' | translate" 
            formControlName="jconon_application:fl_conoscenza_lingue">
          </app-control-toggle>
          <div class="form-row w-100 pt-1">
            <div [hidden]="!isToggle()" class="form-group col-md-12">
              <app-control-select-model
                [inline]="true"
                [focus]="!form.pristine"
                [multiple]="true"
                [multiSelectIcon]="'fa-flag-checkered'"
                [noLabel]="true"
                [strings]="choice"
                [showValidation]="true"
                [allowClear]="true"
                [showValidation]="true"
                [placeholder]="'label.jconon_application.elenco_lingue_conosciute_placeholder'| translate"
                formControlName="jconon_application:elenco_lingue_conosciute">
                </app-control-select-model>          
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectConoscenzaLingueComponent extends DynamicComponent<Application> {
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
          'P:jconon_application:aspect_conoscenza_lingue',
          'jconon_application:elenco_lingue_conosciute'
        ).subscribe((choice) => {
        this.choice = choice;
      });

      this.propertyName = 'jconon_application:fl_conoscenza_lingue';
      this.control = new FormControl(this.data.fl_conoscenza_lingue, this.isRequiredValidator(this.propertyName, this.data.call));
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl('jconon_application:elenco_lingue_conosciute', new FormControl(this.data.elenco_lingue_conosciute));
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      this.addRequiredValidatorForm('jconon_application:elenco_lingue_conosciute', this.data.call, Validators.required, this.isToggle(), reset);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:fl_conoscenza_lingue'].value;      
    }
}
