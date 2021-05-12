import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from '../auth/auth-guard.service';
import {ServiceReg} from '../auth/auth.module';
import { ApplicationListComponent } from './application/application-list.component';
import { ApplicationUserListComponent } from './application/application-user-list.component';
import { ManageApplicationComponent } from './application/manage-application.component';
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
