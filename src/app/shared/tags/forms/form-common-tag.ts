import {Input} from '@angular/core';

export abstract class FormCommonTag {

  @Input() disabled = false;

  @Input() inline = false;

  @Input() label = null;

  @Input() noLabel = false;

  @Input() prepend;

  @Input() prependText;

  @Input() ttip;

  @Input() append;

  @Input() appendText;

  @Input() ttipAppend;

  @Input() placeholder;

  @Input() showValidation = true;

  @Input() focus = false;

  @Input() type = 'text';

  @Input() nullIfEmpty = false;

}
