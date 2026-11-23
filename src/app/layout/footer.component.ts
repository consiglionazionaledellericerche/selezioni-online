import { BRAND } from '../../brand/brand';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ItBackToTopComponent, ItIconComponent, ItListModule } from 'design-angular-kit';

/** Piè di pagina Bootstrap Italia sul modello di GesFor/GERI, con i contenuti di Selezioni online. */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe, ItIconComponent, ItListModule, ItBackToTopComponent],
  template: `
    <footer class="it-footer">
      <div class="it-footer-main bg-dark">
        <div class="container">
          <section>
            <div class="row clearfix">
              <div class="col-sm-12">
                <div class="it-brand-wrapper">
                  <a routerLink="/">
                    <div class="it-brand-text d-flex align-items-center">
                      <img src="assets/images/logo_cnr.png" alt="" width="64" class="me-3">
                      <div class="it-brand-text">
                        <div class="it-brand-title">{{ 'header.title' | translate }}</div>
                        <div class="it-brand-tagline d-none d-md-block">{{ 'header.subtitle' | translate }}</div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="container">
          <div class="row">
            <div class="col-lg-4 col-md-4 pb-2">
              <h4>{{ 'contacts.title' | translate }}</h4>
              <p>
                <strong>{{ footer.organization }}</strong><br>
                {{ footer.address }}
              </p>
              @if (footer.contactLinks.length) {
                <it-list [linkList]="true">
                  @for (link of footer.contactLinks; track link.url) {
                    <it-list-item><a [href]="link.url" target="_blank" rel="noopener">{{ link.label }}</a></it-list-item>
                  }
                </it-list>
              }
            </div>
            <div class="col-lg-4 col-md-4 pb-2">
              <h4>{{ 'header.title' | translate }}</h4>
              <it-list [linkList]="true">
                <it-list-item><a routerLink="/search">{{ 'layout.search_calls' | translate }}</a></it-list-item>
                @if (helpdesk) {
                  <it-list-item><a routerLink="/configurazione/helpdesk">{{ 'helpdesk.title' | translate }}</a></it-list-item>
                }
                <it-list-item><a routerLink="/configurazione/faq">{{ 'faq.title' | translate }}</a></it-list-item>
                @for (link of footer.siteLinks; track link.url) {
                  <it-list-item><a [href]="link.url" target="_blank" rel="noopener">{{ link.label }}</a></it-list-item>
                }
              </it-list>
            </div>
            @if (footer.socials.length) {
              <div class="col-lg-4 col-md-4 pb-2">
                <h4>Seguici su</h4>
                <ul class="list-inline text-left social">
                  @for (social of footer.socials; track social.url) {
                    <li class="list-inline-item">
                      <a class="p-2 text-white" [href]="social.url" target="_blank" rel="noopener">
                        <it-icon [name]="$any(social.icon)" color="white" size="sm" /><span class="visually-hidden">{{ social.label }} (link esterno)</span>
                      </a>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      </div>
      <div class="it-footer-main bg-light">
        <div class="container">
          <section class="py-4 bg-light border-top">
            <a [href]="footer.logoUrl || '/'" target="_blank" rel="noopener">
              <img src="assets/images/logo_CNR_affiancato.png" [alt]="footer.logoAlt" style="max-width: 400px; width: 100%">
            </a>
          </section>
        </div>
      </div>
      <div class="it-footer-small-prints clearfix">
        <div class="container">
          <h3 class="visually-hidden">Sezione Link Utili</h3>
          <ul class="it-footer-small-prints-list list-inline mb-0 d-flex flex-column flex-md-row">
            <li class="list-inline-item">© {{ year }} {{ footer.organization }}</li>
            @if (footer.privacyUrl) {
              <li class="list-inline-item"><a [href]="footer.privacyUrl" target="_blank" rel="noopener">Privacy policy</a></li>
            }
            @if (footer.legalUrl) {
              <li class="list-inline-item"><a [href]="footer.legalUrl" target="_blank" rel="noopener">Note legali</a></li>
            }
          </ul>
        </div>
      </div>
    </footer>
    <it-back-to-top [shadow]="true"></it-back-to-top>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  /** Contenuti del piè di pagina dell'installazione (src/brand). */
  readonly footer = BRAND.footer;
  readonly helpdesk = BRAND.helpdesk !== false;
}
