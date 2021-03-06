import {AfterContentInit, Component, ContentChild, ElementRef, HostListener, Input} from '@angular/core';
import {RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-dropdown-navbar',
  template: `

    <li *ngIf="active && path && type == 'navbar'" class="nav-item"> 
      <a *ngIf="active && path && type == 'navbar'" class="nav-link d-flex" [routerLink]="[path]" [routerLinkActive]="['active', 'text-primary']">
        <i *ngIf="fa" class="fa fa-fw fa-{{fa}} d-flex d-sm-none text-dark" aria-hidden="true" tooltip="{{ dropdownTitle | translate}}"></i>
        <span class="pl-1 d-none d-sm-flex">{{ dropdownTitle | translate}}</span>
      </a> 
    </li> 
    
    <li *ngIf="active && !path" class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" [ngClass]="{ 'active': isActive()}" (click)="onDropdownClick()">
        <i *ngIf="fa" class="fa fa-{{ fa }} pr-1 d-inline-block" aria-hidden="true"></i>
        <span>{{ getTitle() | translate }} </span>
      </a>
      <ul class="dropdown-menu dropdown-menu-navbar-cnr mt-1"
           [ngClass]="{'invisible': !opened, 'dropdown-menu-right': rightAlignment}"
           [ngStyle]="{'min-width': width}">
        <ng-content></ng-content>
      </ul>
    </li>

  `
})
export class DropdownNavbarComponent {

  @Input() width = '10rem';

  @Input() active = true;
  @Input() dropdownTitle;
  @Input() rightAlignment;
  @Input() user;
  @Input() path;
  @Input() type;

  @Input() fa;

  opened = false;

  constructor(private _eref: ElementRef) {}

  getTitle() {
    if (this.user) {
      return this.user.userName;
    }
    return this.dropdownTitle;
  }

  onDropdownClick() {
    console.log('onDropdownClick');
    this.opened = !this.opened;
  }
}
