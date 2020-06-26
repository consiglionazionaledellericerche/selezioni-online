import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-layout-title',
  template: `
    <div class="jumbotron jumbotron-fluid bg-primary text-white pr-1 pl-1 pb-3 pt-3">
      <h1 class="text-center" [ngClass]="titleClass">{{ title | translate}}</h1>
      <h3 *ngIf="subTitle" class="mt-3 text-center" [ngClass]="subTitleClass">{{ subTitle | translate}}</h3>
    </div>
      `
})
export class LayoutTitleComponent {

  @Input() title = 'Please set a title';

  @Input() titleClass = '';

  @Input() subTitle = '';

  @Input() subTitleClass = '';

  
}

