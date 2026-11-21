import { FrontOfficeAdminComponent } from './frontoffice/frontoffice-admin.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminSectionComponent } from './admin-section.component';
import { AdminGuard } from './admin.guard';
import { GroupsComponent } from './groups/groups.component';
import { UsersComponent } from './users/users.component';
import { RbacComponent } from './rbac/rbac.component';
import { CacheComponent } from './cache/cache.component';
import { ViewsComponent } from './views/views.component';
import { JsConsoleComponent } from './js-console/js-console.component';

/**
 * Gli id in data.rbac sono quelli gia' configurati in rbac.get.json per le pagine legacy.
 */
const adminRoutes: Routes = [
  {
    path: '', component: AdminSectionComponent, children: [
      { path: '', redirectTo: 'groups', pathMatch: 'full' },
      { path: 'groups', component: GroupsComponent, canActivate: [AdminGuard], data: { rbac: 'groups' } },
      { path: 'gestori', component: GroupsComponent, canActivate: [AdminGuard], data: { rbac: 'gestori', gestori: true } },
      { path: 'users', component: UsersComponent, canActivate: [AdminGuard], data: { rbac: 'gestione-utenti' } },
      { path: 'rbac', component: RbacComponent, canActivate: [AdminGuard], data: { rbac: 'rbac-admin' } },
      { path: 'cache', component: CacheComponent, canActivate: [AdminGuard] },
      { path: 'views', component: ViewsComponent, canActivate: [AdminGuard] },
      { path: 'frontoffice', component: FrontOfficeAdminComponent, canActivate: [AdminGuard] },
      { path: 'js-console', component: JsConsoleComponent, canActivate: [AdminGuard], data: { rbac: 'jsConsole' } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(adminRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
