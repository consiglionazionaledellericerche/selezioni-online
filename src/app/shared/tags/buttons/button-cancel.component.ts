import {Component, Input} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-button-cancel',
  template: `
      <button type="button" class="btn btn-sm btn-secondary me-1" [queryParams]="queryParams"
              [routerLink]="route" fragment="{{ fragment }}"> {{ "cancel" | translate}} </button>
  `
})
export class ButtonCancelComponent {

  @Input() route: string;

  @Input() fragment: null;

  @Input() queryParams = {};

}

