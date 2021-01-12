import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {CommonService} from '../../../common/controller/common.service';
import {PageChangedEvent} from 'ngx-bootstrap/pagination'; 

@Component({
  selector: 'app-list-pagination',
  template:
     `
        <div class="row pt-1">
          <!-- Paging -->
          <div class="col-md-6">
            <pagination 
                *ngIf="showPage && count > page_offset"
                [boundaryLinks]="true" 
                [totalItems]="count" 
                [itemsPerPage]="page_offset"
                previousText="&lsaquo;" 
                nextText="&rsaquo;" 
                firstText="&laquo;" 
                lastText="&raquo;"
                (pageChanged)="pageChanged($event)"
                [(ngModel)]="currentPage"
                [rotate]="true" 
                [maxSize]="5">
            </pagination>
          </div>
          <div class="col-md-6">
            <!-- Recap -->
            <div *ngIf="count > 0" class="d-inline-block float-right" [ngClass]="{'mt-3': showPage && count > page_offset}">
              <small>
              {{ 'present' | translate }} <span class="font-weight-bold">{{ count }}</span> {{ 'occurrences' | translate }}.
                  {{ 'shown_from' | translate }} {{ showFrom() }} {{ 'shown_to' | translate }} {{ showTo() }}.
              </small>
            </div>
          </div>
        </div>  
    `,
})
export class ListPaginationComponent implements OnInit{

  @Input() page: 0;

  @Input() count = 0;

  @Input() showPage: boolean = true;

  @Input() page_offset = CommonService.PAGE_OFFSET;

  @Output() onChangePage = new EventEmitter();

  public currentPage: number;

  ngOnInit() {
    this.currentPage = this.page + 1;
  }

  pageChanged(event: PageChangedEvent): void {
    if (this.currentPage != event.page) {
      this.onChangePage.emit(event.page - 1);
      window.scrollTo(0, 0);
    }
  }

  public showFrom() {
    return this.page * this.page_offset + 1;
  }

  public showTo() {
    const to = this.showFrom() + this.page_offset;
    return to > this.count ? this.count : to - 1;
  }
}
