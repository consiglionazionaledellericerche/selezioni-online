import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Application} from '../../../core/application/application.model';
import {ActivatedRoute, Router} from '@angular/router';
import { AllowableAction } from '../../../common/model/allowableaction.enum';
import { User } from '../../../auth/model/user.model';
import { PrintApplicationComponent } from '../../../core/application/print-application.component';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-list-item-application',
  template:
     `
     <div *ngIf="item">
         <div class="row pt-2 pb-2">
           <ng-content></ng-content>

           <div class="ddd" #buttonGroup>
             <div class="btn-group border rounded bg-white" role="group" dropdown [ngStyle]="buttonStyle()">
                <a *ngIf="(isActive && isDomandaProvvisoria) || user.capabilities.isAdmin" class="btn btn-link p-1" href="javascript:"
                  (click)="newApplication()" tooltip="{{'application.edit' | translate}}">
                  <svg class="icon icon-primary">
                    <use xlink:href="/assets/vendor/sprite.svg#it-pencil"></use>
                  </svg>
                  <span class="d-none d-md-inline-block">{{'application.edit' | translate}}</span>
                </a>
                <a *ngIf="isActive && isDomandaConfermata" class="btn btn-link p-1" href="javascript:"
                  (click)="reopenApplication()" tooltip="{{'application.reopen' | translate}}">
                  <svg class="icon icon-primary">
                    <use xlink:href="/assets/vendor/sprite.svg#it-exchange-circle"></use>
                  </svg>
                  <span class="d-none d-md-inline-block">{{'application.reopen' | translate}}</span>
                </a>
                <app-show-children-modal 
                  (click)="hideButtonGroup()"
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
                    <li role="menuitem"><a class="dropdown-item" href="javascript:" (click)="printApplication()" translate>application.print.application</a></li>
                    <li role="menuitem"><a class="dropdown-item" href="javascript:" (click)="copyApplication()" translate>application.copy</a></li>
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

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private modalService: BsModalService,
  ) {}

  @Input() item: Application = null;

  @Input() user: User;

  @Input() showRoute = 'show/';

  @Input() editRoute = 'edit/';

  @Input() deleteRoute = 'delete/';

  @Input() editValiditaRoute = 'editvalidita/';

  @Input() hasEditValidita = false;

  @Input() noEdit = false;

  @Output() onReopen = new EventEmitter();

  @Output() onCopy = new EventEmitter();

  @Input() filterForm;

  @Input() page;

  @ViewChild('buttonGroup', {static: false}) buttonGroup: ElementRef;  

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

  hideButtonGroup() {
    this.buttonGroup.nativeElement.classList.add('d-none');
    setTimeout(() => {
      this.buttonGroup.nativeElement.classList.remove('d-none');
    },1000);
  }

  public reopenApplication() {
    this.hideButtonGroup();
    this.onReopen.emit();
  }

  public copyApplication() {
    this.hideButtonGroup();
    this.onCopy.emit();
  }

  public printApplication() {
    this.hideButtonGroup();
    const initialState = {
      'application': this.item
    };
    this.modalService.show(PrintApplicationComponent, Object.assign({initialState}, { animated: true, class: 'modal-dialog-left' }));

  }

  public canEditApplication(): boolean {
    return this.item.allowableActions.indexOf(AllowableAction.CAN_CREATE_DOCUMENT) !== -1;
  }

  get isActive(): boolean {
    const now = new Date();
    return now >= new Date(this.item.call.data_inizio_invio_domande) && now <= new Date(this.item.call.data_fine_invio_domande);
  }

  get isDomandaProvvisoria(): boolean {
    return this.item.isProvvisoria();
  }

  get isDomandaConfermata(): boolean {
    return this.item.isConfermata();
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
