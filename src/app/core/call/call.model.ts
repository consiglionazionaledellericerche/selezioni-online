import { Folder } from '../../common/model/folder.model';
import { JsonProperty, JsonObject, Any } from 'json2typescript';
import { DateConverter } from '../../common/helpers/DateConverter'
import { ISODateTimeConverter } from '../../common/helpers/ISODateTimeConverter';
import { ObjectToIdConverter } from '../../common/helpers/ObjectToIdConverter';

@JsonObject("Call")
export class Call extends Folder {
  /**
   * Proprietà del bando non dichiarate in questo modello (es. aspect delle installazioni che estendono
   * cool-jconon, come le discipline dei bandi Lincei): conservate per i componenti generici.
   */
  public extraProperties: { [property: string]: any };

  @JsonProperty('jconon_call:codice')
  public codice: string;
  @JsonProperty('jconon_call:descrizione')
  public descrizione: string;
  @JsonProperty('jconon_call:descrizione_en')
  public descrizione_en: string;
  @JsonProperty('jconon_call:descrizione_ridotta')
  public descrizione_ridotta: string;
  @JsonProperty('jconon_call:descrizione_ridotta_en')
  public descrizione_ridotta_en: string;
  @JsonProperty('jconon_call:sede')
  public sede: string;
  @JsonProperty('jconon_call:sede_en')
  public sede_en: string;
  @JsonProperty('jconon_call:struttura_destinataria')
  public struttura_destinataria: string;
  @JsonProperty('jconon_call:struttura_destinataria_en')
  public struttura_destinataria_en: string;
  @JsonProperty('jconon_call:sede_id', ObjectToIdConverter)
  public sede_id: string;
  @JsonProperty('jconon_call:numero_posti')
  public numero_posti: BigInteger;
  @JsonProperty('jconon_call:area_scientifica')
  public area_scientifica: string[];
  @JsonProperty('jconon_call:area_scientifica_en')
  public area_scientifica_en: string[];
  @JsonProperty('jconon_call:settore_scientifico_tecnologico')
  public settore_scientifico_tecnologico: string[];
  @JsonProperty('jconon_call:data_inizio_invio_domande_index', ISODateTimeConverter)
  public data_inizio_invio_domande: Date;
  @JsonProperty('jconon_call:data_fine_invio_domande_index', ISODateTimeConverter)
  public data_fine_invio_domande: Date;
  /** Date iniziali del bando (modificabili finché non è pubblicato); quelle sopra sono le effettive, aggiornate dalle proroghe. */
  @JsonProperty('jconon_call:data_inizio_invio_domande', ISODateTimeConverter, true)
  public data_inizio_invio_domande_initial: Date;
  @JsonProperty('jconon_call:data_fine_invio_domande', ISODateTimeConverter, true)
  public data_fine_invio_domande_initial: Date;
  @JsonProperty('jconon_call:requisiti_link')
  public requisiti_link: string;
  @JsonProperty('jconon_call:requisiti_link_en')
  public requisiti_link_en: string;
  @JsonProperty('jconon_call:requisiti')
  public requisiti: string;
  @JsonProperty('jconon_call:requisiti_en')
  public requisiti_en: string;
  @JsonProperty('jconon_call:elenco_aspects')
  public elenco_aspects: string[];
  @JsonProperty('jconon_call:elenco_association')
  public elenco_association: string[];
  @JsonProperty('jconon_call:elenco_field_not_required')
  public elenco_field_not_required: string[];
  @JsonProperty('jconon_call:has_macro_call')
  public has_macro_call: boolean;
  @JsonProperty('jconon_call:elenco_sezioni_domanda')
  public elenco_sezioni_domanda: string[];
  @JsonProperty('jconon_call:print_dic_sost')
  public print_dic_sost: boolean;
  @JsonProperty('jconon_call:print_trattamento_dati_personali')
  public print_trattamento_dati_personali: boolean;
  @JsonProperty('jconon_call:elenco_sezioni_curriculum')
  public elenco_sezioni_curriculum: string[];
  @JsonProperty('jconon_call:elenco_sezioni_curriculum_ulteriore')
  public elenco_sezioni_curriculum_ulteriore: string[];
  @JsonProperty('jconon_call:elenco_prodotti')
  public elenco_prodotti: string[];
  @JsonProperty('jconon_call:numero_max_prodotti')
  public numero_max_prodotti: BigInteger;
  @JsonProperty('jconon_call:pubblicato')
  public pubblicato: boolean;
  @JsonProperty('jconon_call:elenco_aspects_sezione_cnr')
  public elenco_aspects_sezione_cnr: string[];
  @JsonProperty('jconon_call:elenco_aspects_ulteriori_dati')
  public elenco_aspects_ulteriori_dati: string[];
  @JsonProperty('jconon_call:num_giorni_mail_sollecito')
  public num_giorni_mail_sollecito: BigInteger;
  @JsonProperty('jconon_call:blocco_invio_domande')
  public blocco_invio_domande: boolean;
  @JsonProperty('jconon_call:blocco_invio_domande_message')
  public blocco_invio_domande_message: string;
  @JsonProperty('jconon_call:stato')
  public stato: string;
  @JsonProperty('jconon_call:commissione')
  public commissione: string;
  @JsonProperty('jconon_call:rdp')
  public rdp: string;
  @JsonProperty('jconon_call:scheda_valutazione')
  public scheda_valutazione: boolean;
  @JsonProperty('jconon_call:scheda_anonima_sintetica')
  public scheda_anonima_sintetica: boolean;
  @JsonProperty('jconon_call:elenco_schede_anonime')
  public elenco_schede_anonime: string[];
  @JsonProperty('jconon_call:id_categoria_tecnico_helpdesk')
  public id_categoria_tecnico_helpdesk: BigInteger;
  @JsonProperty('jconon_call:id_categoria_normativa_helpdesk')
  public id_categoria_normativa_helpdesk: BigInteger;
  @JsonProperty('jconon_call:numero_convocazione')
  public numero_convocazione: BigInteger;
  @JsonProperty('jconon_call:graduatoria')
  public graduatoria: boolean;
  @JsonProperty('jconon_call:group_can_submit_application')
  public group_can_submit_application: string;
  // jconon_call:aspect_macro_call
  @JsonProperty('jconon_call:numero_max_domande', Number, true)
  public numero_max_domande: BigInteger;
  // jconon_call:aspect_gu
  @JsonProperty('jconon_call:numero_gu', String, true)
  public numero_gu: string;
  @JsonProperty('jconon_call:data_gu_index', DateConverter, true)
  public data_gu: Date;
  // jconon_call:aspect_inquadramento
  @JsonProperty('jconon_call:profilo', String, true)
  public profilo: string;
  // jconon_call:aspect_macroarea_dipartimentale
  @JsonProperty('jconon_call:elenco_macroaree', [String], true)
  public elenco_macroaree: string[];
  @JsonProperty('jconon_call:elenco_settori_tecnologici', [String], true)
  public elenco_settori_tecnologici: string[] = undefined;
  @JsonProperty('jconon_call:elenco_tipo_selezione', [String], true)
  public elenco_tipo_selezione: string[] = undefined;

  // Campi gestiti dalle sezioni Impostazioni, Requisiti candidati e Punteggi
  @JsonProperty('jconon_call:elenco_aspects_sezione_4', [String], true)
  public elenco_aspects_sezione_4: string[] = undefined;
  @JsonProperty('jconon_call:elenco_aspects_sezione_5', [String], true)
  public elenco_aspects_sezione_5: string[] = undefined;
  @JsonProperty('jconon_call:elenco_lingue_da_conoscere', [String], true)
  public elenco_lingue_da_conoscere: string[] = undefined;
  @JsonProperty('jconon_call:only_user_spid_can_submit_application', Any, true)
  public only_user_spid_can_submit_application: any = undefined;
  @JsonProperty('jconon_call:pagamento_pagopa', Any, true)
  public pagamento_pagopa: any = undefined;
  @JsonProperty('jconon_call:importo_pagamento_pagopa', Any, true)
  public importo_pagamento_pagopa: any = undefined;
  @JsonProperty('jconon_call:group_multiple_application', Any, true)
  public group_multiple_application: any = undefined;
  @JsonProperty('jconon_call_aspect_winner:active', Any, true)
  public winner_active: any = undefined;
  @JsonProperty('jconon_call_aspect_winner:elenco_file', Any, true)
  public winner_elenco_file: any = undefined;
  @JsonProperty('jconon_call:punteggio_1', Any, true)
  public punteggio_1: any = undefined;
  @JsonProperty('jconon_call:punteggio_1_min', Any, true)
  public punteggio_1_min: any = undefined;
  @JsonProperty('jconon_call:punteggio_1_limite', Any, true)
  public punteggio_1_limite: any = undefined;
  @JsonProperty('jconon_call:punteggio_2', Any, true)
  public punteggio_2: any = undefined;
  @JsonProperty('jconon_call:punteggio_2_min', Any, true)
  public punteggio_2_min: any = undefined;
  @JsonProperty('jconon_call:punteggio_2_limite', Any, true)
  public punteggio_2_limite: any = undefined;
  @JsonProperty('jconon_call:punteggio_3', Any, true)
  public punteggio_3: any = undefined;
  @JsonProperty('jconon_call:punteggio_3_min', Any, true)
  public punteggio_3_min: any = undefined;
  @JsonProperty('jconon_call:punteggio_3_limite', Any, true)
  public punteggio_3_limite: any = undefined;
  @JsonProperty('jconon_call:punteggio_4', Any, true)
  public punteggio_4: any = undefined;
  @JsonProperty('jconon_call:punteggio_4_min', Any, true)
  public punteggio_4_min: any = undefined;
  @JsonProperty('jconon_call:punteggio_4_limite', Any, true)
  public punteggio_4_limite: any = undefined;
  @JsonProperty('jconon_call:punteggio_5', Any, true)
  public punteggio_5: any = undefined;
  @JsonProperty('jconon_call:punteggio_5_min', Any, true)
  public punteggio_5_min: any = undefined;
  @JsonProperty('jconon_call:punteggio_5_limite', Any, true)
  public punteggio_5_limite: any = undefined;
  @JsonProperty('jconon_call:punteggio_6', Any, true)
  public punteggio_6: any = undefined;
  @JsonProperty('jconon_call:punteggio_6_min', Any, true)
  public punteggio_6_min: any = undefined;
  @JsonProperty('jconon_call:punteggio_6_limite', Any, true)
  public punteggio_6_limite: any = undefined;
  @JsonProperty('jconon_call:punteggio_7', Any, true)
  public punteggio_7: any = undefined;
  @JsonProperty('jconon_call:punteggio_7_min', Any, true)
  public punteggio_7_min: any = undefined;
  @JsonProperty('jconon_call:punteggio_7_limite', Any, true)
  public punteggio_7_limite: any = undefined;

  constructor() {
      super();
      this.codice = undefined;
      this.descrizione = undefined;
      this.descrizione_en = undefined;
      this.descrizione_ridotta = undefined;
      this.descrizione_ridotta_en = undefined;
      this.sede = undefined;
      this.sede_en = undefined;
      this.struttura_destinataria = undefined;
      this.struttura_destinataria_en = undefined;
      this.sede_id = undefined;
      this.numero_posti = undefined;
      this.area_scientifica = undefined;
      this.area_scientifica_en = undefined;
      this.settore_scientifico_tecnologico = undefined;
      this.data_inizio_invio_domande = undefined;
      this.data_fine_invio_domande = undefined;
      this.data_inizio_invio_domande_initial = undefined;
      this.data_fine_invio_domande_initial = undefined;
      this.requisiti_link = undefined;
      this.requisiti_link_en = undefined;
      this.requisiti = undefined;
      this.requisiti_en = undefined;
      this.elenco_aspects = undefined;
      this.elenco_association = undefined;
      this.elenco_field_not_required = undefined;
      this.has_macro_call = undefined;
      this.elenco_sezioni_domanda = undefined;
      this.print_dic_sost = undefined;
      this.print_trattamento_dati_personali = undefined;
      this.elenco_sezioni_curriculum = undefined;
      this.elenco_sezioni_curriculum_ulteriore = undefined;
      this.elenco_prodotti = undefined;
      this.numero_max_prodotti = undefined;
      this.pubblicato = undefined;
      this.elenco_aspects_sezione_cnr = undefined;
      this.elenco_aspects_ulteriori_dati = undefined;
      this.num_giorni_mail_sollecito = undefined;
      this.blocco_invio_domande = undefined;
      this.blocco_invio_domande_message = undefined;
      this.stato = undefined;
      this.commissione = undefined;
      this.rdp = undefined;
      this.scheda_valutazione = undefined;
      this.scheda_anonima_sintetica = undefined;
      this.elenco_schede_anonime = undefined;
      this.id_categoria_tecnico_helpdesk = undefined;
      this.id_categoria_normativa_helpdesk = undefined;
      this.numero_convocazione = undefined;
      this.graduatoria = undefined;
      this.group_can_submit_application = undefined;
    
      this.numero_max_domande = undefined;
      this.numero_gu = undefined;
      this.data_gu = undefined;
      this.profilo = undefined;
      this.elenco_macroaree = undefined;
  }

  public getLabel() {
    return this.codice;
  }

  public isDirector(): boolean {
    return this.objectTypeId === 'F:jconon_call_director:folder';
  }
 
}
