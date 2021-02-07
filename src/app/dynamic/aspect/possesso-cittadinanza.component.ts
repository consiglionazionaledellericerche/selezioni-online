import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { ObjectTypeService } from '../../core/object-type.service';

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
                [focus]="true"
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
                [focus]="true"
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
export class JcononAspectPossessoCittadinanzaComponent extends DynamicComponent {
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
      this.control = new FormControl(this.data.afl_cittadinanza_italiana_lista, Validators.required);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl('jconon_application:possesso_cittadinanza', new FormControl(this.data.possesso_cittadinanza));
      this.form.addControl('jconon_application:cittadinanza_stato_estero', new FormControl(this.data.cittadinanza_stato_estero));
      this.onChangeToggle(false);
      super.ngOnInit();
    }

    public onChangeToggle(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:possesso_cittadinanza'].patchValue(null);
        this.form.controls['jconon_application:cittadinanza_stato_estero'].patchValue(null);
      }
      if (this.isToggle()) {
        this.form.controls['jconon_application:possesso_cittadinanza'].setValidators(undefined);
        this.form.controls['jconon_application:cittadinanza_stato_estero'].setValidators(undefined);
      } else {
        this.form.controls['jconon_application:possesso_cittadinanza'].setValidators(Validators.required);
        this.form.controls['jconon_application:cittadinanza_stato_estero'].setValidators(Validators.required);
      }
    }

    public isToggle(): boolean {
      return this.form.controls['jconon_application:afl_cittadinanza_italiana_lista'].value;      
    }
}
