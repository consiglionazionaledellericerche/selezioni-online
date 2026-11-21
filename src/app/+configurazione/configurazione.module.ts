import { ContentLinksDirective } from '../core/frontoffice/content-links.directive';
import { ItUploadDragDropComponent } from 'design-angular-kit';
import { ItDropdownModule, ItPopoverDirective, ItTooltipDirective } from 'design-angular-kit';
import { AccordionComponent, AccordionGroupComponent } from '../shared/ui/accordion.component';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {TagsModule} from '../shared/tags/tags.module';

import {ConfigurazioneRoutingModule} from './configurazione-routing.module';
import {ConfigurazioneSectionComponent} from './configurazione-section.component';
import {ContactsComponent} from './contacts/contacts.component'
import {HelpDeskComponent} from './helpdesk/helpdesk.component';
import {FAQComponent} from './faq/faq.component';
import {FAQService} from './faq/faq.service';
import {HelpdeskService} from './helpdesk/helpdesk.service';


// import ngx-translate and the http loader
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import { CustomTranslationCompiler } from '../common/helpers/translation-compiler';
import { ConfigService } from '../core/config.service';

@NgModule({
  declarations: [

    ConfigurazioneSectionComponent,

    ContactsComponent,
    HelpDeskComponent,
    FAQComponent
  ],
  imports: [
    ContentLinksDirective,
        ItUploadDragDropComponent,
        ItDropdownModule,
        ItPopoverDirective,
        ItTooltipDirective,
        AccordionComponent,
        AccordionGroupComponent,
    FormsModule,
    ReactiveFormsModule,

    SharedModule,
    TagsModule,

    ConfigurazioneRoutingModule,
    TranslateModule,
  ],
  providers: [
    // Servizi necessari solo al ConfigurazioneModule.
    FAQService,
    HelpdeskService
  ]

})
export class ConfigurazioneModule {}

// required for AOT compilation
export function CustomHttpLoaderFactory(http: HttpClient) {
  return new ConfigService(http);
}