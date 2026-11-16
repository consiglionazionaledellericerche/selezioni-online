import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-layout-title',
  template: `
    <div class="row row-title pt-3 pb-2">
      <div class="d-xl-flex align-items-center border-bottom border-primary pb-2 pb-lg-3 mt-lg-4"
           [ngClass]="{'cursor-pointer': isCollapsable}" (click)="isCollapsable && toggle(!collapsediv)">
        <div>
          <h2 *ngIf="title" class="text-primary" [ngClass]="titleClass">{{ title | translate }}</h2>
          <p *ngIf="subTitle" class="mb-0 text-secondary" [ngClass]="subTitleClass">{{ subTitle | translate }}</p>
        </div>
        <div class="ms-auto d-flex flex-wrap gap-2 mt-2 mt-xl-0 align-items-center">
          <ng-content></ng-content>
          <svg *ngIf="isCollapsable" class="icon icon-primary">
            <use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + (collapsediv ? 'it-expand' : 'it-collapse')"></use>
          </svg>
        </div>
      </div>
    </div>
  `
})
export class LayoutTitleComponent implements OnInit{

  @Input() title = '';

  @Input() titleClass = '';

  @Input() subTitle = '';

  @Input() subTitleClass = '';

  @Input() isCollapsable = false;

  @Output() collapseEvent = new EventEmitter<boolean>();
  
  @Input() collapsediv: boolean = true; 

  toggle(value: boolean) {
    this.collapseEvent.emit(value);
    this.collapsediv = value; 
  }

  ngOnInit(): void {
    this.toggle(this.collapsediv);
  }
}
