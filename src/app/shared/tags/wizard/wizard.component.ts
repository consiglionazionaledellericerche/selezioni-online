import {Component, Input, ViewEncapsulation} from '@angular/core';
import {Wizard} from '../../../common/model/wizard.model';

@Component({
  selector: 'app-wizard',
  template:
     `
    <!--<div class="card">-->
      <!--<div class="card-body p-4">-->
        <ul class="nav nav-pills nav-fill mb-3">
          <li *ngFor="let item of wizard.items" class="nav-item"
              app-wizard-item
              [icon]="item.icon"
              [active]="wizard.isActive(item.id)">
        </ul>
        <!--<hr>-->
        <ng-content></ng-content>
      <!--</div>-->
    <!--</div>-->
    `,
  styles:
      [],
  encapsulation: ViewEncapsulation.None
})
export class WizardComponent {

  @Input() wizard: Wizard;

  constructor() {}

}

