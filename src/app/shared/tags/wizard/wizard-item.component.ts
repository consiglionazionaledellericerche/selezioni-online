import {Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: '[app-wizard-item]',
  template:
     `
    <!--<li class="nav-item">-->
      <div *ngIf="active" class="card">
        <div class="card-body p-0 bg-light">
          <a class="nav-link">
            <i *ngIf="active" class="fa fa-{{ icon }} fa-2x text-secondary"></i>

          </a>
        </div>
      </div>

      <a *ngIf="!active" class="nav-link">
         <span class="fa-stack text-secondary fa-lg">
            <i class="fa fa-circle-thin fa-stack-2x"></i>
            <i class="fa fa-{{ icon }} fa-stack-1x"></i>
         </span>
      </a>
    <!--</li>-->
    `,
  styles:
      [],
  encapsulation: ViewEncapsulation.None
})
export class WizardItemComponent {

  constructor() {}

  @Input() active = false;

  @Input() icon;

}

