import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {SigninComponent} from './signin/signin.component';
import {FormsModule} from '@angular/forms';

const authRoutes: Routes = [
  { path: 'auth/signin', component: SigninComponent },
];

@NgModule({
  imports: [
    FormsModule,
    RouterModule.forChild(authRoutes)
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
