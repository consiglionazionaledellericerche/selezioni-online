import { SPID_REDIRECT_KEY } from '../spid/spid-callback.component';
import { BRAND } from '../../../brand/brand';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';
import { ApiMessageService, MessageType } from '../../core/api-message.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OidcSecurityService } from 'angular-auth-oidc-client';

import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ConfigService } from '../../core/config.service';
import { Oidc } from '../../core/config.model';

@Component({
  standalone: false,
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styles: [
        '.field-icon {float: right; right: 6px;margin-top: 10px;position: absolute;z-index: 100;}',
        `.btn-sso { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; background: var(--app-primary);
            border: 2px solid var(--app-primary-dark); color: #fff; font-weight: 700; }
         .btn-sso:hover { background: var(--app-primary-dark); color: #fff; }
         .sso-icon { display: inline-flex; align-items: center; justify-content: center; width: 1.6rem; height: 1.6rem;
            border-radius: 50%; background: #fff; }
         .sso-icon .icon { fill: var(--app-primary); }
         .spid-links li { margin-bottom: .35rem; }
         .spid-wrapper { position: relative; }
         .spid-idp-list { position: absolute; z-index: 20; top: 100%; left: 0; min-width: 100%; background: #fff;
           border: 1px solid #d9dadb; border-radius: 4px; margin-top: .25rem; padding: 0; max-height: 26rem; overflow-y: auto; }
         .spid-idp-list li + li { border-top: 1px solid #ececec; }
         .spid-idp { display: block; width: 100%; padding: .6rem .9rem; text-align: left; background: #fff; }
         .spid-idp:hover, .spid-idp:focus-visible { background: #f2f7fc; }
         .spid-idp img { height: 32px; max-width: 100%; object-fit: contain; }
         .recover-panel { padding: .75rem; border: 1px solid #d9dadb; border-radius: 4px; background: #f7f9fb; }
         .recover-input { border: 1px solid #d9dadb !important; border-radius: 4px; height: 2.25rem; padding: .25rem .5rem; }`
    ]
})
export class SigninComponent implements OnInit {
    /** Link all'HelpDesk solo se l'installazione lo prevede. */
    public readonly helpdesk = BRAND.helpdesk !== false;

    private static readonly REDIRECT_KEY = 'selezioni.oidc.redirect';
    public oidcLoading = false;
    public oidcEnabled = false;
    public recoverOpen = false;
    public recoverEmail = '';
    public recovering = false;

    ngForm: FormGroup;
    submitted = false;

    constructor(private formBuilder: FormBuilder,
                private authService: AuthService, 
                private router: Router,
                protected configService: ConfigService,
                private oidcSecurityService: OidcSecurityService,
                private apiMessageService: ApiMessageService,
                private httpClient: HttpClient,
                private translateService: TranslateService) { }

    ngOnInit() {
        this.ngForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
        if (this.spidEnabled) {
            this.loadSpid();
        }
        this.configService.getOidc().subscribe((oidc : Oidc) => {
            this.oidcEnabled = String(oidc.enable) === 'true';
            // come nel legacy l'accesso SSO parte solo dal pulsante; al ritorno dall'Identity Provider
            // (codice o errore nell'indirizzo) si completa l'accesso
            const params = new URLSearchParams(window.location.search);
            if (this.oidcEnabled && (params.has('code') || params.has('error'))) {
                this.oidcLogin();
            }
        });
    }

    /** Accesso SPID diretto del backend (BRAND.spid): Identity Provider dell'elenco del backend (/spid/list). */
    public readonly spidEnabled = BRAND.spid === true;
    public spidIdps: Array<{ key: string, name: string, imageUrl: string }> = [];
    public spidOpen = false;
    private gateway = '';

    private loadSpid(): void {
        this.configService.getGateway().pipe(
            switchMap(gateway => {
                this.gateway = gateway;
                return this.httpClient.get<{ [key: string]: any }>(gateway + '/spid/list');
            })
        ).subscribe({
            next: idps => this.spidIdps = Object.keys(idps || {}).map(key => ({
                key, name: idps[key].name, imageUrl: idps[key].imageUrl
            })),
            error: () => this.spidIdps = []
        });
    }

    /** Logo dell'IdP: indirizzo assoluto o relativo al backend, come nel legacy. */
    public spidImage(idp: { imageUrl: string }): string {
        const url = idp.imageUrl || '';
        return /^https?:/.test(url) ? url : this.gateway.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
    }

    /** Va all'IdP scelto: il backend firma la richiesta SAML e al ritorno apre /auth/spid di questo frontend. */
    public startSpid(idp: { key: string }): void {
        const { redirect } = window.history.state || {};
        if (redirect) {
            sessionStorage.setItem(SPID_REDIRECT_KEY, redirect);
        }
        window.location.href = this.gateway + '/spid/idp?key=' + encodeURIComponent(idp.key) +
            '&frontend=' + encodeURIComponent(window.location.origin);
    }

    /** Pulsante "Entra SSO/SPID/CIE": salva la pagina di destinazione e va all'Identity Provider. */
    public startOidc(): void {
        const { redirect } = window.history.state || {};
        if (redirect) {
            sessionStorage.setItem(SigninComponent.REDIRECT_KEY, redirect);
        }
        this.oidcLoading = true;
        this.oidcSecurityService.authorize();
    }

    /**
     * Recupero password: il backend cerca l'utenza dall'email e invia il link alla pagina /reset-password
     * di questo frontend (POST /openapi/v1/user/forgot-password).
     */
    public recoverPassword(): void {
        const email = (this.recoverEmail || '').trim();
        if (!email) {
            return;
        }
        this.recovering = true;
        this.configService.getApiBase().pipe(
            switchMap(apiBase => this.httpClient.post(apiBase + '/v1/user/forgot-password', { email }))
        ).subscribe({
            next: () => {
                this.recovering = false;
                this.recoverOpen = false;
                this.apiMessageService.sendMessage(MessageType.SUCCESS, 'signin.recover.sent');
            },
            error: (error) => {
                this.recovering = false;
                const message = error && error.error && error.error.message;
                this.apiMessageService.sendMessage(MessageType.ERROR, message || 'signin.recover.error');
            }
        });
    }

    /**
     * Accesso OIDC: al primo passaggio si va all'Identity Provider (salvando la pagina di destinazione,
     * perché history.state non sopravvive al redirect esterno); al ritorno su /auth/signin il codice
     * viene scambiato e il token di accesso passato al backend (/sso).
     */
    private oidcLogin(): void {
        this.oidcLoading = true;
        this.oidcSecurityService.checkAuth().subscribe({
            next: ({ isAuthenticated, accessToken, errorMessage }) => {
                if (!isAuthenticated) {
                    this.oidcError(errorMessage || 'not authenticated');
                    return;
                }
                this.authService.signinUserSSO(accessToken).subscribe({
                    next: () => {
                        const redirect = sessionStorage.getItem(SigninComponent.REDIRECT_KEY) || (window.history.state || {}).redirect;
                        sessionStorage.removeItem(SigninComponent.REDIRECT_KEY);
                        this.oidcLoading = false;
                        this.router.navigateByUrl(redirect || '/');
                    },
                    error: (error) => this.oidcError(error)
                });
            },
            error: (error) => this.oidcError(error)
        });
    }

    private oidcError(error: any): void {
        this.oidcLoading = false;
        console.error('OIDC login failed', error);
        this.apiMessageService.sendMessage(MessageType.ERROR, 'signin.oidc_error');
    }
    // convenience getter for easy access to form fields
    get f() { return this.ngForm.controls; }

    onSignin() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.ngForm.invalid) {
            return;
        }
        const username = this.ngForm.value.username;
        const password = this.ngForm.value.password;
        this.authService.signinUser(username, password).subscribe(
            (response) => {
                const { redirect } = window.history.state;
                this.router.navigateByUrl(redirect || '/');
            }
        );
    }

}
