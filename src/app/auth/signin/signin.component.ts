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
        `.btn-sso { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; background: #0066cc;
            border: 2px solid #004d99; color: #fff; font-weight: 700; }
         .btn-sso:hover { background: #004d99; color: #fff; }
         .sso-icon { display: inline-flex; align-items: center; justify-content: center; width: 1.6rem; height: 1.6rem;
            border-radius: 50%; background: #fff; }
         .sso-icon .icon { fill: #0066cc; }
         .spid-links li { margin-bottom: .35rem; }
         .recover-panel { padding: .75rem; border: 1px solid #d9dadb; border-radius: 4px; background: #f7f9fb; }
         .recover-input { border: 1px solid #d9dadb !important; border-radius: 4px; height: 2.25rem; padding: .25rem .5rem; }`
    ]
})
export class SigninComponent implements OnInit {
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
