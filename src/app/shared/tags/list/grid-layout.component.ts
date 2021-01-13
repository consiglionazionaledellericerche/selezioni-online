import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Table} from '../../../common/model/table.model';
import { CommonService } from '../../../common/controller/common.service';

@Component({
  selector: 'app-grid-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
     `
    <div class="px-md-2">

        <div *ngIf="loading ; else results_table" class="text-center">
          Caricamento ...
          <i class="fa fa-spinner fa-pulse fa-fw"></i>
        </div>

        <ng-template #results_table>
          <div *ngIf="count > 0; else nessun_item" >
            <app-list-pagination *ngIf="!loading && showTotalOnTop && count > page_offset" [showPage]="false" [page]="page" [count]="count" [page_offset]="page_offset" (onChangePage)="select($event)"></app-list-pagination>

            <div class="row row-eq-height">
              <ng-content></ng-content>
            </div>
          </div>
        </ng-template>

        <!-- Paging -->
        <app-list-pagination *ngIf="!loading" [page]="page" [count]="count" [page_offset]="page_offset" (onChangePage)="select($event)"></app-list-pagination>

        <ng-template #nessun_item style="text-align: center;"> {{ 'no_item' | translate }}</ng-template>

    </div>
    `,
styles: [`.loadingmask tr { color: lightgray ; }`]
})
export class GridLayoutComponent {

  @Input() table: Table = null;

  @Input() loading : boolean;

  @Input() items = [];

  @Input() page: 0;

  @Input() count = 0;

  @Input() page_offset = CommonService.PAGE_OFFSET;

  @Input() queryparams = {};

  @Input() hasEditValidita = false;

  @Input() noEdit = false;

  @Input() showTotalOnTop = true;

  @Output() onChangePage = new EventEmitter();

  @Output() delete = new EventEmitter();


  public select(i: number) {
    this.onChangePage.emit(i);
  }

  public onDelete(event) {
    this.delete.emit(event);
  }
}

