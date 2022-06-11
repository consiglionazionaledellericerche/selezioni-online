import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/model/user.model';
import { Subscription } from 'rxjs';
import { ApiMessage, ApiMessageService, MessageType} from '../api-message.service';
import { NotificationsService} from 'angular2-notifications';
import { ServiceReg} from '../../auth/auth.module';
import { MenuService} from './menu.service';
import { NavbarMenu} from './model/navbar-menu.model';
import { TranslateService, LangChangeEvent} from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SidenavMenuComponent } from '../sidenav/sidenav-menu.component';

@Component({
  selector: 'app-header1',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {


  public onUserActivated: Subscription = new Subscription();
  public onLoad: Subscription = new Subscription();
  public onNavbarEvaluated: Subscription = new Subscription();
  public navbarMenu: NavbarMenu = null;

  public user: User = null;
  public spinner = false;
  
  public flagIconCountry : string;
  public country : string;
  public lang: string;
  public logo: string;

  public services = ServiceReg;

  public searchForm: FormGroup;
  public isCollapsed = true;
  public isSticky = false;

  public notificationOptions = {
    timeOut: 5000,
    pauseOnHover: true,
    preventDuplicates: true,
    theClass: 'rounded shadow-lg alert',
    clickToClose: true,
    animate: 'fromTop',
    showProgressBar: true,
    position: ['top', 'right']
  }

  constructor(private menuService: MenuService,
              private authService: AuthService,
              private apiMessageService: ApiMessageService,
              private translateService: TranslateService,
              private modalService: BsModalService,
              private titleService: Title,
              private formBuilder: FormBuilder,
              private router: Router,
              private notificationService: NotificationsService) {
    this.searchForm = this.formBuilder.group({
      callCode: ''
    });
  }

  public ngOnInit() {
    this.translateService.setDefaultLang('it');
    if (!localStorage.getItem('lang')) {
      localStorage.setItem('lang', this.translateService.getBrowserLang());
    }
    this.language(this.lang || localStorage.getItem('lang'), false);
    if (this.authService.isAuthenticated()) {
      this.user = this.authService.getUser();
    }
    this.onUserActivated = this.authService.userActivated.subscribe((user: User) => {
      if (user != null) {
        this.sidebarToggle();
        this.user = user;
        this.showNotification(MessageType.SUCCESS, 'Bentornato ' + this.user.userName);
      } else {
        this.user = null;
      }
      this.menuService.evaluateNavbar();
    });
    if (!this.navbarMenu) {
      this.menuService.evaluateNavbar();
    }
    this.onNavbarEvaluated = this.menuService.navbarEvaluated.subscribe( (navbarMenu) => {
      this.navbarMenu = navbarMenu;
    });

    this.apiMessageService.onApiMessage.subscribe(
      (message: ApiMessage) => {
        this.showNotification(message.type, message.message);
      }
    );
    this.apiMessageService.onLoad.subscribe((value) => {
      this.spinner = value;
    });
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateService.get('home.title').subscribe((title: string) => {
        this.titleService.setTitle(title);
      });
    });
  }

  public language(lang: string, change: boolean) {
    if (change)
      this.lang = lang;
    if (lang == 'it') {
      this.translateService.use('it').subscribe((lang: string) =>{
        this.country = 'ita';
        this.logo = '/assets/images/logo-it.png';
        localStorage.setItem('lang', 'it');  
      });
    } else {
      this.translateService.use('en').subscribe((lang: string) =>{
        this.country = 'eng';
        this.logo = '/assets/images/logo-en.png';
        localStorage.setItem('lang', 'en');
      });
    }
    return false;
  }

  public onLogout() {
    this.authService.logout();
    this.showNotification(MessageType.SUCCESS, 'Logout effettuato');
  }

  public loginPage() {
    this.router.navigateByUrl('auth/signin');
  }

  public isAuthenticated() {
      return this.authService.isAuthenticated();
  }

  public ngOnDestroy() {
      this.onUserActivated.unsubscribe();
      this.onLoad.unsubscribe();
      this.onNavbarEvaluated.unsubscribe();
  }

  private notice(alertclass: string, timeOut?: number) : any {
    var notice = Object.assign({}, this.notificationOptions);
    notice.theClass = notice.theClass + ' ' + alertclass;
    if (timeOut !== undefined) {
      notice.timeOut = timeOut;
    }
    return notice;
  }

  private showNotification(messageType: MessageType, message: string) {
    if (messageType === MessageType.SUCCESS) {
      this.notificationService.info('<h4 class="alert-heading">Informazione</h4>', message, this.notice('alert-info'));
    } else if (messageType === MessageType.ERROR) {
      this.notificationService.error('<h4 class="alert-heading">Errore!</h4>', message, this.notice('alert-danger', 15000));
    } else if (messageType === MessageType.WARNING) {
      this.notificationService.warn('<h4 class="alert-heading">Avvertimento!</h4>', message, this.notice('alert-warning', 10000));
    }
  }

  onSubmit(searchData) {
    this.router.navigate(['search'],  { queryParams: searchData });
  }

  sidebarToggle() {
    this.menuService.sidebarEvaluated.next(true);
    this.modalService.show(SidenavComponent, Object.assign({}, { animated: true, class: 'modal-dialog-left' }));
  }

  sidebarMenuToggle() {
    this.modalService.show(SidenavMenuComponent, Object.assign({}, { animated: true, class: 'modal-dialog-right' }));
  }

  @HostListener('window:scroll', ['$event', '$event.target'])
  doSomethingOnScroll($event: Event) {
    const elSticky = document.querySelector('.it-header-sticky');
    const elApplicationContent = document.querySelector('.application-content');
    if (window.scrollY >= 120) {
      this.isSticky = true;
      elApplicationContent['style'].paddingTop = '198px';
    } else {
      this.isSticky = false;
      elApplicationContent['style'].paddingTop = '0px';
    }
  }

}
