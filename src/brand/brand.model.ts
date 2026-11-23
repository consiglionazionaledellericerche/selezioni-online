/** Struttura della configurazione delle installazioni che estendono selezioni-online (vedi brand.ts). */
export interface Brand {
  /**
   * Form del bulkinfo del tipo di bando (es. "affix_sezione_3") i cui campi non gestiti dai componenti dedicati
   * vengono resi in coda alla sezione della gestione del bando, con il componente generico.
   * Chiavi: "detail" (Dettagli Bando), "settings" (Impostazioni), "aspirant" (Dettagli Candidato).
   */
  callExtraForms: { detail?: string, settings?: string, aspirant?: string };
  /** Recapiti della pagina Contatti (il nome dell'ufficio è la traduzione contacts.subtitle). */
  contacts: {
    address: string;
    phones: string[];
    emails: string[];
    pec: string[];
    fax: string[];
  };
}
