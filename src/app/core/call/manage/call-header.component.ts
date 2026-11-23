import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Call } from '../call.model';

/**
 * Intestazione comune delle pagine di gestione di un bando: percorso di navigazione e
 * riferimento al bando ben visibile (codice, tipologia, profilo), con collegamento al dettaglio.
 */
@Component({
  selector: 'app-call-header',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <nav class="breadcrumb-container pt-3" [attr.aria-label]="'layout.breadcrumb' | translate">
      <ol class="breadcrumb p-0 mb-0">
        <li class="breadcrumb-item"><a routerLink="/">{{ 'layout.home' | translate }}</a><span class="separator">/</span></li>
        <li class="breadcrumb-item"><a routerLink="/">{{ 'layout.calls' | translate }}</a><span class="separator">/</span></li>
        @if (call) {
          <li class="breadcrumb-item">
            <a [routerLink]="['/call-detail']" [queryParams]="{ callCode: call.codice }">{{ call.codice }}</a><span class="separator">/</span>
          </li>
        }
        <li class="breadcrumb-item active" aria-current="page">{{ page | translate }}</li>
      </ol>
    </nav>
    @if (call) {
      <div class="call-ref mt-3">
        <span class="call-ref-label">{{ 'layout.call' | translate }}</span>
        <a class="call-ref-code" [routerLink]="['/call-detail']" [queryParams]="{ callCode: call.codice }">{{ call.codice }}</a>
        @if (call.profilo) {
          <span class="call-ref-profile">{{ call.profilo }}</span>
        }
      </div>
    }
  `,
  styles: [`
    .call-ref { display: flex; flex-wrap: wrap; align-items: baseline; gap: .25rem .75rem; padding: .75rem 1rem;
      background: #f0f6fc; border-left: 4px solid var(--app-primary); border-radius: 4px; }
    .call-ref-label { font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #5d7083; }
    .call-ref-code { font-size: 1.5rem; font-weight: 700; color: var(--app-primary); text-decoration: none; }
    .call-ref-code:hover { text-decoration: underline; }
    .call-ref-profile { color: #17324d; }
  `],
})
export class CallHeaderComponent {
  @Input() call: Call;
  /** Chiave di traduzione del nome della pagina corrente. */
  @Input() page: string;
}
