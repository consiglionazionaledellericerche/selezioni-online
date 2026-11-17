import { DateTileComponent } from '../shared/ui/date-tile.component';
import { CallAttachmentsComponent } from './call/shared/call-attachments.component';
import { ItUploadDragDropComponent } from 'design-angular-kit';
import { ItDropdownModule, ItPopoverDirective, ItTooltipDirective } from 'design-angular-kit';
import { AccordionComponent, AccordionGroupComponent } from '../shared/ui/accordion.component';
import {NgModule} from '@angular/core';
import {CoreRoutingModule} from './core-routing.module';


import {HomeComponent} from './home/home.component';
import {SearchComponent} from './search/search.component';
import { SearchService} from './search/search.service';

import {AppRoutingModule} from '../app-routing.module';
import {SharedModule} from '../shared/shared.module';
import {TagsModule} from '../shared/tags/tags.module';

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
import { CopyApplicationComponent } from './application/copy-application.component';
import { CreateChildCallComponent } from './call/manage/create-child-call.component';
import { CallHeaderComponent } from './call/manage/call-header.component';
import { CallCommunicationsComponent } from './call/manage/call-communications.component';
import { CallDetailPageComponent } from './call/call-detail-page.component';
import { ApplicationSummaryComponent } from './application/application-summary.component';
import { CallChildrenComponent, CallLabelsComponent, CallPermissionsComponent, CallCommissionComponent, CommissionGenderComponent } from './call/manage/call-pages.component';
import {ApplicationService} from './application/application.service';
import {ApplicationUserService} from './application/application-user.service';

import { ManageCallComponent } from './call/manage-call.component';


import { ManageDocumentComponent } from './document/manage-document.component';
import { DownloadDocumentComponent } from './document/download-document.component';
import { DocumentService} from './document/document.service';


import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

// import ngx-translate and the http loader
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
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
        DropdownNavbarComponent,
        HomeComponent,
        SearchComponent,
        CallListComponent,
        ApplicationListComponent,
        ApplicationUserListComponent,
        ManageApplicationComponent,
        ManageCallComponent,
        PrintApplicationComponent,
        CopyApplicationComponent,
        CreateChildCallComponent,
        CallCommunicationsComponent,
        CallDetailPageComponent,
        CallChildrenComponent,
        CallLabelsComponent,
        CallPermissionsComponent,
        CallCommissionComponent,
        CommissionGenderComponent,
        ManageDocumentComponent,
        DownloadDocumentComponent,
        BadRequestComponent,
    ],
    imports: [
        DateTileComponent,
        CallAttachmentsComponent,
        ItUploadDragDropComponent,
        CallHeaderComponent,
        ItDropdownModule,
        ItPopoverDirective,
        ItTooltipDirective,
        AccordionComponent,
        AccordionGroupComponent,
        AppRoutingModule,
        CoreRoutingModule,
        SharedModule,
        TagsModule,
        AuthModule,
        FormsModule,
        ApplicationSummaryComponent,
        ReactiveFormsModule,
        InfiniteScrollModule,
        TranslateModule,
    ],
    exports: [
        ItDropdownModule,
        ItPopoverDirective,
        ItTooltipDirective,
        AccordionComponent,
        AccordionGroupComponent,
        AuthModule,
        SharedModule,
        TagsModule,
        HomeComponent,
        SearchComponent,
        BadRequestComponent,
        CallListComponent,
        ApplicationListComponent,
        ApplicationUserListComponent,
        ManageApplicationComponent,
        ManageCallComponent,
        PrintApplicationComponent,
        ManageDocumentComponent,
        DownloadDocumentComponent
    ],
    providers: [
        // Capire il discorso del root-injector e child-injector.
        ApiMessageService,
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
    ]
})
export class CoreModule {}

// required for AOT compilation
export function CustomHttpLoaderFactory(http: HttpClient) {
  return new ConfigService(http);
}