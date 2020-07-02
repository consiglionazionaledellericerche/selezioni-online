import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {SigninComponent} from './signin/signin.component';
import {UserEditComponent} from './edit/user-edit.component';

import {FormsModule} from '@angular/forms';

const authRoutes: Routes = [
  { path: 'auth/signin', component: SigninComponent },
  { path: 'create-account', component: UserEditComponent },
];

@NgModule({
  imports: [
    FormsModule,
    RouterModule.forChild(authRoutes)
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
