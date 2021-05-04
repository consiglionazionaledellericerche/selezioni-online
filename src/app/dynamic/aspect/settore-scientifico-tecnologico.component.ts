import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ObjectTypeService } from '../../core/object-type.service';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Application } from '../../core/application/application.model';

@Component({
    selector: 'P:jconon_application:aspect_settore_scientifico_tecnologico',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
          <div class="pt-3" [ngClass]="hoverClass" (mouseover)="hoverClass='shadow-lg'" (mouseout)="hoverClass=''">
            <div class="form-row w-100 pt-3 pl-2">
              <div class="form-group col-md-12">
                <app-control-select-model
                  [inline]="true"
                  [label]="'label.jconon_application.settore_scientifico_tecnologico'| translate"
                  [labelactive]="'true'"
                  [strings]="choice"
                  [showValidation]="true"
                  [allowClear]="true"
                  [placeholder]="'label.jconon_application.settore_scientifico_tecnologico_placeholder'| translate"
                  formControlName="jconon_application:settore_scientifico_tecnologico">
                </app-control-select-model>
              </div>
            </div>  
          </div>  
      </form>
    `
  })
export class JcononAspectSettoreScientificoTecnologicoComponent extends DynamicComponent<Application> {
    constructor(
      protected cacheService: CacheService,
      protected objectTypeService: ObjectTypeService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    public choice: string[];
    public hoverClass : string;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:settore_scientifico_tecnologico';
      this.objectTypeService.listChoice('P:jconon_application:aspect_settore_scientifico_tecnologico',this.propertyName).subscribe((choice) => {
        this.choice = choice;
      });
      this.control = new FormControl(this.data.settore_scientifico_tecnologico ? this.data.settore_scientifico_tecnologico[0] : undefined, 
        this.isRequiredValidator(this.propertyName, this.data.call));
      this.form.addControl(this.propertyName, this.control);
      super.ngOnInit();
    }
}
