import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuService} from '../header/menu.service';
import { NavbarMenu} from '../header/model/navbar-menu.model';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-sidenav-menu',
  templateUrl: './sidenav-menu.component.html',
})
export class SidenavMenuComponent implements OnInit, OnDestroy {
    constructor(public modalRef: BsModalRef,
                private menuService: MenuService) {
    }

    public navbarMenu: NavbarMenu = new NavbarMenu([]);
    public onNavbarEvaluated: Subscription = new Subscription();

    public ngOnInit() {
        this.menuService.evaluateNavbar();
        this.onNavbarEvaluated = this.menuService.navbarEvaluated.subscribe( (navbarMenu) => {
            this.navbarMenu = navbarMenu;
        });      
    }
    
    public ngOnDestroy() {
        this.onNavbarEvaluated.unsubscribe();
    }

    hide() {
      this.modalRef.hide();
    }
}
