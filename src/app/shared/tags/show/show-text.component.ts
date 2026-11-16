import {Component, Input} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-show-text',
  template: `
    <span *ngIf="value !== null && value !== undefined && value !== ''" class="show-text small">
      <span>{{ label | translate }}</span>
      <span class="ms-1" [ngClass]="{'fw-semibold': strong}">{{ value }}</span>
    </span>
  `
})
export class ShowTextComponent {

  @Input() label;
  @Input() value;
  @Input() strong = true;
}
