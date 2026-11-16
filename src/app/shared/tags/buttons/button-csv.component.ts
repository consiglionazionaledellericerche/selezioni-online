import {Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-button-csv',
  template: `
  <button *ngIf="active" class="{{class}}">
    <i class="fa fa-2x fa-file-excel-o text-success" tooltipPlacement="right" [itTooltip]="title | translate"></i>
  </button>
  `
})
export class ButtonCsvComponent {

  @Input() title = 'csv';

  @Input() class = 'btn btn-link';
  
  @Input() active = true;

}

