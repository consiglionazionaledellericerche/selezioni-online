import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Il valore del controllo deve coincidere con quello del campo indicato dello stesso FormGroup
 * (sostituisce RxwebValidators.compare di @rxweb/reactive-form-validators).
 */
export function compareValidator(fieldName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const other = control.parent ? control.parent.get(fieldName) : null;
    if (!other || control.value === null || control.value === undefined || control.value === '') {
      return null;
    }
    return control.value === other.value ? null : { compare: { fieldName } };
  };
}
