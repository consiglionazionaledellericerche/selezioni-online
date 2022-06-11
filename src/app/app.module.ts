import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AuthInterceptor} from './auth/auth.interceptor';

import {CoreModule} from './core/core.module';
import {DynamicModule} from './dynamic/dynamic.module';
import {DynamicService} from './dynamic/dynamic.service';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {GlobalErrorHandler} from './core/global-error-handler.service';

// import ngx-translate and the http loader
import { TranslateCompiler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CustomTranslationCompiler } from './common/helpers/translation-compiler';
import { LoadingInterceptor } from './auth/loading.interceptor';
import { ConfigService } from './core/config.service';
import { environment } from '../environments/environment';

import { AuthModule, LogLevel } from 'angular-auth-oidc-client';

@NgModule({

  declarations: [
    AppComponent
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    // ngx-translate and the loader module
    HttpClientModule,
    AuthModule.forRoot({
      config: {
        authority: environment.oidc.authority,
        redirectUrl: environment.oidc.redirectUrl,
        postLogoutRedirectUri: window.location.origin,
        clientId: environment.oidc.clientId,
        scope: 'openid profile email offline_access',
        responseType: 'code',
        useRefreshToken: true,
        logLevel: LogLevel.Debug,
      },
    }),
    TranslateModule.forRoot({
        compiler: {provide: TranslateCompiler, useClass: CustomTranslationCompiler},
        loader: {
            provide: TranslateLoader,
            useFactory: CustomHttpLoaderFactory,
            deps: [HttpClient]
        }
    }),
    AppRoutingModule, // Routing

    CoreModule,        // Componenti moduli e servizi non Lazy
    DynamicModule,
  ],

  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true},
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    DynamicService
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }

// required for AOT compilation
export function CustomHttpLoaderFactory(http: HttpClient) {
  return new ConfigService(http);
}