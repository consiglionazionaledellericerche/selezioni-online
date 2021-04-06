import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Application} from '../../../core/application/application.model';
import {ActivatedRoute, Router} from '@angular/router';
import { AllowableAction } from '../../../common/model/allowableaction.enum';
import { User } from '../../../auth/model/user.model';

@Component({
  selector: 'app-list-item-application',
  template:
     `
     <div *ngIf="item">
         <div class="row pt-2 pb-2">
           <ng-content></ng-content>

           <div class="ddd">
             <div class="btn-group border rounded bg-white" role="group" dropdown [ngStyle]="buttonStyle()">
                <a *ngIf="isActive() || user.capabilities.isAdmin" class="btn btn-link p-1" href="javascript:"
                  (click)="newApplication()" tooltip="{{'application.edit' | translate}}">
                  <svg class="icon icon-primary">
                    <use xlink:href="/assets/vendor/sprite.svg#it-pencil"></use>
                  </svg>
                  <span class="d-none d-md-inline-block">{{'application.edit' | translate}}</span>
                </a>
                <app-show-children-modal 
                  [show_date]="'true'" 
                  [typeId]="'P:jconon_attachment:generic_document'" 
                  [queryName]="'jconon_attachment:generic_document'" 
                  [parentId] = "item.objectId" 
                  [modal_title]="'application.attach_to' | translate">
                </app-show-children-modal>                
                <button dropdownToggle 
                  class="btn text-dark p-1" 
                  aria-controls="button-animated" 
                  tooltip="{{'more.actions' | translate}}">
                  <svg class="icon">
                    <use xlink:href="/assets/vendor/sprite.svg#it-more-items"></use>
                  </svg>
                </button>
                <ul id="dropdown-basic" *dropdownMenu class="dropdown-menu dropdown-menu-right border" role="menu" aria-labelledby="button-animated">
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
        'div.row:hover div.ddd { display: block; }',
        '.dropdown-menu:before { left: unset; right: 11px;border-left:1px solid #b1b1b3 !important; border-top: 1px solid #b1b1b3 !important; top: -10px}'
      ]
})
export class ListItemApplicationComponent {

  constructor(private router: Router, private route: ActivatedRoute) {}

  @Input() item: Application = null;

  @Input() user: User;

  @Input() showRoute = 'show/';

  @Input() editRoute = 'edit/';

  @Input() deleteRoute = 'delete/';

  @Input() editValiditaRoute = 'editvalidita/';

  @Input() hasEditValidita = false;

  @Input() noEdit = false;

  @Output() onDelete = new EventEmitter();

  @Input() filterForm;

  @Input() page;

  public newApplication() {
    this.router.navigate(['/manage-application'],
      {
        relativeTo: this.route,
        queryParams: { 
          callId: this.item.call.getObjectId(), 
          applicationId: this.item.getObjectId()
        }
      });
  }

  public canEditApplication(): boolean {
    return this.item.allowableActions.indexOf(AllowableAction.CAN_CREATE_DOCUMENT) !== -1;
  }

  public isActive(): boolean {
    const now = new Date();
    return now >= new Date(this.item.call.data_inizio_invio_domande) && now <= new Date(this.item.call.data_fine_invio_domande);
  }

  buttonStyle() {
    return {
      'position': 'absolute',
      'top': '5px',
      'right': '5px',
      'z-index': '100000'
    };
  }
}
