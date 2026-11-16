import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './core/home/home.component';
import {BadRequestComponent} from './core/badrequest/badrequest.component';
import { SearchComponent } from './core/search/search.component';

export const MODULE_CONFIGURAZIONE = 'configurazione';
export const MODULE_ADMIN = 'admin';

const appRoutes: Routes = [

  { path: 'bad-request', component: BadRequestComponent },
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: MODULE_CONFIGURAZIONE, loadChildren: () => import('./+configurazione/configurazione.module').then(m => m.ConfigurazioneModule)},
  { path: MODULE_ADMIN, loadChildren: () => import('./+admin/admin.module').then(m => m.AdminModule)}
];

@NgModule({
  imports: [
    // RouterModule.forRoot(appRoutes, {preloadingStrategy: PreloadAllModules})
    // RouterModule.forRoot(appRoutes, {preloadingStrategy: PreloadAllModules})
RouterModule.forRoot(appRoutes, { })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
