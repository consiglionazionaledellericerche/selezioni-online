import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Sede } from '../../common/model/sede.model';
import { Helpers } from '../../common/helpers/helpers';

@Component({
    selector: 'P:jconon_application:aspect_sede',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
          <div class="pt-3" [ngClass]="hoverClass" (mouseover)="hoverClass='shadow-lg'" (mouseout)="hoverClass=''">
            <div class="form-row w-100 pt-3 pl-2">
              <div class="form-group col-md-12">
                <app-control-select-model
                  [inline]="true"
                  [label]="'label.jconon_application.sede'| translate"
                  [labelactive]="'true'"
                  [multiple]="true"
                  [multiSelectIcon]="'fa-building'"
                  [popoverMulti]="true"
                  (onChangeEvent)="onChangeSede($event)"
                  [strings]="sediLabel"
                  [showValidation]="true"
                  [allowClear]="true"
                  [placeholder]="'label.jconon_application.sede_placeholder'| translate"
                  formControlName="jconon_application:descrizione_sede">
                </app-control-select-model>
                <input type="hidden" formControlName="jconon_application:sede">
              </div>
            </div>  
          </div>  
      </form>
    `
  })
export class JcononAspectSedeComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    public sedi: Sede[];
    public sediLabel: string[];
    public hoverClass : string;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:descrizione_sede';
      this.cacheService.sedi('true').subscribe((sedi) => {
        this.sedi = sedi;
        this.sediLabel = sedi.map((sede: Sede) => {
          return sede.label;
        })
      });

      this.control = new FormControl(this.data.descrizione_sede, [
        Validators.required,
        Helpers.maxLengthArrayValidator(2, {maxlengtharray2: true})
      ]);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl('jconon_application:sede', new FormControl(this.data.sede));

      super.ngOnInit();
    }

    public onChangeSede(sediLabel: string[]) {
      this.form.controls['jconon_application:sede'].patchValue(
        this.sedi.filter((sede: Sede) => {
          return sediLabel.indexOf(sede.label) !== -1;
        }).map((sede: Sede) => {
          return sede.id;
        })
      );
    }
}
