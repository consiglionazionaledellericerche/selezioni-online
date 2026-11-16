import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {CommonService} from '../../../common/controller/common.service';

@Component({
  standalone: false,
  selector: 'app-list-pagination',
  template: `
    <div *ngIf="count > 0 && !infiniteScroll" class="small text-secondary mt-3">
      {{ 'present' | translate }} <span class="fw-bold">{{ count }}</span> {{ 'occurrences' | translate }}.
      {{ 'shown_from' | translate }} {{ showFrom() }} {{ 'shown_to' | translate }} {{ showTo() }}.
    </div>
    <nav *ngIf="showPage && totalPages() > 1" class="pagination-wrapper justify-content-center my-4" aria-label="Navigazione pagine">
      <ul class="pagination flex-wrap">
        <li class="page-item" [class.disabled]="page <= 0">
          <a class="page-link" href="javascript:void(0)" (click)="go(page - 1)">
            <svg class="icon icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-chevron-left"></use></svg>
            <span class="visually-hidden">Pagina precedente</span>
          </a>
        </li>
        <li class="page-item" *ngFor="let p of pages()">
          <a class="page-link" href="javascript:void(0)" [attr.aria-current]="p === page ? 'page' : null" (click)="go(p)">{{ p + 1 }}</a>
        </li>
        <li class="page-item" [class.disabled]="page >= totalPages() - 1">
          <a class="page-link" href="javascript:void(0)" (click)="go(page + 1)">
            <span class="visually-hidden">Pagina successiva</span>
            <svg class="icon icon-primary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-chevron-right"></use></svg>
          </a>
        </li>
      </ul>
    </nav>
  `,
})
export class ListPaginationComponent {

  @Input() page: 0;

  @Input() count = 0;

  @Input() showPage: boolean = true;

  @Input() page_offset = CommonService.PAGE_OFFSET;

  @Input() infiniteScroll = false;

  @Output() onChangePage = new EventEmitter();

  /** Numero massimo di pagine mostrate, come in GesFor. */
  public maxPages = 10;

  public totalPages(): number {
    return Math.ceil((this.count || 0) / (this.page_offset || 1));
  }

  public pages(): number[] {
    const pages = this.totalPages();
    const current = this.page || 0;
    const half = Math.ceil(this.maxPages / 2);
    const start = current > half ? Math.max(Math.min(current - half, pages - this.maxPages), 0) : 0;
    const end = current > half ? Math.min(current + half, pages) : Math.min(this.maxPages, pages);
    return Array.from({ length: Math.max(end - start, 0) }, (_, k) => start + k);
  }

  public go(p: number): void {
    if (p >= 0 && p < this.totalPages() && p !== this.page) {
      this.onChangePage.emit(p);
    }
  }

  public showFrom() {
    if (this.infiniteScroll) {
      return 1;
    } else {
      return this.page * this.page_offset + 1;
    }
  }

  public showTo() {
    const to = this.infiniteScroll ? (this.page + 1) * this.page_offset + 1 : this.showFrom() + this.page_offset;
    return to > this.count ? this.count : to - 1;
  }
}
