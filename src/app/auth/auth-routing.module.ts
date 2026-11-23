import { SpidCallbackComponent } from './spid/spid-callback.component';
import { BRAND } from '../../brand/brand';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {SigninComponent} from './signin/signin.component';
import {UserEditComponent} from './edit/user-edit.component';
import {ConfirmAccountComponent} from './account/confirm-account.component';
import {ResetPasswordComponent} from './account/reset-password.component';

import {FormsModule} from '@angular/forms';

const authRoutes: Routes = [
  { path: 'auth/signin', component: SigninComponent },
  // ritorno dall'accesso SPID diretto del backend (BRAND.spid)
  { path: 'auth/spid', component: SpidCallbackComponent },
  { path: 'create-account', component: UserEditComponent },
  // link delle mail di registrazione e recupero password (backend con frontend.urls configurato)
  { path: 'confirm-account', component: ConfirmAccountComponent },
  // link della mail di registrazione di cool-common (${url}/rest/security/confirm-account) con url = questo frontend
  { path: 'rest/security/confirm-account', component: ConfirmAccountComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'login', redirectTo: 'auth/signin', pathMatch: 'full' },
  { path: 'helpdesk', redirectTo: BRAND.helpdesk === false ? '' : 'configurazione/helpdesk', pathMatch: 'full' },
];

@NgModule({
  imports: [
    FormsModule,
    RouterModule.forChild(authRoutes)
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
