import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { ObjectTypeService } from '../../core/object-type.service';

@Component({
    selector: 'P:jconon_application:aspect_conoscenza_lingue',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlConoscenzaLingue()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark c-pointer" (click)="toggle()">{{'label.jconon_application.fl_conoscenza_lingue' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_conoscenza_lingue">
                    <input type="checkbox" (change)="onChangeToggle(true)" id="fl_conoscenza_lingue" formControlName="jconon_application:fl_conoscenza_lingue">
                    <span class="lever"></span>
                    <div *ngIf=isInvalid() class="text-truncate text-danger mt-n2">
                      <span *ngFor="let error of hasErrors()" class="pr-2">
                        <small class="align-top">{{ 'message.validation.' + error | translate }}</small>
                      </span>
                    </div>
                </label>
            </div>
          </div>
          <div class="form-row w-100 pt-1">
            <div [hidden]="!isFlConoscenzaLingue()" class="form-group col-md-12">
              <app-control-select-model
                [inline]="true"
                [focus]="true"
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
export class JcononAspectConoscenzaLingueComponent extends DynamicComponent {
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
      this.control = new FormControl(this.data.fl_conoscenza_lingue, Validators.required);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl('jconon_application:elenco_lingue_conosciute', new FormControl(this.data.elenco_lingue_conosciute));
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:elenco_lingue_conosciute'].patchValue(null);
      }
      if (this.isFlConoscenzaLingue()) {
        this.form.controls['jconon_application:elenco_lingue_conosciute'].setValidators(Validators.required);
      } else {
        this.form.controls['jconon_application:elenco_lingue_conosciute'].setValidators(undefined);
      }
    }

    public isFlConoscenzaLingue(): boolean {
      return this.form.controls['jconon_application:fl_conoscenza_lingue'].value;      
    }
}
