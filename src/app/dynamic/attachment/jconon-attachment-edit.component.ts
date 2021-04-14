import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DynamicComponent } from '../dynamic.component';
import { CacheService } from '../../core/cache.service';
import { Document } from '@src/app/common/model/document.model';

@Component({
    selector: 'D:jconon_attachment:document',
    template: `
      <form [formGroup]="form" *ngIf="isLoaded()">
        <div class="form-row w-100 pt-1">
          <div class="form-group col-md-12">
            <app-control-text 
              [showValidation]="true"
              [focus]="true"
              [inline]="true" 
              [label]="'title'| translate" 
              formControlName="cm:title">
            </app-control-text>
          </div>
        </div>  
        <div class="form-row w-100 pt-1">
          <div class="form-group col-md-12">
            <app-control-textarea 
              [showValidation]="true"
              rows="5"
              [inline]="true" 
              [label]="'description'| translate" 
              formControlName="cm:description">
            </app-control-textarea>
          </div>
        </div>  
      </form>
  `
  })
export class JcononAttachmentEditComponent extends DynamicComponent<Document> {
  constructor(
    protected cacheService: CacheService,
    protected changeDetectorRef: ChangeDetectorRef,
  ) {
    super(cacheService, changeDetectorRef);
  }

  ngOnInit(): void {
    this.aspect = ['P:cm:titled'];
    this.form.addControl(
      'cm:title', 
      new FormControl(this.data ? this.data.title: undefined)
    );
    this.form.addControl(
      'cm:description', 
      new FormControl(this.data ? this.data.description: undefined)
    );
    super.ngOnInit();
  }

}