import {NgModule} from '@angular/core';
import {CoreRoutingModule} from './core-routing.module';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';

import {SidenavComponent} from './sidenav/sidenav.component';
import {SidenavMenuComponent} from './sidenav/sidenav-menu.component';

import {HomeComponent} from './home/home.component';
import {SearchComponent} from './search/search.component';
import { SearchService} from './search/search.service';

import {AppRoutingModule} from '../app-routing.module';
import {SharedModule} from '../shared/shared.module';
import {TagsModule} from '../shared/tags/tags.module';

import {NotificationsService, SimpleNotificationsModule} from 'angular2-notifications';
import {ApiMessageService} from './api-message.service';
import {DropdownNavbarComponent} from './header/dropdown/dropdown-navbar.component';
import {BadRequestComponent} from './badrequest/badrequest.component';
import {ConfigService} from './config.service';
import {NavigationService} from './navigation.service';
import {CacheService} from './cache.service';
import {ObjectTypeService} from './object-type.service';

import {AuthModule} from '../auth/auth.module';
import {MenuService} from './header/menu.service';
import {CallListComponent} from './call/call-list.component';
import {CallService} from './call/call.service';
import {ApplicationListComponent} from './application/application-list.component';
import {ApplicationUserListComponent} from './application/application-user-list.component';
import { ManageApplicationComponent } from './application/manage-application.component';
import { PrintApplicationComponent } from './application/print-application.component';
import {ApplicationService} from './application/application.service';
import {ApplicationUserService} from './application/application-user.service';

import { ManageDocumentComponent } from './document/manage-document.component';
import { DownloadDocumentComponent } from './document/download-document.component';
import { DocumentService} from './document/document.service';


import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

// import ngx-translate and the http loader
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient} from '@angular/common/http';
import { CustomTranslationCompiler } from '../common/helpers/translation-compiler';

/**
 * Nel core module inserisco tutti i components necessari all'avvio dell'applicazione.
 * Esempio Pagina Iniziale ed Header.
 * Deve essere importato esclusivamente da AppModule.
 *
 * Questo modulo inoltre fornisce l'istanza di tutti quei servizi singleton necessari all'applicazione
 * Esempio: notificationService, apiMessageService.
 */
@NgModule({

  declarations: [
    HeaderComponent,
    FooterComponent,
    SidenavComponent,
    SidenavMenuComponent,
    DropdownNavbarComponent,
    HomeComponent,
    SearchComponent,
    CallListComponent,
    ApplicationListComponent,
    ApplicationUserListComponent,
    ManageApplicationComponent,
    PrintApplicationComponent,
    ManageDocumentComponent,
    DownloadDocumentComponent,
    BadRequestComponent,
  ],

  imports: [
    AppRoutingModule,
    CoreRoutingModule,
    SharedModule,                       // Componenti condivisi da tutta l'applicazione (ex. Tags).
    TagsModule,
    AuthModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonsModule.forRoot(),
    TranslateModule.forChild({
      compiler: {provide: TranslateCompiler, useClass: CustomTranslationCompiler},
      loader: {        
          provide: TranslateLoader,
          useFactory: CustomHttpLoaderFactory,
          deps: [HttpClient]
      }
    }),
    CollapseModule.forRoot(),
    ProgressbarModule.forRoot(),
    SimpleNotificationsModule.forRoot() // Le notifiche (per ora) vengono tutte generate nell'header component.
  ],

  exports: [
    AuthModule,
    SharedModule,
    TagsModule,
    HomeComponent,
    SearchComponent,
    HeaderComponent,
    FooterComponent,
    SidenavComponent,
    SidenavMenuComponent,
    BadRequestComponent,    
    CallListComponent,
    ApplicationListComponent,
    ApplicationUserListComponent,
    ManageApplicationComponent,
    PrintApplicationComponent,
    ManageDocumentComponent,
    DownloadDocumentComponent
  ],

  providers: [
    // Capire il discorso del root-injector e child-injector.
    ApiMessageService,
    NotificationsService,
    ConfigService,
    NavigationService,
    MenuService,
    CacheService,
    ObjectTypeService,
    CallService,
    ApplicationService,
    ApplicationUserService,
    DocumentService,
    SearchService
  ],

  entryComponents: [
    ManageDocumentComponent,   
    DownloadDocumentComponent,
    PrintApplicationComponent
  ]
})
export class CoreModule {}

// required for AOT compilation
export function CustomHttpLoaderFactory(http: HttpClient) {
  return new ConfigService(http);
}