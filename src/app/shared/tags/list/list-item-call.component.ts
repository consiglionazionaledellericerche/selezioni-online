import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Call} from '../../../core/call/call.model';
import {ActivatedRoute, Router} from '@angular/router';
import { AllowableAction } from '../../../common/model/allowableaction.enum';

@Component({
  selector: 'app-list-item-call',
  template:
     `
     <div *ngIf="item">
         <div class="row pt-2 pb-2">
           <ng-content></ng-content>

           <div class="ddd">
             <div class="btn-group border rounded" role="group" dropdown [ngStyle]="buttonStyle()">

                <button *ngIf="isActive()" class="btn text-dark" [disabled]="!item.hasId()"
                      (click)="newApplication()" tooltip="{{'call.submit_application' | translate}}">
                      <i class="fa fa-fw fa-edit"></i>
                </button>

                <app-show-children-modal [parentId] = "item.objectId" [modal_title]="'call.attach_to' | translate:{value: item.codice}"></app-show-children-modal>
                
                <button id="button-basic" dropdownToggle class="btn text-dark" aria-controls="button-animated" tooltip="{{'more.actions' | translate}}">
                  <i class="fa fa-fw fa-ellipsis-v"></i>
                </button>
                <ul id="dropdown-basic" *dropdownMenu class="dropdown-menu dropdown-menu-right" role="menu" aria-labelledby="button-animated">
                    <li role="menuitem" *ngIf="canCreateDocument()">
                      <a class="dropdown-item" 
                        [routerLink]="['/applications-user']"
                        [queryParams]="{ callId: item.objectId }">
                        <i class="fa fa-fw fa-folder-open"></i> {{'call.menuitem.application'|translate}}
                      </a>
                    </li>
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
export class ListItemCallComponent {

  constructor(private router: Router, private route: ActivatedRoute) {}

  @Input() item: Call = null;

  @Output() onDelete = new EventEmitter();

  @Input() filterForm;

  @Input() page;

  public newApplication() {
    this.router.navigate(['manage-application'],
      {
        relativeTo: this.route,
        queryParams: { callId: this.item.getObjectId()}
      });
  }

  public isActive(): boolean {
    const now = new Date();
    return now >= new Date(this.item.data_inizio_invio_domande) && now <= new Date(this.item.data_fine_invio_domande);
  }

  public canCreateDocument(): boolean {
    return this.item.allowableActions.indexOf(AllowableAction.CAN_CREATE_DOCUMENT) !== -1;
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
