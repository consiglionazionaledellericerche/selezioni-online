import {Component} from '@angular/core';

@Component({
  selector: 'app-list-header-layout',
  template:
     `
    <div class="container">
      <div class="row">
        <div class="pl-0 pr-0 mb-2 col-12">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
    `,
})
export class ListHeaderLayoutComponent {

}

