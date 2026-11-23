/**
 * Punti di estensione per le installazioni che estendono selezioni-online (es. selezioni-lincei, che sovrascrive
 * questo file con la propria configurazione). Nell'installazione CNR non è attivo nulla.
 */
import { Brand } from './brand.model';

export const BRAND: Brand = {
  callExtraForms: {},
  helpdesk: true,
  spid: false,
  footer: {
    organization: 'Consiglio Nazionale delle Ricerche',
    address: 'Piazzale Aldo Moro, 7 - 00185 Roma (RM)',
    contactLinks: [
      { label: 'Posta Elettronica Certificata', url: 'mailto:protocollo-ammcen@pec.cnr.it' },
      { label: 'URP - Ufficio Relazioni con il Pubblico', url: 'https://www.urp.cnr.it/' }
    ],
    siteLinks: [{ label: 'Amministrazione trasparente', url: 'https://www.cnr.it/it/amministrazione-trasparente' }],
    socials: [
      { icon: 'github', url: 'https://github.com/consiglionazionaledellericerche', label: 'GitHub' },
      { icon: 'facebook', url: 'https://www.facebook.com/CNRsocialFB', label: 'Facebook' },
      { icon: 'twitter', url: 'https://x.com/CNRsocial_', label: 'X' },
      { icon: 'linkedin', url: 'https://www.linkedin.com/company/283032', label: 'LinkedIn' },
      { icon: 'youtube', url: 'https://www.youtube.com/channel/UCIo3c7BLuAqByu5b1HwarHA', label: 'YouTube' }
    ],
    logoUrl: 'https://www.cnr.it/',
    logoAlt: 'Consiglio Nazionale delle Ricerche',
    privacyUrl: 'https://www.cnr.it/it/privacy-policy',
    legalUrl: 'https://www.cnr.it/it/note-legali'
  },
  contacts: {
    address: 'Piazzale Aldo Moro, 7 - 00185 Roma',
    phones: ['+39 06 4993 2172', '+39 06 4993 2140'],
    emails: ['concorsi@cnr.it'],
    pec: ['concorsi@pec.cnr.it'],
    fax: ['+39 06 4993 3852']
  }
};
