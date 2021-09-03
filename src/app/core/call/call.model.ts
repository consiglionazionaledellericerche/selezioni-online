import { Folder } from '../../common/model/folder.model';
import { JsonProperty, JsonObject } from 'json2typescript';
import { DateConverter } from '../../common/helpers/DateConverter'

@JsonObject("Call")
export class Call extends Folder {
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
  @JsonProperty('jconon_call:sede_id')
  public sede_id: string;
  @JsonProperty('jconon_call:numero_posti')
  public numero_posti: BigInteger;
  @JsonProperty('jconon_call:area_scientifica')
  public area_scientifica: string[];
  @JsonProperty('jconon_call:area_scientifica_en')
  public area_scientifica_en: string[];
  @JsonProperty('jconon_call:settore_scientifico_tecnologico')
  public settore_scientifico_tecnologico: string[];
  @JsonProperty('jconon_call:data_inizio_invio_domande_index')
  public data_inizio_invio_domande: Date;
  @JsonProperty('jconon_call:data_fine_invio_domande_index')
  public data_fine_invio_domande: Date;
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

}
