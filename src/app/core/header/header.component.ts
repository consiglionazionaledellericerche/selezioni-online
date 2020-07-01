import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/model/user.model';
import { Subscription } from 'rxjs';
import {ApiMessage, ApiMessageService, MessageType} from '../api-message.service';
import {NotificationsService} from 'angular2-notifications';
import {ServiceReg} from '../../auth/auth.module';
import {MenuService} from './menu.service';
import {NavbarMenu} from './model/navbar-menu.model';
import {TranslateService, LangChangeEvent} from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

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

  public notificationOptions = {
    timeOut: 5000,
    pauseOnHover: true,
    clickToClose: true,
    showProgressBar: false,
    position: ['top', 'right']
  }

  constructor(private menuService: MenuService,
              private authService: AuthService,
              private apiMessageService: ApiMessageService,
              private translateService: TranslateService,
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
        this.flagIconCountry = 'flag-icon-gb';
        this.country = 'en';
        this.logo = '/assets/images/logo-it.png';
        localStorage.setItem('lang', 'it');  
      });
    } else {
      this.translateService.use('en').subscribe((lang: string) =>{
        this.flagIconCountry = 'flag-icon-it';
        this.country = 'it';
        this.logo = '/assets/images/logo-en.png';
        localStorage.setItem('lang', 'en');
      });
    }
  }

  public onLogout() {
    this.authService.logout();
    this.notificationService.success('Success', 'Logout effettuato');
  }

  public isAuthenticated() {
      return this.authService.isAuthenticated();
  }

  public ngOnDestroy() {
      this.onUserActivated.unsubscribe();
      this.onLoad.unsubscribe();
      this.onNavbarEvaluated.unsubscribe();
  }

  private showNotification(messageType: MessageType, message: string) {
    if (messageType === MessageType.SUCCESS) {
      this.notificationService.success('Ok', message, this.notificationOptions);
    } else if (messageType === MessageType.ERROR) {
      this.notificationService.error('Errore', message, this.notificationOptions);
    } else if (messageType === MessageType.WARNING) {
      this.notificationService.alert('Alert', message, this.notificationOptions);
    }
  }

  onSubmit(searchData) {
    this.router.navigate(['search'],  { queryParams: searchData });
  }


  sidebarToggle() {
    this.menuService.sidebarEvaluated.next(true);
  }
}
