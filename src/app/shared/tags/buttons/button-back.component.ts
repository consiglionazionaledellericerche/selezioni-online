import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-button-back',
  template: `<button type="button" class="btn btn-sm btn-secondary"
                     [queryParams]="queryparams" fragment="{{ fragment }}" [routerLink]="[route]" > {{ "back" | translate}} </button> `
})
export class ButtonBackComponent {

  @Input() route = '..';

  @Input() queryparams = {};

  @Input() fragment: null;
}

