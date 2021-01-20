import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CacheService } from '../../core/cache.service';
import { DynamicComponent } from '../dynamic.component';

@Component({
    selector: 'P:jconon_application:aspect_aspect_godimento_diritti',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()" [ngSwitch]="isFlGodimentoDiritti()">
        <a class="it-has-checkbox flex-column">
          <div class="it-right-zone w-100 border-bottom-0">
            <label class="text-dark">{{'label.jconon_application.fl_godimento_diritti' | translate }}</label>
            <div class="toggles mr-1">
                <label for="fl_godimento_diritti">
                    <input type="checkbox" (change)="onChangeFlGodimentoDiritti(true)" id="fl_godimento_diritti" 
                      formControlName="jconon_application:fl_godimento_diritti">
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
            <div *ngSwitchCase="false" class="form-group col-md-12">
              <app-control-textarea 
                [showValidation]="true"
                rows="5" 
                [inline]="true" 
                [label]="'label.jconon_application.motivazione_no_godimento_diritti'| translate" 
                formControlName="jconon_application:motivazione_no_godimento_diritti">
              </app-control-textarea>
            </div>
          </div>  
        </a>
      </form>
    `
  })
export class JcononAspectGodimentoDirittiComponent extends DynamicComponent {
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {
      super(cacheService, changeDetectorRef);
    }

    ngOnInit(): void {
      this.propertyName = 'jconon_application:fl_godimento_diritti';
      this.control = new FormControl(this.data.fl_godimento_diritti, Validators.required);
      this.form.addControl(this.propertyName, this.control);
      this.form.addControl(
        'jconon_application:motivazione_no_godimento_diritti', 
        new FormControl(this.data.motivazione_no_godimento_diritti)
      );
      this.onChangeFlGodimentoDiritti(false);
      super.ngOnInit();
    }

    public onChangeFlGodimentoDiritti(reset: boolean) {
      if (reset) {
        this.form.controls['jconon_application:motivazione_no_godimento_diritti'].patchValue(null);
      }
      if (this.isFlGodimentoDiritti()) {
        this.form.controls['jconon_application:motivazione_no_godimento_diritti'].setValidators(undefined);
      } else {
        this.form.controls['jconon_application:motivazione_no_godimento_diritti'].setValidators(Validators.required);
      }
    }

    public isFlGodimentoDiritti(): boolean {
      return this.form.controls['jconon_application:fl_godimento_diritti'].value;      
    }
}
