import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-layout-title',
  template: `
    <div class="shadow-none p-3 mb-5 bg-light pr-1 pl-1 pb-3 pt-3 mb-3 mt-n3 ml-n3 mr-n3">
      <h1 *ngIf="title" class="text-center" [ngClass]="titleClass">{{ title | translate}}</h1>
      <h3 *ngIf="subTitle" class="mt-3 text-justify" [ngClass]="subTitleClass">{{ subTitle | translate}}</h3>
    </div>
      `
})
export class LayoutTitleComponent {

  @Input() title = '';

  @Input() titleClass = '';

  @Input() subTitle = '';

  @Input() subTitleClass = '';

  
}

