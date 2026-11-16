import {ChangeDetectorRef, Component, OnInit, Input, HostListener} from '@angular/core';
import {CommonListComponent} from '../../common/controller/common-list.component';
import {ActivatedRoute, Router} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {NavigationService} from '../../core/navigation.service';
import { Call } from './call.model';
import { CallService } from './call.service';
import {TranslateService} from '@ngx-translate/core';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

@Component({
  standalone: false,
  selector: 'call-list',
  template:
  `
    <!-- List -->
    <app-grid-layout 
      [loading]="loading" 
      [items]="items"
      [noItem]="'call.search.message.no_item'" 
      [showPage]="false" 
      [infiniteScroll]="true" 
      [page]="getPage()" 
      [showTotalOnTop]="showTotalOnTop"
      [count]="count" 
      (onChangePage)="onChangePage($event)" 
      (loadMore)="onScroll()"
      [page_offset]="pageOffset">
      <div class="row" 
          infiniteScroll       
          [infiniteScrollThrottle]="300"
          [infiniteScrollDistance]="1"
          (scrolled)="onScroll()">
        <div *ngFor="let item of items" class="col-12" @scale>
          <app-list-item-call [item]="item" [filterForm]="filterForm" (onDelete)="onDelete(item.getId())" (onChange)="loadList()"></app-list-item-call>
        </div>
      </div>
    </app-grid-layout>
  `,
  animations: [
    trigger('scale', [
      transition('void => *', animate('500ms ease-in-out', keyframes([
        style({ transform: 'scale(0.3)' }),
        style({ transform: 'scale(1)' })
      ]))) 
    ])
  ]
})
export class CallListComponent extends CommonListComponent<Call> implements OnInit {

  public items: Call[] = [];
  @Input() showTotalOnTop: boolean = true;
  pageOffset = CallService.PAGE_OFFSET;
  public constructor(public service: CallService,
                     protected route: ActivatedRoute,
                     protected router: Router,
                     protected changeDetector: ChangeDetectorRef,
                     protected navigationService: NavigationService,
                     protected translateService: TranslateService) {
    super(service, route, router, changeDetector, navigationService);
  }
  
  public setItems(items: Call[]) {
    this.items = items;
  }

  public getItems(): Call[] {
    return this.items;
  }

  public buildFilterForm(): FormGroup {
    return this.filterForm;
  }

  public classForDisplayCard() {    
    return {
      'col-md-12': this.count <= 1,
      'col-md-6 col-lg-4': this.count > 1
    };
  }

  onScroll() {
    this.loadMoreItems();
  }

  protected isScrollTopOnPageChange(): boolean {
    return true;
  }

}
