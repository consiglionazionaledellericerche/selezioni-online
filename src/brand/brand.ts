/**
 * Punti di estensione per le installazioni che estendono selezioni-online (es. selezioni-lincei, che sovrascrive
 * questo file con la propria configurazione). Nell'installazione CNR non è attivo nulla.
 */
import { Brand } from './brand.model';

export const BRAND: Brand = {
  callExtraForms: {},
  contacts: {
    address: 'Piazzale Aldo Moro, 7 - 00185 Roma',
    phones: ['+39 06 4993 2172', '+39 06 4993 2140'],
    emails: ['concorsi@cnr.it'],
    pec: ['concorsi@pec.cnr.it'],
    fax: ['+39 06 4993 3852']
  }
};
