import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { ObjectTypeService } from '../../core/object-type.service';

@Component({
    selector: 'P:jconon_application:aspect_patente_guida',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlPatenteGuida()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark c-pointer" (click)="toggle()">{{'label.jconon_application.fl_patente_guida' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_patente_guida">
                    <input type="checkbox" (change)="onChangeToggle(true)" id="fl_patente_guida" formControlName="jconon_application:fl_patente_guida">
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
            <div [hidden]="!isFlPatenteGuida()" class="form-group col-md-6">
              <app-control-select-model
                [inline]="true"
                [focus]="true"
                [noLabel]="true"
                [strings]="choice"
                [showValidation]="true"
                [allowClear]="true"
                [showValidation]="true"
                [placeholder]="'label.jconon_application.lista_patente_guida_placeholder'| translate"
                formControlName="jconon_application:lista_patente_guida">
                </app-control-select-model>          
              <label for="lista_patente_guida" class="active">{{'label.jconon_application.lista_patente_guida'| translate}}</label>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectPatenteGuidaComponent extends DynamicComponent {
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
          'P:jconon_application:aspect_patente_guida',
          'jconon_application:lista_patente_guida'
        ).subscribe((choice) => {
        this.choice = choice;
      });

      this.propertyName = 'jconon_application:fl_patente_guida';
      this.control = new FormControl(this.data.fl_patente_guida, Validators.required);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl('jconon_application:lista_patente_guida', new FormControl(this.data.lista_patente_guida));
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:lista_patente_guida'].patchValue(null);
      }
      if (this.isFlPatenteGuida()) {
        this.form.controls['jconon_application:lista_patente_guida'].setValidators(Validators.required);
      } else {
        this.form.controls['jconon_application:lista_patente_guida'].setValidators(undefined);
      }
    }

    public isFlPatenteGuida(): boolean {
      return this.form.controls['jconon_application:fl_patente_guida'].value;      
    }
}
