import { DownloadComponent } from './call/shared/download.component';
import { CommunicationsOverviewComponent } from './call/shared/communications-overview.component';
import { AuthenticatedGuard } from '../auth/authenticated-guard.service';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from '../auth/auth-guard.service';
import {ServiceReg} from '../auth/auth.module';
import { ApplicationListComponent } from './application/application-list.component';
import { ApplicationUserListComponent } from './application/application-user-list.component';
import { ManageApplicationComponent } from './application/manage-application.component';
import { CallChildrenComponent, CallLabelsComponent, CallPermissionsComponent, CallCommissionComponent, CommissionGenderComponent } from './call/manage/call-pages.component';
import { CallDetailPageComponent } from './call/call-detail-page.component';
import { CallCommunicationsComponent } from './call/manage/call-communications.component';
import { ManageCallComponent } from './call/manage-call.component';
import { DownloadDocumentComponent } from './document/download-document.component';

const coreRoutes: Routes = [
  { 
    path: 'my-applications', 
    component: ApplicationListComponent, 
    canActivate: [AuthGuard],
    data: {service: ServiceReg.APPLICATION},
    runGuardsAndResolvers: 'always',
  },
  { 
    path: 'applications-user', 
    component: ApplicationUserListComponent, 
    canActivate: [AuthGuard], 
    data: {service: ServiceReg.APPLICATION_USER},
  },
  { 
    path: 'manage-application', 
    component: ManageApplicationComponent, 
    canActivate: [AuthGuard], 
    data: {service: ServiceReg.APPLICATION},
  },
  { 
    path: 'manage-call', 
    component: ManageCallComponent, 
    // permessi verificati dal backend (salvataggio, pubblicazione...): basta l'utente autenticato
    canActivate: [AuthenticatedGuard], 
    data: {service: ServiceReg.CALL},
  },
  // pagina pubblica, come call-detail di cool-jconon
  { path: 'call-detail', component: CallDetailPageComponent },
  { path: 'download', component: DownloadComponent, canActivate: [AuthenticatedGuard] },
  { path: 'communications', component: CommunicationsOverviewComponent, canActivate: [AuthenticatedGuard] },
  { path: 'call-communications', component: CallCommunicationsComponent, canActivate: [AuthenticatedGuard], data: {service: ServiceReg.CALL} },
  { path: 'call-children', component: CallChildrenComponent, canActivate: [AuthenticatedGuard], data: {service: ServiceReg.CALL} },
  { path: 'call-labels', component: CallLabelsComponent, canActivate: [AuthenticatedGuard], data: {service: ServiceReg.CALL} },
  { path: 'call-permissions', component: CallPermissionsComponent, canActivate: [AuthenticatedGuard], data: {service: ServiceReg.CALL} },
  { path: 'call-commission', component: CallCommissionComponent, canActivate: [AuthenticatedGuard], data: {service: ServiceReg.CALL} },
  { path: 'commission-gender', component: CommissionGenderComponent, canActivate: [AuthenticatedGuard], data: {service: ServiceReg.CALL} },
  { 
    path: 'search/content', 
    component: DownloadDocumentComponent, 
    data: {service: ServiceReg.APPLICATION},
    runGuardsAndResolvers: 'always',
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(coreRoutes)
  ],
  exports: [RouterModule],
  providers: [
  ]
})
export class CoreRoutingModule {}
