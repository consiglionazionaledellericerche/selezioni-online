import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Table} from '../../../common/model/table.model';
import { CommonService } from '../../../common/controller/common.service';

@Component({
  standalone: false,
  selector: 'app-list-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
     `
    <div>

        <div *ngIf="loading ; else results_table" class="d-flex justify-content-center my-4">
          <div class="progress-spinner progress-spinner-active progress-spinner-sm">
            <span class="visually-hidden">{{ 'layout.loading' | translate }}</span>
          </div>
        </div>

        <ng-template #results_table>
          <div *ngIf="count > 0; else nessun_item" >
            <app-list-pagination *ngIf="!loading && showTotalOnTop && count > page_offset" [showPage]="false" [page]="page" [count]="count" [page_offset]="page_offset" (onChangePage)="select($event)"></app-list-pagination>

            <ul class="list-group" [ngClass]="classForDisplayList()">
              <ng-content></ng-content>
            </ul>

            <table *ngIf="table" class="table table-hover" [ngClass]="classForDisplayTable()">
              <thead>
              <th *ngFor="let key of table.keys"> {{ key | translate }}</th>
              </thead>
              <tbody>
              <tr *ngFor="let row of table.rows" app-table-item (delete)="onDelete($event)" [noEdit]="noEdit"
                  [queryparams]="queryparams" [keys]="table.keys" [row]="row" [hasEditValidita]="hasEditValidita">
              </tr>
              </tbody>
            </table>

          </div>

          
        </ng-template>

        <!-- Paging -->
        <app-list-pagination *ngIf="!loading" [page]="page" [count]="count" [page_offset]="page_offset" (onChangePage)="select($event)"></app-list-pagination>

        <ng-template #nessun_item><div class="alert alert-info mt-3" role="alert">{{ 'no_item' | translate }}</div></ng-template>

    </div>
    `,
styles: [`.loadingmask tr { color: lightgray ; }`]
})
export class ListLayoutComponent {

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

  public classForDisplayList() {
    if (this.table) {
      return {
        'd-block': true,
        'd-md-none': true
      };
    }
    return {};
  }

  public classForDisplayTable() {
    if (this.table) {
      return {
        'd-none': true,
        'd-md-table': true
      };
    }
    return {};
  }

  public onDelete(event) {
    this.delete.emit(event);
  }
}

