import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ConfigurazioneSectionComponent} from './configurazione-section.component';
import {AuthGuard} from '../auth/auth-guard.service';
import {ServiceReg} from '../auth/auth.module';
import {ContactsComponent} from './contacts/contacts.component'
import {HelpDeskComponent} from './helpdesk/helpdesk.component';
import {FAQComponent} from './faq/faq.component';

const configurazioneRoutes: Routes = [

  { path: ContactsComponent.ROUTE, component: ConfigurazioneSectionComponent, children: [
      { path: '', component: ContactsComponent },
    ], data: {service: ServiceReg.CONFIGURAZIONE} 
  },
  { path: HelpDeskComponent.ROUTE, component: ConfigurazioneSectionComponent, children: [
    { path: '', component: HelpDeskComponent },
    ], data: {service: ServiceReg.CONFIGURAZIONE} 
  },
  { path: FAQComponent.ROUTE, component: ConfigurazioneSectionComponent, children: [
    { path: '', component: FAQComponent },
    ], data: {service: ServiceReg.CONFIGURAZIONE} 
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(configurazioneRoutes)
  ],
  exports: [RouterModule],
  providers: [
  ]
})
export class ConfigurazioneRoutingModule {}
