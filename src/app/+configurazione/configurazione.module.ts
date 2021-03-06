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

import { TabsModule } from 'ngx-bootstrap/tabs';
import { CarouselModule } from 'ngx-bootstrap/carousel';

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
    FormsModule,
    ReactiveFormsModule,

    SharedModule,
    TagsModule,

    ConfigurazioneRoutingModule,
    TranslateModule.forChild({
      compiler: {provide: TranslateCompiler, useClass: CustomTranslationCompiler},
      loader: {
          provide: TranslateLoader,
          useFactory: CustomHttpLoaderFactory,
          deps: [HttpClient]
      }
    }),
    TabsModule.forRoot(),
    CarouselModule.forRoot()
  ],
  providers: [
    // Servizi necessari solo al ConfigurazioneModule.
    FAQService
  ]

})
export class ConfigurazioneModule {}

// required for AOT compilation
export function CustomHttpLoaderFactory(http: HttpClient) {
  return new ConfigService(http);
}