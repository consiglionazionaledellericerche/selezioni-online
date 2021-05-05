import { ChangeDetectorRef, Input, OnInit } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { CmisObject } from "../common/model/cmisobject.model";
import { ValidationHelper } from "../common/validation/validation-helper";
import { CacheService } from "../core/cache.service";
import { Call } from "../core/call/call.model";
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

    protected addRequiredValidatorForm(property: string, call: Call, validator?: ValidatorFn, condition?: boolean, reset?: boolean) {
      if (reset) {
        this.form.controls[property].patchValue(null);
      }
      this.form.controls[property]
        .setValidators(this.isRequiredValidator(property, call, validator, condition));
    }

    protected isRequiredValidator(property: string, call: Call, validator?: ValidatorFn, condition?: boolean): ValidatorFn {
      var isRequired = (call.elenco_field_not_required || []).indexOf(property) === -1; 
      if (condition !== undefined) {
        isRequired = isRequired && condition;
      }
      console.log(property + ' '+ isRequired + ' ' + condition);
      return isRequired ? validator||Validators.required : Validators.nullValidator;
    }

    hasErrors() {
      return ValidationHelper.getValidationCodes(this.control);
    }
}
