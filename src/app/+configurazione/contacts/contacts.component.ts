import {Component} from '@angular/core';

@Component({
  standalone: false,
    selector: 'contacts',
    templateUrl: './contacts.component.html',
    styles: [`
      .contact-card { border-top: 4px solid #0066cc; }
      .contact-icon { width: 2.75rem; height: 2.75rem; border-radius: 50%; background: #e6f0fa;
        display: inline-flex; align-items: center; justify-content: center; }
      .contact-value { text-decoration: none; }
      .contact-value:hover { text-decoration: underline; }
      .min-w-0 { min-width: 0; }
      .assistance { border-left: 4px solid #0066cc; }
      .assistance-icon { width: 3.5rem; height: 3.5rem; border-radius: 50%; background: #0066cc;
        display: inline-flex; align-items: center; justify-content: center; }
    `]
})
export class ContactsComponent {
    public static ROUTE = 'contacts';

    public readonly address = 'Piazzale Aldo Moro, 7 - 00185 Roma';

    /** Recapiti dell'Ufficio Concorsi: etichetta tradotta, icona, valori e schema del link. */
    public readonly contacts = [
      { label: 'contacts.labels.phone', icon: 'it-telephone', scheme: 'tel:', values: ['+39 06 4993 2172', '+39 06 4993 2140'] },
      { label: 'contacts.labels.email', icon: 'it-mail', scheme: 'mailto:', values: ['concorsi@cnr.it'] },
      { label: 'contacts.labels.pec', icon: 'it-inbox', scheme: 'mailto:', values: ['concorsi@pec.cnr.it'] },
      { label: 'contacts.labels.fax', icon: 'it-print', scheme: 'tel:', values: ['+39 06 4993 3852'] }
    ];

    /** Link del recapito senza spazi (tel:+390649932172, mailto:...). */
    href(scheme: string, value: string): string {
      return scheme + value.replace(/\s+/g, '');
    }
}
