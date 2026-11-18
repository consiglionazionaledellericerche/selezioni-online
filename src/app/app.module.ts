import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, LOCALE_ID, NgModule, provideZoneChangeDetection, isDevMode} from '@angular/core';
import {registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {provideDesignAngularKit} from 'design-angular-kit';
import {mergedTranslateLoader} from './core/i18n-loader';

import {AppComponent} from './app.component';
import {HeaderComponent} from './layout/header.component';
import {FooterComponent} from './layout/footer.component';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {AuthInterceptor} from './auth/auth.interceptor';

import {CoreModule} from './core/core.module';
import {DynamicModule} from './dynamic/dynamic.module';
import {DynamicService} from './dynamic/dynamic.service';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {GlobalErrorHandler} from './core/global-error-handler.service';

// import ngx-translate and the http loader
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LoadingInterceptor } from './auth/loading.interceptor';
import { ConfigService } from './core/config.service';
import { environment } from '../environments/environment';

import { AuthModule, LogLevel } from 'angular-auth-oidc-client';
import { ServiceWorkerModule } from '@angular/service-worker';

registerLocaleData(localeIt);

/** Pagina di ritorno: quella configurata se è sullo stesso indirizzo dell'applicazione, altrimenti /auth/signin corrente. */
export function oidcRedirectUrl(value: string): string {
  const current = window.location.origin + '/auth/signin';
  if (!value) {
    return current;
  }
  try {
    return new URL(value).origin === window.location.origin ? value : current;
  } catch {
    return current;
  }
}

/**
 * Endpoint OIDC di Keycloak. Senza proxy (default) restituisce undefined: la configurazione viene letta dal realm
 * (.well-known) e il codice si scambia direttamente con Keycloak. Con oidc.tokenProxy = 'true' il token endpoint
 * è quello del backend (/openapi/security/sso/token), che aggiunge il client_secret di un client confidential.
 */
export function oidcEndpoints(authorityValue: string): any {
  const env = (window as any)['env'] || {};
  // scambio diretto con Keycloak (client pubblico con PKCE, es. angular-public); il proxy del backend serve solo
  // per un client confidential e si attiva con window['env']['oidc.tokenProxy'] = 'true'
  const proxy = String(env['oidc.tokenProxy']) === 'true';
  if (!proxy) {
    return undefined;
  }
  const realm = oidcAuthority(authorityValue);
  const apiUrl = String(env['apiUrl'] || window.location.origin).replace(/\/$/, '');
  return {
    issuer: realm,
    authorizationEndpoint: realm + '/protocol/openid-connect/auth',
    tokenEndpoint: apiUrl + '/openapi/security/sso/token',
    userInfoEndpoint: realm + '/protocol/openid-connect/userinfo',
    endSessionEndpoint: realm + '/protocol/openid-connect/logout',
    jwksUri: realm + '/protocol/openid-connect/certs',
    revocationEndpoint: realm + '/protocol/openid-connect/revoke',
    introspectionEndpoint: realm + '/protocol/openid-connect/token/introspect',
  };
}

/** Indirizzo del realm OIDC a partire dal valore configurato (accetta anche l'URL della configurazione). */
export function oidcAuthority(value: string): string {
  const authority = (value || '').trim().replace(/\/\.well-known\/openid-configuration\/?$/, '').replace(/\/$/, '');
  return authority || window.location.origin;
}

@NgModule({

  declarations: [
    AppComponent
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    // ngx-translate and the loader module
    AuthModule.forRoot({
      config: {
        // angular-auth-oidc-client vuole l'indirizzo del realm: se in env.js c'è l'URL completo della
        // configurazione (.../.well-known/openid-configuration) lo si riduce al realm
        authority: oidcAuthority(environment.oidc.authority),
        // client pubblico (default): scambio diretto con Keycloak; client confidential: oidc.tokenProxy = "true"
        authWellknownEndpoints: oidcEndpoints(environment.oidc.authority),
        // ritorno su /auth/signin dello stesso indirizzo da cui si usa l'applicazione (env.js può indicarne un altro)
        redirectUrl: oidcRedirectUrl(environment.oidc.redirectUrl),
        postLogoutRedirectUri: window.location.origin,
        clientId: environment.oidc.clientId,
        // il token serve solo per lo scambio con il backend (/sso): niente offline_access né refresh token,
        // che molti client Keycloak non abilitano
        scope: 'openid profile email',
        responseType: 'code',
        useRefreshToken: false,
        silentRenew: false,
        logLevel: LogLevel.Warn,
        // la pagina di ritorno è /auth/signin: lì viene gestito il codice restituito dall'Identity Provider
        triggerAuthorizationResultEvent: true,
      },
    }),
    TranslateModule,
    AppRoutingModule, // Routing

    CoreModule,        // Componenti moduli e servizi non Lazy
    DynamicModule,
    HeaderComponent,
    FooterComponent,
    // PWA: cache dell'applicazione e notifiche push (solo nelle build di produzione)
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],

  providers: [
    // Il codice dell'applicazione aggiorna la vista dentro subscribe(): serve il change detection basato su zone.js
    // (da Angular 21 il default è zoneless).
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()),
    // design-angular-kit (Bootstrap Italia): font, animazioni e traduzioni del kit + dell'applicazione, come in GesFor
    provideDesignAngularKit({ translateLoader: mergedTranslateLoader }),
    { provide: LOCALE_ID, useValue: 'it-IT' },
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true},
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    DynamicService
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }

