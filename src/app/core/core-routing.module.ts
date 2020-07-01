import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from '../auth/auth-guard.service';
import {ServiceReg} from '../auth/auth.module';
import { ApplicationListComponent } from './application/application-list.component';
import { ApplicationUserListComponent } from './application/application-user-list.component';
import { ManageApplicationComponent } from './application/manage-application.component';

const coreRoutes: Routes = [
  { 
    path: 'application', 
    component: ApplicationListComponent, 
    canActivate: [AuthGuard],
    data: {service: ServiceReg.APPLICATION},
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
