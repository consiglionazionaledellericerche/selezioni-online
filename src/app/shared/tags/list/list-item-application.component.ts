import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Application} from '../../../core/application/application.model';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-list-item-application',
  template:
     `
     <div *ngIf="item">
         <div class="row pt-2 pb-2">
           <ng-content></ng-content>

           <div class="ddd">
             <div class="btn-group border rounded" role="group" dropdown [ngStyle]="buttonStyle()">

                <app-show-children-modal [show_date]="'true'" [type]="'jconon_attachment:generic_document'" [parentId] = "item.objectId" [modal_title]="'application.attach_to' | translate"></app-show-children-modal>
                
                <button id="button-basic" dropdownToggle class="btn text-dark" aria-controls="button-animated" tooltip="{{'more.actions' | translate}}">
                  <i class="fa fa-fw fa-ellipsis-v"></i>
                </button>
                <ul id="dropdown-basic" *dropdownMenu class="dropdown-menu" role="menu" aria-labelledby="button-animated">
                    <li role="menuitem"><a class="dropdown-item" href="#">Action</a></li>
                    <li role="menuitem"><a class="dropdown-item" href="#">Another action</a></li>
                    <li role="menuitem"><a class="dropdown-item" href="#">Something else here</a></li>
                    <li class="divider dropdown-divider"></li>
                    <li role="menuitem"><a class="dropdown-item" href="#">Separated link</a></li>
                </ul>
           </div>
         </div>
    </div>
    `,
  styles:
      [
        'div.ddd { display: none; }',
        'div.row:hover div.ddd { display: block; }'
      ]
})
export class ListItemApplicationComponent {

  constructor(private router: Router, private route: ActivatedRoute) {}

  @Input() item: Application = null;

  @Input() showRoute = 'show/';

  @Input() editRoute = 'edit/';

  @Input() deleteRoute = 'delete/';

  @Input() editValiditaRoute = 'editvalidita/';

  @Input() hasEditValidita = false;

  @Input() noEdit = false;

  @Output() onDelete = new EventEmitter();

  @Input() filterForm;

  @Input() page;

  public navigateShow() {
    this.router.navigate([this.showRoute + this.item.getObjectId()],
      {
        relativeTo: this.route,
        queryParams: { page: 'prova'}
      });
  }

  buttonStyle() {
    return {
      'position': 'absolute',
      'top': '5px',
      'right': '5px',
      'background-color': '#FEFEFE',
      'z-index': '100000'
    };
  }
}
