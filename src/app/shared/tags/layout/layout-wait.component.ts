import {Component, Input} from '@angular/core';


@Component({
  standalone: false,
  selector: 'app-layout-wait',
  template: `
    <div *ngIf="!loaded" class="d-flex justify-content-center my-5">
      <div class="progress-spinner progress-spinner-active">
        <span class="visually-hidden">{{ 'layout.loading' | translate }}</span>
      </div>
    </div>
  `
})
export class LayoutWaitComponent {

  @Input() loaded: boolean;

}

