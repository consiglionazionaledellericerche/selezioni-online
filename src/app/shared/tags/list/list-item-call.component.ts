import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Call} from '../../../core/call/call.model';
import {ActivatedRoute, Router} from '@angular/router';
import { AllowableAction } from '../../../common/model/allowableaction.enum';
import { CmisObject } from '../../../common/model/cmisobject.model';

@Component({
  selector: 'app-list-item-call',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
  `
    <div *ngIf="item" class="pb-2 h-100">
      <div class="card card-bg border-bottom-card h-100">        
        <div class="card-header pl-2 py-2">
          <div class="d-flex">
            <svg class="icon icon-primary bg-white">
              <use xlink:href="/assets/vendor/sprite.svg#it-card"></use>
            </svg>
            <a href="javascript:window.scrollTo(0,0);" 
              tooltip="{{getMessageType(item) | translate }} {{ item.objectTypeId | translate }}" 
              class="font-weight-bold text-truncate text-primary pl-md-1" 
              (click)="changeType(item)">
              {{ item.objectTypeId | translate }}
            </a>
          </div>  
        </div>
        <div class="card-body">
            <ng-content></ng-content>
        </div>
        <div class="card-footer px-1 py-0">
          <div class="d-flex">
            <div class="mr-auto">
              <a *ngIf="isActive()" class="btn btn-link p-1" href="javascript:"
                    (click)="newApplication()" tooltip="{{'call.submit_application' | translate}}">
                <svg class="icon icon-primary">
                  <use xlink:href="/assets/vendor/sprite.svg#it-pencil"></use>
                </svg>
                <small>{{'call.submit_application' | translate}}</small>
              </a>
              <app-show-children-modal 
                [parentId] = "item.objectId" 
                [modal_title]="'call.attach_to' | translate:{value: item.codice}">
              </app-show-children-modal>
            </div>  
            <div class="btn-group" *ngIf="canCreateDocument()" dropdown placement="bottom right">
              <button 
                  id="button-basic" dropdownToggle 
                  class="btn p-1 text-dark" 
                  aria-controls="button-animated" 
                  tooltip="{{'more.actions' | translate}}">
                <svg class="icon">
                  <use xlink:href="/assets/vendor/sprite.svg#it-more-items"></use>
                </svg>
              </button>
              <ul id="dropdown-basic" *dropdownMenu class="dropdown-menu dropdown-menu-right border" role="menu" aria-labelledby="button-animated">
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
    </div>
  `,
  styles:
      [
        '.dropdown-menu:before { left: unset; right: 11px;border-left:1px solid #b1b1b3 !important; border-top: 1px solid #b1b1b3 !important; top: -10px}'
      ]
})
export class ListItemCallComponent {

  constructor(private router: Router, private route: ActivatedRoute) {}

  @Input() item: Call = null;

  @Output() onDelete = new EventEmitter();

  @Input() filterForm;

  @Input() page;

  public newApplication() {
    this.router.navigate(['/manage-application'],
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

  public getMessageType(item: CmisObject): string {
    let type = item.objectTypeId.substr(2);
    if (this.filterForm.controls.type.value === type) {
      return 'call.remove_filter_for_code';
    } else {
      return 'call.filter_for_code';
    }
  }

  public changeType(item: CmisObject) {
    let type = item.objectTypeId.substr(2);
    if (this.filterForm.controls.type.value === type) {
      this.filterForm.controls.type.patchValue('jconon_call:folder');
    } else {
      this.filterForm.controls.type.patchValue(type);
    }
  }
}
