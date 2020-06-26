
export class CheckboxModel {

  constructor(public id,
              public label,
              public value,
              public selected,
              public disabled) {}


  public static booleanBox(value: boolean, disabled: boolean = false): CheckboxModel[] {
    return [
      new CheckboxModel('booleanBox', '', true, value, false)
    ];
  }

}
