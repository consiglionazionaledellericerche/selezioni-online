import { ChangeDetectorRef, Input, OnInit } from "@angular/core";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { CmisObject } from "../common/model/cmisobject.model";
import { ValidationHelper } from "../common/validation/validation-helper";
import { CacheService } from "../core/cache.service";
import { AdMetadataComponent } from "../shared/tags/show/ad-metadata.component";

export abstract class DynamicComponent<T extends CmisObject> implements AdMetadataComponent, OnInit{
    @Input() data: T;
    @Input() form: FormGroup;
    public aspect: String[];
    constructor(
      protected cacheService: CacheService,
      protected changeDetectorRef: ChangeDetectorRef,
    ) {}

    protected control: AbstractControl;
    protected propertyName: string;

    ngAfterViewChecked() {
      this.changeDetectorRef.detectChanges();
    }

    ngOnInit(): void {
      if (this.aspect) {
        this.form.addControl('aspect', new FormControl(this.aspect));    
      }
    }

    public isLoaded(): boolean {
        return this.form !== undefined;
    }
  
    isInvalid(): boolean {
      if (this.form.controls[this.propertyName]){
          return this.form.controls[this.propertyName].status === 'INVALID';
      }
      return false;
    }

    isValid(): boolean  {
      if (this.form.controls[this.propertyName])
          return this.form.controls[this.propertyName].status !== 'INVALID';
      return true;
    }

    hasErrors() {
      return ValidationHelper.getValidationCodes(this.control);
    }
}
