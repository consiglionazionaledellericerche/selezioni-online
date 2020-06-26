import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-show-layout',
  template:
     `
    <div class="row mt-3 mb-3">
      <div class="col-sm-2 text-right">
        <strong *ngIf="strong"> {{ label | translate }} </strong>
        <span *ngIf="!strong"> {{ label | translate }} </span>
      </div>
      <div class="col-sm-10">
        <ng-content></ng-content>
      </div>
    </div>
    `,
})
export class ShowLayoutComponent {

  @Input() label = 'Field';
  @Input() strong = true;

}

