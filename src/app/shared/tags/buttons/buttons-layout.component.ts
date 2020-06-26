import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-buttons-layout',
  template:
      `
    <div class="form-group row pt-2 pb-2">
      <div class="col-sm-2"></div>
      <div class="col-sm-10">
        <ng-content></ng-content>
      </div>
    </div>
  `})
export class ButtonsLayoutComponent {

}

