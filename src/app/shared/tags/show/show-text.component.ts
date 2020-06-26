import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-show-text',
  template: `
    <span *ngIf="value" class="mr-1">
      <span>{{ label | translate }}</span>
      <span class="ml-1" [ngClass]="{'font-weight-bold': strong}">{{ value }}</span>
    </span>
  `
})
export class ShowTextComponent {

  @Input() label;
  @Input() value;
  @Input() strong = true;
}
