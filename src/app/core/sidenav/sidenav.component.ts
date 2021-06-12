import { Component, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/model/user.model';
import { Subscription } from 'rxjs';
import { NotificationsService} from 'angular2-notifications';
import { MenuService} from '../header/menu.service';
import { NavbarMenu} from '../header/model/navbar-menu.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Helpers } from '../../common/helpers/helpers';
import { ApplicationService } from '../application/application.service';
import { ApplicationState } from '../application/application-state.model';
import { Application } from '../application/application.model';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
})
export class SidenavComponent implements OnInit, OnDestroy {
    constructor(private _eref: ElementRef,
                public modalRef: BsModalRef,
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
    public onUserModified: Subscription = new Subscription();
    public onApplicationChanged: Subscription = new Subscription();

    public sidebarToggle: Subscription = new Subscription();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    public user: User = null;
    public searchForm: FormGroup;
    public navbarMenu: NavbarMenu = new NavbarMenu([]);
    public onNavbarEvaluated: Subscription = new Subscription();
    public applicationsState: ApplicationState[] = undefined;

    public ngOnInit() {
        this.sidebarToggle = this.menuService.sidebarEvaluated.subscribe( (toggle: boolean) => {
            this.hide();
        });
        this.onUserActivated = this.authService.userActivated.subscribe((user: User) => {
            if (user != null) {
              this.user = Helpers.buildInstance(user, User);
              this.applicationState();
            } else {
              this.user = null;
            }
        });
        this.onUserModified = this.authService.userModified.subscribe((user: User) => {
          this.user = Helpers.buildInstance(user, User);
        });
        this.menuService.evaluateNavbar();
        this.onNavbarEvaluated = this.menuService.navbarEvaluated.subscribe( (navbarMenu) => {
            this.navbarMenu = navbarMenu;
        });

        if (this.authService.isAuthenticated()) {
            this.user = Helpers.buildInstance(this.authService.getUser(), User);
            this.applicationState();
        }
        this.onApplicationChanged = this.applicationService.applicationChanged.subscribe((application: Application) => {
          this.applicationState();
        });
    }

    public onLogout() {
        this.hide();
        this.authService.logout();
        this.notificationService.success('Success', 'Logout effettuato');
    }
    
    public ngOnDestroy() {
        this.onUserActivated.unsubscribe();
        this.onUserModified.unsubscribe();
        this.onApplicationChanged.unsubscribe();
        this.sidebarToggle.unsubscribe();
        this.onNavbarEvaluated.unsubscribe();
    }

    applicationState() {
        this.applicationService.applicationState(this.user.userName).subscribe((result) => {
            this.applicationsState = result;
        });
    }

    hide() {
      this.modalRef.hide();
    }

    onSubmit(searchData) {
        this.hide();
        this.router.navigate(['search'],  { queryParams: searchData });
    }
}
