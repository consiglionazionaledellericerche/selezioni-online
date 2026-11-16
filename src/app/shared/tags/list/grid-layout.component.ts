import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Table } from '../../../common/model/table.model';
import { CommonService } from '../../../common/controller/common.service';

@Component({
  standalone: false,
  selector: 'app-grid-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <p *ngIf="!loading && count > 0 && showTotalOnTop" class="small text-secondary mb-2">
        {{ items?.length || 0 }} {{ 'layout.list_of' | translate }} {{ count }} {{ 'layout.list_items' | translate }}
      </p>
      <div *ngIf="count > 0">
        <ng-content></ng-content>
      </div>
      <div *ngIf="loading" class="d-flex justify-content-center my-4">
        <div class="progress-spinner progress-spinner-active progress-spinner-sm">
          <span class="visually-hidden">{{ 'layout.loading' | translate }}</span>
        </div>
      </div>
      <ng-container *ngIf="!loading">
        <div *ngIf="count == 0" class="alert alert-info mt-3" role="alert" [innerHtml]="noItem | translate"></div>
        <div *ngIf="infiniteScroll && loadMore.observed && count > (items?.length || 0)" class="text-center my-4">
          <button type="button" class="btn btn-outline-primary btn-sm" (click)="loadMore.emit()">{{ 'layout.load_more' | translate }}</button>
        </div>
        <p *ngIf="infiniteScroll && count > page_offset && count <= (items?.length || 0)" class="text-center small text-secondary my-4">{{ 'layout.list_end' | translate }}</p>
        <app-list-pagination *ngIf="!infiniteScroll" [showPage]="showPage" [page]="page" [infiniteScroll]="infiniteScroll"
          [count]="count" [page_offset]="page_offset" (onChangePage)="select($event)"></app-list-pagination>
      </ng-container>
    </div>
  `
})
export class GridLayoutComponent {

  @Input() table: Table = null;

  @Input() loading : boolean;

  @Input() noItem : string = 'no_item';

  @Input() items = [];

  @Input() page: 0;

  @Input() count = 0;

  @Input() showPage = true;

  @Input() infiniteScroll = false;

  @Input() page_offset = CommonService.PAGE_OFFSET;

  @Input() queryparams = {};

  @Input() hasEditValidita = false;

  @Input() noEdit = false;

  @Input() showTotalOnTop = true;

  @Output() onChangePage = new EventEmitter();

  /** Scroll infinito: richiesta della pagina successiva da accodare (pulsante "Carica altri"). */
  @Output() loadMore = new EventEmitter<void>();

  @Output() delete = new EventEmitter();


  public select(i: number) {
    this.onChangePage.emit(i);
  }

  public onDelete(event) {
    this.delete.emit(event);
  }
}

