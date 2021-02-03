import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';
import { Helpers } from '../../common/helpers/helpers';

@Component({
    selector: 'P:jconon_application:aspect_h_index',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
          <div class="pt-3" [ngClass]="hoverClass" (mouseover)="hoverClass='shadow-lg'" (mouseout)="hoverClass=''">
            <div class="form-row w-100 pt-3 pl-2">
              <div class="form-group col-md-8">
                <label for="jconon_application:h_index_fonte" class="font-weight-bold active">{{'label.jconon_application.h_index_fonte'| translate}}</label>
                <app-control-select-model
                  [inline]="true"
                  [noLabel]="true"
                  [strings]="choice"
                  [showValidation]="true"
                  [allowClear]="true"
                  [placeholder]="'label.jconon_application.h_index_fonte_placeholder'| translate"
                  formControlName="jconon_application:h_index_fonte">
                </app-control-select-model>
              </div>
              <div class="form-group col-md-4">
                <app-control-text
                  [inline]="true"
                  [showValidation]="true"
                  [label]="'label.jconon_application.h_index_valore'| translate"
                  formControlName="jconon_application:h_index_valore">
                </app-control-text>
              </div>
            </div>  
          </div>  
      </form>
    `
  })
export class JcononAspectHIndexComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }
    public choice: string[] = ['Google Scholar', 'ISI-Wos'];
    public hoverClass : string;
    public isRequired = true;

    ngOnInit(): void {
      this.propertyName = 'jconon_application:h_index_fonte';
      this.control = new FormControl(this.data.h_index_fonte, this.isRequired ? Validators.required : undefined);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl('jconon_application:h_index_valore', 
        new FormControl(
          this.data.h_index_valore, [
            Validators.required, 
            Helpers.patternValidator(/^[0-9]+$/, { onlyNumber: true })
          ]
        )
      );
      super.ngOnInit();
    }

}
