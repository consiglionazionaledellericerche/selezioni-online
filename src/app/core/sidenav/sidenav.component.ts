import { Component, OnDestroy, OnInit, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/model/user.model';
import { Subscription } from 'rxjs';
import {ApiMessage, ApiMessageService, MessageType} from '../api-message.service';
import {NotificationsService} from 'angular2-notifications';
import {ServiceReg} from '../../auth/auth.module';
import {MenuService} from '../header/menu.service';
import {NavbarMenu} from '../header/model/navbar-menu.model';
import {TranslateService, LangChangeEvent} from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { Helpers } from '../../common/helpers/helpers';
import { ApplicationService } from '../application/application.service';
import { ApplicationState } from '../application/application-state.model';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styles: [
    '.sidenav {z-index: 1021; border-right:solid 1px lightgray;height: calc(100% - 58px);}',
    'ul.list-group-flush {top: 56px;}'
  ],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateX(-100%)'}),
        animate('200ms ease-in', style({transform: 'translateX(0%)'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateX(-100%)'}))
      ])
    ])
  ]
})
export class SidenavComponent implements OnInit, OnDestroy {
    constructor(private _eref: ElementRef,
                private authService: AuthService,
                private applicationService: ApplicationService, 
                private router: Router,
                private formBuilder: FormBuilder,
                private notificationService: NotificationsService,
                private menuService: MenuService) {
        this.searchForm = this.formBuilder.group({
            callCode: ''
        });
    }

    public onUserActivated: Subscription = new Subscription();
    public sidebarToggle: Subscription = new Subscription();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    public isCollapsed: boolean = true;
    public user: User = null;
    public searchForm: FormGroup;
    public navbarMenu: NavbarMenu = null;
    public onNavbarEvaluated: Subscription = new Subscription();
    public applicationsState: ApplicationState[] = undefined;

    public ngOnInit() {
        this.sidebarToggle = this.menuService.sidebarEvaluated.subscribe( (toggle: boolean) => {
            this.toggle();
        });
        this.onUserActivated = this.authService.userActivated.subscribe((user: User) => {
            if (user != null) {
              this.toggle();  
              this.user = Helpers.buildInstance(user, User);
              this.applicationState();
            } else {
              this.user = null;
            }
        });
        if (!this.navbarMenu) {
            this.menuService.evaluateNavbar();
        }
        this.onNavbarEvaluated = this.menuService.navbarEvaluated.subscribe( (navbarMenu) => {
            this.navbarMenu = navbarMenu;
        });
      
        if (this.authService.isAuthenticated()) {
            this.user = Helpers.buildInstance(this.authService.getUser(), User);
            this.applicationState();
        }      
    }

    public onLogout() {
        this.toggle();
        this.authService.logout();
        this.notificationService.success('Success', 'Logout effettuato');
    }
    
    public ngOnDestroy() {
        this.onUserActivated.unsubscribe();
        this.sidebarToggle.unsubscribe();
        this.onNavbarEvaluated.unsubscribe();
    }

    applicationState() {
        this.applicationService.applicationState(this.user.userName).subscribe((result) => {
            this.applicationsState = result;
        });
    }

    toggle() {
        this.isCollapsed = !this.isCollapsed;
    }

    onSubmit(searchData) {
        this.toggle();
        this.router.navigate(['search'],  { queryParams: searchData });
    }
    
    @HostListener('document:click', ['$event', '$event.target'])
    onClick(event: any, targetElement: any): void {
      if (!targetElement) {
        return;
      }
      const clickedInside = this._eref.nativeElement.contains(targetElement) || targetElement.id == 'toggle-sidebar';
      if (!clickedInside) {
        this.isCollapsed = true;
      }
    }
}
