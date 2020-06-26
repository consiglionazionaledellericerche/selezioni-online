import {Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-new',
  template: `
    <button *ngIf="active" type="button" [queryParams]="queryParams" [routerLink]="[route]" class="btn btn-info btn-{{ size }}">
      <i class="fa fa-plus"></i> {{ title | translate }}
    </button>
  `
})
export class ButtonNewComponent {

  @Input() route = '..';

  @Input() size = 'sm';

  @Input() title = 'new';

  @Input() queryParams = {};

  @Input() active = false;

}

