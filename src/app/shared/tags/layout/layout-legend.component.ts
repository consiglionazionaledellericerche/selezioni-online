import {Component, Input} from '@angular/core';
import {Legend} from '../../../common/model/legend.model';

@Component({
  selector: 'app-layout-legend',
  template:

     `
        <div *ngIf="legend" class="btn-group">
          <div class="magic-menu-container">
            <i class="fa fa-2x fa-list-ul text-secondary pr-2 pb-1"></i>

            <div class="card magic-menu ">
              <div class="container mt-1 mb-1">
              <!-- Legend items -->
                <p>
                  <strong>Legenda</strong>
                </p>

              <span *ngFor="let leg of legend" class="d-inline-block mb-2">
                <span class="mr-2">
                  <i class="fa fa-{{ leg.icon }}" aria-hidden="true" [ngStyle]="{'color': leg.entity.colore}"></i>
                  <em>{{ leg.entity.getLabel() }}</em>
                </span>
                <br>
              </span>
            </div>

          </div>
        </div>

    `,
  styles:
    [
      '.magic-menu-container { position: relative; z-index: initial; }',
      'div.magic-menu { display: none; position: absolute; z-index: 10; width: 250px; }',
      '.magic-menu-container:hover .magic-menu { display: block; left: 0px; top: 35px; }'
    ],
})
export class LayoutLegendComponent {

  @Input() legend: Legend[];

}

