import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {TagsModule} from '../shared/tags/tags.module';

import {SigninComponent} from './signin/signin.component';
import {UserEditComponent} from './edit/user-edit.component';
import {UserService} from './edit/user.service';

import {ShowUserModalComponent} from './show/show-user-modal.component';
import {ShowGroupMembersModalComponent} from './show/show-group-members-modal.component';

import {AuthRoutingModule} from './auth-routing.module';
import {AuthService} from './auth.service';
import {AuthGuard} from './auth-guard.service';
import {TooltipModule} from 'ngx-bootstrap/tooltip'
import {PopoverModule} from 'ngx-bootstrap/popover'
import {ButtonsModule} from 'ngx-bootstrap/buttons'

import { ApplicationService } from '../core/application/application.service';
import { ApplicationUserService } from '../core/application/application-user.service';

// import ngx-translate and the http loader
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient} from '@angular/common/http';
import { CustomTranslationCompiler } from '../common/helpers/translation-compiler';

export enum ServiceReg {
  CONFIGURAZIONE = 'configurazione',
  APPLICATION = 'application',
  APPLICATION_USER = 'application-user',

  UTENTE = 'utente',
  CONTACTS = 'contacts'
}

@NgModule({
  declarations: [
    SigninComponent,
    UserEditComponent,
    ShowUserModalComponent,
    ShowGroupMembersModalComponent,
  ],
  exports: [
    ShowUserModalComponent,
    ShowGroupMembersModalComponent,
  ],
  imports: [
    SharedModule,
    TagsModule,
    FormsModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    CommonModule,
    TooltipModule,
    PopoverModule,
    ButtonsModule.forRoot(),
    TranslateModule.forRoot({
      compiler: {provide: TranslateCompiler, useClass: CustomTranslationCompiler},
      loader: {
          provide: TranslateLoader,
          useFactory: CustomHttpLoaderFactory,
          deps: [HttpClient]
      }
    }),
  ],
  providers: [
    AuthService,
    UserService,
    AuthGuard,
    ApplicationService, {provide: ServiceReg.APPLICATION, useExisting: ApplicationService},
    ApplicationUserService, {provide: ServiceReg.APPLICATION_USER, useExisting: ApplicationUserService},
    //UtenteService, {provide: ServiceReg.UTENTE, useExisting: UtenteService},
  ]
})
export class AuthModule {}

// required for AOT compilation
export function CustomHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}