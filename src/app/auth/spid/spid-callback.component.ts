import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../auth.service';
import { ApiMessageService, MessageType } from '../../core/api-message.service';

/** Chiave della pagina da aprire dopo l'accesso SPID (salvata prima di andare all'Identity Provider). */
export const SPID_REDIRECT_KEY = 'selezioni.spid.redirect';

/**
 * Ritorno dall'accesso SPID diretto del backend (cool-jconon-spid): /spid/send-response reindirizza qui con il
 * ticket (o l'errore) nel frammento dell'indirizzo; il ticket diventa la sessione del frontend.
 */
@Component({
  selector: 'app-spid-callback',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="d-flex align-items-center gap-2 my-5 text-secondary" role="status">
      <div class="progress-spinner progress-spinner-active progress-spinner-sm"></div>{{ 'signin.oidc_loading' | translate }}
    </div>
  `
})
export class SpidCallbackComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly apiMessageService = inject(ApiMessageService);

  ngOnInit(): void {
    const params = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
    // il ticket non resta nella cronologia del browser
    history.replaceState(history.state, '', window.location.pathname);
    const ticket = params.get('ticket');
    if (!ticket) {
      this.apiMessageService.sendMessage(MessageType.ERROR, params.get('error') || 'signin.unauthorized');
      this.router.navigateByUrl('/auth/signin');
      return;
    }
    this.authService.signinWithTicket(ticket).subscribe({
      next: () => {
        const redirect = sessionStorage.getItem(SPID_REDIRECT_KEY);
        sessionStorage.removeItem(SPID_REDIRECT_KEY);
        this.router.navigateByUrl(redirect || '/');
      },
      error: () => this.router.navigateByUrl('/auth/signin')
    });
  }
}
