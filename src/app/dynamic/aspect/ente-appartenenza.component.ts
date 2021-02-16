import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Comune } from '../../common/model/comune.model';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_ente_appartenenza',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
          <div class="pt-3" [ngClass]="hoverClass" (mouseover)="hoverClass='shadow-lg'" (mouseout)="hoverClass=''">
            <div class="form-row w-100 pt-3 pl-2">
              <div class="form-group col-md-12">
                <app-control-text
                  [inline]="true"
                  [focus]="true"
                  [showValidation]="true"
                  [label]="'label.jconon_application.ente_appartenenza'| translate"
                  formControlName="jconon_application:ente_appartenenza">
                </app-control-text>
              </div>
            </div>
            <div class="form-row w-100 pt-1 pl-2">
              <div class="form-group col-md-9">
                  <app-control-select-model
                  [inline]="true"
                  [focus]="true"
                  [label]="'label.jconon_application.comune_ente_appartenenza'| translate"
                  [labelactive]="'true'"
                  [items]="comuni"
                  (onChangeEvent)="onChangeComune($event)"
                  [allowClear]="true"
                  [showValidation]="true"
                  [placeholder]="'placeholder.select.place'| translate"
                  formControlName="jconon_application:comune_ente_appartenenza">
                </app-control-select-model>          
              </div>
              <div class="form-group col-md-3">
                <app-control-text 
                  [disabled]="true" 
                  [showValidation]="false" 
                  type="text" 
                  [inline]="true" 
                  [label]="'label.jconon_application.provincia_ente_appartenenza' | translate" 
                  formControlName="jconon_application:provincia_ente_appartenenza">
                </app-control-text>
              </div>
            </div>  
          </div>  
      </form>
    `
  })
export class JcononAspectEnteAppartenenzaComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    public hoverClass : string;
    public comuni: Comune[];
    public isRequired = true;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:ente_appartenenza';
      this.cacheService.comuni().subscribe((comuni) => {
        this.comuni = comuni;
      });
      this.control = new FormControl(this.data.ente_appartenenza, this.isRequired ? Validators.required : undefined);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:comune_ente_appartenenza', 
        new FormControl(new Comune(this.data.comune_ente_appartenenza,this.data.provincia_ente_appartenenza), Validators.required)
      );
      this.form.addControl(
        'jconon_application:provincia_ente_appartenenza', 
        new FormControl(this.data.provincia_ente_appartenenza, Validators.required)
      );
      super.ngOnInit();
    }
    public onChangeComune(comune: any) {
      if (comune) {
        this.form.controls['jconon_application:provincia_ente_appartenenza'].patchValue(comune.provincia);
      } else {
        this.form.controls['jconon_application:provincia_ente_appartenenza'].patchValue(null);
      }
    }

}
