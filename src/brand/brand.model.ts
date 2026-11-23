/** Struttura della configurazione delle installazioni che estendono selezioni-online (vedi brand.ts). */
export interface Brand {
  /**
   * Form del bulkinfo del tipo di bando (es. "affix_sezione_3") i cui campi non gestiti dai componenti dedicati
   * vengono resi in coda alla sezione della gestione del bando, con il componente generico.
   * Chiavi: "detail" (Dettagli Bando), "settings" (Impostazioni), "aspirant" (Dettagli Candidato).
   */
  callExtraForms: { detail?: string, settings?: string, aspirant?: string };
  /**
   * Sezioni della gestione del bando guidate dal bulkinfo del tipo di bando (form affix_sezione_1, _2, _3): si
   * mostrano solo i campi previsti dal form, come nel frontend legacy. Falso per il CNR.
   */
  callSectionsFromBulkinfo?: boolean;
  /** Proprietà del bando da non mostrare in "Dettagli Bando" (assenti dal bulkinfo affix_sezione_1 dell'installazione). */
  callDetailHidden?: string[];
  /** Ricerca dei bandi: filtri da nascondere e filtri in più (form "all-filters" del bulkinfo dell'installazione). */
  search?: {
    /** Nomi dei controlli dei filtri da nascondere (es. profile, gazzetteNumber, dallaDataInPA). */
    hidden?: string[];
    /** Filtri in più: proprietà del bando con operatore "eq" (uguale) o "like" (contiene) e scelte a pulsante. */
    extraFilters?: Array<{ name: string, label: string, property: string, operator: 'eq' | 'like',
      options: Array<{ value: string, label: string }> }>;
  };
  /** Proprietà in più del bando mostrate nelle schede dell'elenco (colonne del bulkinfo), con l'etichetta dei valori. */
  callCardFields?: Array<{ property: string, label: string, valueLabelPrefix?: string }>;
  /**
   * Accesso SPID diretto del backend (modulo cool-jconon-spid, SAML), come il pulsante "Entra con SPID" del legacy.
   * Per il CNR SPID passa dall'SSO (OIDC) e l'opzione resta spenta.
   */
  spid?: boolean;
  /** HelpDesk disponibile (predefinito sì): se false spariscono menu, pagina, link, sezione del bando e testi. */
  helpdesk?: boolean;
  /** Piè di pagina: ente, indirizzo, link, social, logo esteso e note legali (le voci vuote non compaiono). */
  footer: {
    organization: string;
    address: string;
    contactLinks: Array<{ label: string, url: string }>;
    /** Link aggiunti a Cerca bandi, HelpDesk e F.A.Q. (es. Amministrazione trasparente). */
    siteLinks: Array<{ label: string, url: string }>;
    socials: Array<{ icon: string, url: string, label: string }>;
    logoUrl?: string;
    logoAlt: string;
    privacyUrl?: string;
    legalUrl?: string;
  };
  /** Recapiti della pagina Contatti (il nome dell'ufficio è la traduzione contacts.subtitle). */
  contacts: {
    address: string;
    phones: string[];
    emails: string[];
    pec: string[];
    fax: string[];
  };
}
