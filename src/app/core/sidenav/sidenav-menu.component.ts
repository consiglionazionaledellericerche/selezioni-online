import { Component, OnDestroy, OnInit, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuService} from '../header/menu.service';
import { NavbarMenu} from '../header/model/navbar-menu.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-sidenav-menu',
  templateUrl: './sidenav-menu.component.html',
  styles: [
    '.sidenav {z-index: 1031; left:auto;}',
    'ul.list-group-flush {top: 56px;}'
  ],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateX(100%)'}),
        animate('200ms ease-in', style({transform: 'translateX(0%)'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateX(100%)'}))
      ])
    ])
  ]
})
export class SidenavMenuComponent implements OnInit, OnDestroy {
    constructor(private _eref: ElementRef,
                private menuService: MenuService) {
    }

    public sidebarMenuToggle: Subscription = new Subscription();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    public isCollapsed: boolean = true;
    public navbarMenu: NavbarMenu = null;
    public onNavbarEvaluated: Subscription = new Subscription();

    public ngOnInit() {
        this.sidebarMenuToggle = this.menuService.sidebarMenuEvaluated.subscribe( (toggle: boolean) => {
            this.toggle();
        });
        if (!this.navbarMenu) {
            this.menuService.evaluateNavbar();
        }
        this.onNavbarEvaluated = this.menuService.navbarEvaluated.subscribe( (navbarMenu) => {
            this.navbarMenu = navbarMenu;
        });
      
    }
    
    public ngOnDestroy() {
        this.sidebarMenuToggle.unsubscribe();
        this.onNavbarEvaluated.unsubscribe();
    }

    toggle() {
        this.isCollapsed = !this.isCollapsed;
    }
    
    @HostListener('document:click', ['$event', '$event.target'])
    onClick(event: any, targetElement: any): void {
      if (!targetElement) {
        return;
      }
      const clickedInside = this._eref.nativeElement.contains(targetElement) || targetElement.id == 'toggle-menu-sidebar1' || targetElement.id == 'toggle-menu-sidebar2';
      if (!clickedInside) {
        this.isCollapsed = true;
      }
    }
}
