import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Comune } from '../../common/model/comune.model';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';
import { Select2Template } from '../../common/template/select2-template';
import { CallService } from '../../core/call/call.service';

@Component({
  standalone: false,
    selector: 'P:jconon_application:aspect_ente_appartenenza',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
          <div class="pt-3" [ngClass]="hoverClass" (mouseover)="hoverClass='shadow-lg'" (mouseout)="hoverClass=''">
            <div class="row gx-2 w-100 pt-3 ps-2">
              <div class="form-group col-md-12">
                <app-control-text
                  [inline]="true"
                  [focus]="!form.pristine"
                  [showValidation]="true"
                  [label]="'label.jconon_application.ente_appartenenza'| translate"
                  formControlName="jconon_application:ente_appartenenza">
                </app-control-text>
              </div>
            </div>
            <div class="row gx-2 w-100 pt-1 ps-2">
              <div class="form-group col-md-9">
                <app-control-comune
                  [label]="'label.jconon_application.comune_ente_appartenenza'| translate"
                  [placeholder]="'placeholder.select.place'| translate"
                  [attivi]="true"
                  (changed)="onChangeComune($event)"
                  formControlName="jconon_application:comune_ente_appartenenza">
                </app-control-comune>          
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
export class JcononAspectEnteAppartenenzaComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
      protected callService: CallService,
    ) {
      super(cacheService, changeDetectorRef);
    }
    public comuniTemplate = Select2Template.comuni;
    public hoverClass : string;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:ente_appartenenza';
      this.control = new FormControl(this.data.ente_appartenenza, this.isRequiredValidator(this.propertyName, this.data.call));
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:comune_ente_appartenenza', 
        new FormControl(this.data.comune_ente_appartenenza ? 
            new Comune(this.data.comune_ente_appartenenza,
                        this.data.provincia_ente_appartenenza) : undefined, 
            this.isRequiredValidator('jconon_application:comune_ente_appartenenza', this.data.call)
        )
      );
      this.form.addControl(
        'jconon_application:provincia_ente_appartenenza', 
        new FormControl(this.data.provincia_ente_appartenenza, this.isRequiredValidator('jconon_application:provincia_ente_appartenenza', this.data.call))
      );
      super.ngOnInit();
    }

    public onChangeComune(comune: any) {
      // provincia dal comune scelto (archivio ANPR)
      this.form.controls['jconon_application:provincia_ente_appartenenza'].patchValue(comune ? comune.provincia : null);
    }

}
