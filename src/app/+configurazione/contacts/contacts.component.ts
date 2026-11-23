import { BRAND } from '../../../brand/brand';
import {Component} from '@angular/core';

@Component({
  standalone: false,
    selector: 'contacts',
    templateUrl: './contacts.component.html',
    styles: [`
      .contact-card { border-top: 4px solid var(--app-primary); }
      .contact-icon { width: 2.75rem; height: 2.75rem; border-radius: 50%; background: var(--app-primary-light);
        display: inline-flex; align-items: center; justify-content: center; }
      .contact-value { text-decoration: none; }
      .contact-value:hover { text-decoration: underline; }
      .min-w-0 { min-width: 0; }
      .assistance { border-left: 4px solid var(--app-primary); }
      .assistance-icon { width: 3.5rem; height: 3.5rem; border-radius: 50%; background: var(--app-primary);
        display: inline-flex; align-items: center; justify-content: center; }
    `]
})
export class ContactsComponent {
    public static ROUTE = 'contacts';

    public readonly address = BRAND.contacts.address;
    public readonly helpdesk = BRAND.helpdesk !== false;

    /** Recapiti (dalla configurazione dell'installazione, src/brand): etichetta, icona, valori e schema del link. */
    public readonly contacts = [
      { label: 'contacts.labels.phone', icon: 'it-telephone', scheme: 'tel:', values: BRAND.contacts.phones },
      { label: 'contacts.labels.email', icon: 'it-mail', scheme: 'mailto:', values: BRAND.contacts.emails },
      { label: 'contacts.labels.pec', icon: 'it-inbox', scheme: 'mailto:', values: BRAND.contacts.pec },
      { label: 'contacts.labels.fax', icon: 'it-print', scheme: 'tel:', values: BRAND.contacts.fax }
    ].filter(contact => contact.values && contact.values.length);

    /** Link del recapito senza spazi (tel:+390649932172, mailto:...). */
    href(scheme: string, value: string): string {
      return scheme + value.replace(/\s+/g, '');
    }
}
