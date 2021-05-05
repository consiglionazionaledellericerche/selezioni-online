import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { ObjectTypeService } from '../../core/object-type.service';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_possesso_cittadinanza',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isToggle()">
        <a class="it-has-checkbox flex-column">
          <app-control-toggle
            class="it-right-zone w-100 border-bottom-0" 
            (onChangeToggle)="onChangeToggle(true)"
            [label]="'label.jconon_application.afl_cittadinanza_italiana_lista' | translate" 
            formControlName="jconon_application:afl_cittadinanza_italiana_lista">
          </app-control-toggle>            
          <div class="form-row w-100 pt-1">
            <div [hidden]="isToggle()" class="form-group col-md-8">
              <app-control-select-model
                [inline]="true"
                [focus]="!form.pristine"
                [label]="'label.jconon_application.possesso_cittadinanza'| translate"
                [labelactive]="'true'"
                [strings]="choice"
                [showValidation]="true"
                [allowClear]="true"
                [showValidation]="true"
                [placeholder]="'label.jconon_application.possesso_cittadinanza_placeholder'| translate"
                formControlName="jconon_application:possesso_cittadinanza">
                </app-control-select-model>          
            </div>
            <div [hidden]="isToggle()" class="form-group col-md-4">
              <app-control-select-model
                [inline]="true"
                [focus]="!form.pristine"
                [label]="'label.jconon_application.cittadinanza_stato_estero'| translate"
                [labelactive]="'true'"
                [strings]="paesi"
                [showValidation]="true"
                [allowClear]="true"
                [showValidation]="true"
                [placeholder]="'label.jconon_application.cittadinanza_stato_estero_placeholder'| translate"
                formControlName="jconon_application:cittadinanza_stato_estero">
              </app-control-select-model>          
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectPossessoCittadinanzaComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected objectTypeService: ObjectTypeService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    protected paesi: string[];
    protected choice: string[];

    ngOnInit(): void {
      this.cacheService.paesi().subscribe((paesi) => {
        this.paesi = paesi;
      });
      this.objectTypeService.listChoice(
          'P:jconon_application:aspect_possesso_cittadinanza',
          'jconon_application:possesso_cittadinanza'
        ).subscribe((choice) => {
        this.choice = choice;
      });

      this.propertyName = 'jconon_application:afl_cittadinanza_italiana_lista';
      this.control = new FormControl(this.data.afl_cittadinanza_italiana_lista, this.isRequiredValidator(this.propertyName, this.data.call));
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl('jconon_application:possesso_cittadinanza', new FormControl(this.data.possesso_cittadinanza));
      this.form.addControl('jconon_application:cittadinanza_stato_estero', new FormControl(this.data.cittadinanza_stato_estero));
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      this.addRequiredValidatorForm('jconon_application:possesso_cittadinanza', this.data.call, Validators.required, !this.isToggle(), reset);
      this.addRequiredValidatorForm('jconon_application:cittadinanza_stato_estero', this.data.call, Validators.required, !this.isToggle(), reset);
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:afl_cittadinanza_italiana_lista'].value;      
    }
}
