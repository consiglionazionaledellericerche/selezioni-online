import { Folder } from '../../common/model/folder.model';
import { JsonProperty, JsonObject } from 'json2typescript';
import { Call } from '../call/call.model';
import { StatoDomanda, PropertyStatoDomandaConverter } from './stato-domanda.enum';
import { EsclusioneRiununcia, PropertyEsclusioneRiununciaConverter } from './esclusione-rinuncia.enum';
import { User } from '../../auth/model/user.model';
import { ISODateTimeConverter } from '../../common/helpers/ISODateTimeConverter';
import { UppercaseConverter } from '../../common/helpers/UppercaseConverter';
import { ObjectToIdConverter } from '../../common/helpers/ObjectToIdConverter';
import { ISODateConverter } from '../../common/helpers/ISODateConverter';

@JsonObject("Application")
export class Application extends Folder {
  @JsonProperty('jconon_application:cognome')
  public cognome: string;
  @JsonProperty('jconon_application:nome')
  public nome: string;
  @JsonProperty('jconon_application:data_nascita', ISODateConverter)
  public data_nascita: Date;
  @JsonProperty('jconon_application:sesso')
  public sesso: string;
  @JsonProperty('jconon_application:nazione_nascita')
  public nazione_nascita: string;
  @JsonProperty('jconon_application:comune_nascita', ObjectToIdConverter)
  public comune_nascita: string;
  @JsonProperty('jconon_application:provincia_nascita')
  public provincia_nascita: string;
  @JsonProperty('jconon_application:codice_fiscale', UppercaseConverter)
  public codice_fiscale: string;
  @JsonProperty('jconon_application:nazione_residenza')
  public nazione_residenza: string;
  @JsonProperty('jconon_application:comune_residenza', ObjectToIdConverter)
  public comune_residenza: string;
  @JsonProperty('jconon_application:provincia_residenza')
  public provincia_residenza: string;
  @JsonProperty('jconon_application:indirizzo_residenza')
  public indirizzo_residenza: string;
  @JsonProperty('jconon_application:num_civico_residenza')
  public num_civico_residenza: string;
  @JsonProperty('jconon_application:cap_residenza')
  public cap_residenza: string;
  @JsonProperty('jconon_application:fl_cittadino_italiano')
  public fl_cittadino_italiano: boolean;
  @JsonProperty('jconon_application:nazione_cittadinanza')
  public nazione_cittadinanza: string;
  @JsonProperty('jconon_application:nazione_comunicazioni')
  public nazione_comunicazioni: string;
  @JsonProperty('jconon_application:comune_comunicazioni', ObjectToIdConverter)
  public comune_comunicazioni: string;
  @JsonProperty('jconon_application:provincia_comunicazioni')
  public provincia_comunicazioni: string;
  @JsonProperty('jconon_application:indirizzo_comunicazioni')
  public indirizzo_comunicazioni: string;
  @JsonProperty('jconon_application:num_civico_comunicazioni')
  public num_civico_comunicazioni: string;
  @JsonProperty('jconon_application:cap_comunicazioni')
  public cap_comunicazioni: string;
  @JsonProperty('jconon_application:email_comunicazioni')
  public email_comunicazioni: string;
  @JsonProperty('jconon_application:email_pec_comunicazioni')
  public email_pec_comunicazioni: string;
  @JsonProperty('jconon_application:telefono_comunicazioni')
  public telefono_comunicazioni: string;
  @JsonProperty('jconon_application:data_domanda', ISODateTimeConverter)
  public data_domanda: Date;
  @JsonProperty('jconon_application:stato_domanda', PropertyStatoDomandaConverter, true)
  public stato_domanda: StatoDomanda;
  @JsonProperty('jconon_application:esclusione_rinuncia', PropertyEsclusioneRiununciaConverter, true)
  public esclusione_rinuncia: EsclusioneRiununcia;
  @JsonProperty('jconon_application:fl_ritiro')
  public fl_ritiro: boolean;
  @JsonProperty('jconon_application:user')
  public user: string;
  @JsonProperty('jconon_application:fl_dichiarazione_sanzioni_penali')
  public fl_dichiarazione_sanzioni_penali: boolean;
  @JsonProperty('jconon_application:fl_dichiarazione_dati_personali')
  public fl_dichiarazione_dati_personali: boolean;
  @JsonProperty('jconon_application:dummy')
  public dummy: string;
  @JsonProperty('jconon_application:graduatoria')
  public graduatoria: string;
  @JsonProperty('jconon_application:totale_punteggio')
  public totale_punteggio: string;
  @JsonProperty('jconon_application:esito_call')
  public esito_call: string;
  @JsonProperty('jconon_application:protocollo_data_graduatoria')
  public protocollo_data_graduatoria: Date;
  @JsonProperty('jconon_application:protocollo_numero_graduatoria')
  public protocollo_numero_graduatoria: string;
  @JsonProperty('jconon_application:protocollo_data_assunzione_idoneo')
  public protocollo_data_assunzione_idoneo: Date;
  @JsonProperty('jconon_application:protocollo_numero_assunzione_idoneo')
  public protocollo_numero_assunzione_idoneo: string;
  @JsonProperty('jconon_application:last_section_completed')
  public last_section_completed: number;

  @JsonProperty('call', Call, true)
  public call: Call = undefined;
  
  @JsonProperty('jconon_application:fl_possesso_requisiti')
  public fl_possesso_requisiti: boolean;

  @JsonProperty('jconon_application:fl_iscritto_liste_elettorali')
  public fl_iscritto_liste_elettorali: boolean = undefined;
  @JsonProperty('jconon_application:comune_liste_elettorali', ObjectToIdConverter)
  public comune_liste_elettorali: string = undefined;
  @JsonProperty('jconon_application:provincia_liste_elettorali')
  public provincia_liste_elettorali: string = undefined;
  @JsonProperty('jconon_application:motivazione_no_iscrizione_liste_elettorali')
  public motivazione_no_iscrizione_liste_elettorali: string = undefined;

  @JsonProperty('jconon_application:fl_godimento_diritti')
  public fl_godimento_diritti: boolean = undefined;
  @JsonProperty('jconon_application:motivazione_no_godimento_diritti')
  public motivazione_no_godimento_diritti: string = undefined;

  @JsonProperty('jconon_application:fl_condanne_penali')
  public fl_condanne_penali: boolean = undefined;
  @JsonProperty('jconon_application:estremi_sentenze_penali')
  public estremi_sentenze_penali: string = undefined;

  @JsonProperty('jconon_application:fl_decaduto_altro_impiego')
  public fl_decaduto_altro_impiego: boolean = undefined;
  @JsonProperty('jconon_application:motivazione_decaduto_altro_impiego')
  public motivazione_decaduto_altro_impiego: string = undefined;

  @JsonProperty('jconon_application:fl_destituito_altro_impiego')
  public fl_destituito_altro_impiego: boolean = undefined;
  @JsonProperty('jconon_application:motivazione_destituito_altro_impiego')
  public motivazione_destituito_altro_impiego: string = undefined;

  @JsonProperty('jconon_application:fl_servizioCNR')
  public fl_servizioCNR: boolean = undefined;
  @JsonProperty('jconon_application:struttura_cnr')
  public struttura_cnr: string = undefined;
  @JsonProperty('jconon_application:titolo_servizio_cnr')
  public titolo_servizio_cnr: string = undefined;
  @JsonProperty('jconon_application:fl_direttore')
  public fl_direttore: boolean = undefined;

  @JsonProperty('jconon_application:fl_idoneita_fisica')
  public fl_idoneita_fisica: boolean = undefined;

  @JsonProperty('jconon_application:fl_servizio_altre_amministrazioni')
  public fl_servizio_altre_amministrazioni: boolean = undefined;
  @JsonProperty('jconon_application:struttura_altre_amministrazioni')
  public struttura_altre_amministrazioni: string = undefined;
  @JsonProperty('jconon_application:titolo_servizio_altre_amministrazioni')
  public titolo_servizio_altre_amministrazioni: string = undefined;
  @JsonProperty('jconon_application:cause_risoluzione_servizio_altre_amministrazioni')
  public cause_risoluzione_servizio_altre_amministrazioni: string = undefined;

  @JsonProperty('jconon_application:fl_titolo_riserva_posti')
  public fl_titolo_riserva_posti: boolean = false;
  @JsonProperty('jconon_application:motivazione_riserva_posti')
  public motivazione_riserva_posti: string = undefined;

  @JsonProperty('jconon_application:fl_diploma')
  public fl_diploma: boolean = undefined;
  @JsonProperty('jconon_application:tipo_diploma')
  public tipo_diploma: string = undefined;
  @JsonProperty('jconon_application:data_diploma', ISODateConverter)
  public data_diploma: Date = undefined;
  @JsonProperty('jconon_application:punteggio_diploma')
  public punteggio_diploma: string = undefined;
  @JsonProperty('jconon_application:istituto_diploma')
  public istituto_diploma: string = undefined;

  @JsonProperty('jconon_application:fl_laurea')
  public fl_laurea: boolean = undefined;
  @JsonProperty('jconon_application:tipo_laurea')
  public tipo_laurea: string = undefined;
  @JsonProperty('jconon_application:data_laurea', ISODateConverter)
  public data_laurea: Date = undefined;
  @JsonProperty('jconon_application:punteggio_laurea')
  public punteggio_laurea: string = undefined;
  @JsonProperty('jconon_application:istituto_laurea')
  public istituto_laurea: string = undefined;
  @JsonProperty('jconon_application:fl_laurea_equipollente')
  public fl_laurea_equipollente: boolean = undefined;

  @JsonProperty('jconon_application:fl_dottorato')
  public fl_dottorato: boolean = undefined;
  @JsonProperty('jconon_application:tipo_dottorato')
  public tipo_dottorato: string = undefined;
  @JsonProperty('jconon_application:data_dottorato', ISODateConverter)
  public data_dottorato: Date = undefined;
  @JsonProperty('jconon_application:istituto_dottorato')
  public istituto_dottorato: string = undefined;

  @JsonProperty('jconon_application:fl_diversamente_abile')
  public fl_diversamente_abile: boolean = undefined;
  @JsonProperty('jconon_application:tempi_aggiuntivi_diversamente_abile')
  public tempi_aggiuntivi_diversamente_abile: string = undefined;
  @JsonProperty('jconon_application:ausili_diversamente_abile')
  public ausili_diversamente_abile: string = undefined;

  @JsonProperty('jconon_application:fl_tempi_aggiuntivi')
  public fl_tempi_aggiuntivi: boolean = undefined;
  @JsonProperty('jconon_application:tempi_aggiuntivi')
  public tempi_aggiuntivi: string = undefined;
  @JsonProperty('jconon_application:ausili')
  public ausili: string = undefined;

  @JsonProperty('jconon_application:fl_conoscenza_lingua_italiana')
  public fl_conoscenza_lingua_italiana: boolean = undefined;

  @JsonProperty('jconon_application:fl_conoscenza_inglese_informatica')
  public fl_conoscenza_inglese_informatica: boolean = undefined;

  @JsonProperty('jconon_application:fl_esperienza')
  public fl_esperienza: boolean = undefined;

  @JsonProperty('jconon_application:fl_altre_borse_studio')
  public fl_altre_borse_studio: boolean = undefined;
  @JsonProperty('jconon_application:descrizione_altre_borse_studio')
  public descrizione_altre_borse_studio: string = undefined;

  @JsonProperty('jconon_application:fl_condizione_esclusione')
  public fl_condizione_esclusione: boolean = undefined;

  @JsonProperty('jconon_application:area_scientifica')
  public area_scientifica: string[] = undefined;

  @JsonProperty('jconon_application:settore_scientifico_tecnologico')
  public settore_scientifico_tecnologico: string[] = undefined;

  @JsonProperty('jconon_application:profilo')
  public profilo: string = undefined;

  @JsonProperty('jconon_application:struttura_appartenenza')
  public struttura_appartenenza: string = undefined;
  
  @JsonProperty('jconon_application:h_index_fonte')
  public h_index_fonte: string = undefined;
  @JsonProperty('jconon_application:h_index_valore')
  public h_index_valore: number = undefined;

  @JsonProperty('jconon_application:fl_servizio_altra_attivita')
  public fl_servizio_altra_attivita: boolean = undefined;
  @JsonProperty('jconon_application:ruolo_altra_attivita')
  public ruolo_altra_attivita: string = undefined;
  @JsonProperty('jconon_application:sede_altra_attivita')
  public sede_altra_attivita: string = undefined;

  @JsonProperty('jconon_application:fl_conoscenza_informatica_avanzata')
  public fl_conoscenza_informatica_avanzata: boolean = undefined;

  @JsonProperty('jconon_application:fl_possesso_cittadinanza_italiana')
  public fl_possesso_cittadinanza_italiana: boolean = undefined;

  @JsonProperty('jconon_application:afl_cittadinanza_italiana_lista')
  public afl_cittadinanza_italiana_lista: boolean = undefined;
  @JsonProperty('jconon_application:possesso_cittadinanza')
  public possesso_cittadinanza: string = undefined;
  @JsonProperty('jconon_application:cittadinanza_stato_estero')
  public cittadinanza_stato_estero: string = undefined;

  @JsonProperty('jconon_application:fl_categorie_riservatarie_art1')
  public fl_categorie_riservatarie_art1: boolean = undefined;
  @JsonProperty('jconon_application:categorie_riservatarie_percentuale')
  public categorie_riservatarie_percentuale: number = undefined;

  @JsonProperty('jconon_application:fl_categorie_riservatarie_art18')
  public fl_categorie_riservatarie_art18: boolean = undefined;
  @JsonProperty('jconon_application:categorie_riservatarie_codice')
  public categorie_riservatarie_codice: string = undefined;

  @JsonProperty('jconon_application:fl_lista_disoccupazione_art1')
  public fl_lista_disoccupazione_art1: boolean = undefined;

  @JsonProperty('jconon_application:fl_lista_disoccupazione_art18')
  public fl_lista_disoccupazione_art18: boolean = undefined;

  @JsonProperty('jconon_application:fl_patente_guida')
  public fl_patente_guida: boolean = undefined;
  @JsonProperty('jconon_application:lista_patente_guida')
  public lista_patente_guida: string = undefined;
  
  @JsonProperty('jconon_application:fl_atto_interruttivo_anzianita')
  public fl_atto_interruttivo_anzianita: boolean = undefined;
  @JsonProperty('jconon_application:provvedimenti_atto_interruttivo')
  public provvedimenti_atto_interruttivo: string = undefined;

  @JsonProperty('jconon_application:fl_titolo_preferenza_posti')
  public fl_titolo_preferenza_posti: boolean = undefined;
  @JsonProperty('jconon_application:motivazione_preferenza_posti')
  public motivazione_preferenza_posti: string = undefined;

  @JsonProperty('jconon_application:fl_conoscenza_lingue')
  public fl_conoscenza_lingue: boolean = undefined;
  @JsonProperty('jconon_application:elenco_lingue_conosciute')
  public elenco_lingue_conosciute: string[] = undefined;

  @JsonProperty('jconon_application:sede')
  public sede: string[] = undefined;
  @JsonProperty('jconon_application:descrizione_sede')
  public descrizione_sede: string[] = undefined;

  @JsonProperty('jconon_application:fl_sanzione_disciplinare')
  public fl_sanzione_disciplinare: boolean = undefined;
  @JsonProperty('jconon_application:estremi_sanzione_disciplinare')
  public estremi_sanzione_disciplinare: string = undefined;

  @JsonProperty('jconon_application:fl_specializzazione')
  public fl_specializzazione: boolean = undefined;
  @JsonProperty('jconon_application:tipo_specializzazione')
  public tipo_specializzazione: string = undefined;
  @JsonProperty('jconon_application:data_specializzazione', ISODateConverter)
  public data_specializzazione: Date = undefined;
  @JsonProperty('jconon_application:istituto_specializzazione')
  public istituto_specializzazione: string = undefined;

  @JsonProperty('jconon_application:fl_ente_comparto_ricerca_appartenenza')
  public fl_ente_comparto_ricerca_appartenenza: boolean = undefined;
  @JsonProperty('jconon_application:ente_comparto_ricerca_appartenenza')
  public ente_comparto_ricerca_appartenenza: string = undefined;
  @JsonProperty('jconon_application:comune_ente_comparto_ricerca_appartenenza', ObjectToIdConverter)
  public comune_ente_comparto_ricerca_appartenenza: string = undefined;
  @JsonProperty('jconon_application:provincia_ente_comparto_ricerca_appartenenza')
  public provincia_ente_comparto_ricerca_appartenenza: string = undefined;
  @JsonProperty('jconon_application:profilo_ente_comparto_ricerca_appartenenza')
  public profilo_ente_comparto_ricerca_appartenenza: string = undefined;
  @JsonProperty('jconon_application:ente_comparto_ricerca_appartenenza_anzianita_servizio', ISODateConverter)
  public ente_comparto_ricerca_appartenenza_anzianita_servizio: Date = undefined;
  @JsonProperty('jconon_application:ente_comparto_ricerca_appartenenza_anzianita_profilo', ISODateConverter)
  public ente_comparto_ricerca_appartenenza_anzianita_profilo: Date = undefined;
  @JsonProperty('jconon_application:ente_comparto_ricerca_appartenenza_anzianita_livello', ISODateConverter)
  public ente_comparto_ricerca_appartenenza_anzianita_livello: Date = undefined;


  @JsonProperty('jconon_application:fl_ente_comparto_universita_appartenenza')
  public fl_ente_comparto_universita_appartenenza: boolean = undefined;
  @JsonProperty('jconon_application:ente_comparto_universita_appartenenza')
  public ente_comparto_universita_appartenenza: string = undefined;
  @JsonProperty('jconon_application:comune_ente_comparto_universita_appartenenza', ObjectToIdConverter)
  public comune_ente_comparto_universita_appartenenza: string = undefined;
  @JsonProperty('jconon_application:provincia_ente_comparto_universita_appartenenza')
  public provincia_ente_comparto_universita_appartenenza: string = undefined;
  @JsonProperty('jconon_application:categoria_ente_comparto_universita_appartenenza')
  public categoria_ente_comparto_universita_appartenenza: string = undefined;
  @JsonProperty('jconon_application:ente_comparto_universita_appartenenza_anzianita_servizio', ISODateConverter)
  public ente_comparto_universita_appartenenza_anzianita_servizio: Date = undefined;
  @JsonProperty('jconon_application:ente_comparto_universita_appartenenza_anzianita_profilo', ISODateConverter)
  public ente_comparto_universita_appartenenza_anzianita_profilo: Date = undefined;

  @JsonProperty('jconon_application:ente_appartenenza')
  public ente_appartenenza: string = undefined;
  @JsonProperty('jconon_application:comune_ente_appartenenza', ObjectToIdConverter)
  public comune_ente_appartenenza: string = undefined;
  @JsonProperty('jconon_application:provincia_ente_appartenenza')
  public provincia_ente_appartenenza: string = undefined;

  @JsonProperty('jconon_application:anzianita_servizio', ISODateConverter)
  public anzianita_servizio: Date = undefined;

  @JsonProperty('jconon_application:anzianita_profilo', ISODateConverter)
  public anzianita_profilo: Date = undefined;

  @JsonProperty('jconon_application:anzianita_livello', ISODateConverter)
  public anzianita_livello: Date = undefined;

  @JsonProperty('jconon_application:fl_area_amministrativa')
  public fl_area_amministrativa: boolean = undefined;
  
  @JsonProperty('jconon_application:fl_area_tecnica')
  public fl_area_tecnica: boolean = undefined;
  @JsonProperty('jconon_application:area_tecnica')
  public area_tecnica: string[] = undefined;

  @JsonProperty('jconon_application:fl_precedente_servizio_cnr')
  public fl_precedente_servizio_cnr: boolean = undefined;
  @JsonProperty('jconon_application:profilo_precedente_servizio_cnr')
  public profilo_precedente_servizio_cnr: string = undefined;

  @JsonProperty('jconon_application:fl_precedente_servizio_altre_amministrazioni')
  public fl_precedente_servizio_altre_amministrazioni: boolean = undefined;
  @JsonProperty('jconon_application:profilo_precedente_servizio_altre_amministrazioni')
  public profilo_precedente_servizio_altre_amministrazioni: string = undefined;

  @JsonProperty('jconon_application:fl_alta_qualificazione')
  public fl_alta_qualificazione: boolean = undefined;
  @JsonProperty('jconon_application:alta_qualificazione')
  public alta_qualificazione: string = undefined;

  @JsonProperty('jconon_application:fl_esperienza_gestionale')
  public fl_esperienza_gestionale: boolean = undefined;
  @JsonProperty('jconon_application:esperienza_gestionale')
  public esperienza_gestionale: string = undefined;

  @JsonProperty('jconon_application:fl_incompatibilita')
  public fl_incompatibilita: boolean = undefined;
  
  @JsonProperty('jconon_application:fl_obblighi_militari')
  public fl_obblighi_militari: boolean = undefined;
  @JsonProperty('jconon_application:obblighi_militari_motivazione')
  public obblighi_militari_motivazione: string = undefined;

  @JsonProperty('jconon_application:fl_licenziamento_disciplinare')
  public fl_licenziamento_disciplinare: boolean = undefined;
  @JsonProperty('jconon_application:motivazione_licenziamento_disciplinare')
  public motivazione_licenziamento_disciplinare: string = undefined;

  @JsonProperty('jconon_application:fl_vincolo_sede')
  public fl_vincolo_sede: boolean = undefined;

  @JsonProperty('jconon_application:fl_contratto_altra_pa')
  public fl_contratto_altra_pa: boolean = undefined;

  @JsonProperty('jconon_application:fl_contratto_td_concorso_presso')
  public fl_contratto_td_concorso_presso: boolean = undefined;
  @JsonProperty('jconon_application:contratto_td_concorso_ente')
  public contratto_td_concorso_ente: string = undefined;
  @JsonProperty('jconon_application:contratto_td_concorso_altro_ente')
  public contratto_td_concorso_altro_ente: string = undefined;
  @JsonProperty('jconon_application:contratto_td_concorso_codice_riferimento')
  public contratto_td_concorso_codice_riferimento: string = undefined;

  @JsonProperty('jconon_application:fl_idoneo_precedenti_graduatorie')
  public fl_idoneo_precedenti_graduatorie: boolean = undefined;
  @JsonProperty('jconon_application:numero_bando_idoneo_precedenti_graduatorie')
  public numero_bando_idoneo_precedenti_graduatorie: string = undefined;
  @JsonProperty('jconon_application:anno_bando_idoneo_precedenti_graduatorie')
  public anno_bando_idoneo_precedenti_graduatorie: BigInteger = undefined;
  @JsonProperty('jconon_application:numero_protocollo_idoneo_precedenti_graduatorie')
  public numero_protocollo_idoneo_precedenti_graduatorie: string = undefined;
  @JsonProperty('jconon_application:data_graduatoria_idoneo_precedenti_graduatorie', ISODateConverter)
  public data_graduatoria_idoneo_precedenti_graduatorie: Date = undefined;

  @JsonProperty('jconon_application:fl_dichiarazione_servizi_collocamento')
  public fl_dichiarazione_servizi_collocamento: boolean = undefined;

  @JsonProperty('jconon_application:motivazioni_candidatura')
  public motivazioni_candidatura: string = undefined;

  @JsonProperty('jconon_application:fl_abilitazione_professione_ingegnere')
  public fl_abilitazione_professione_ingegnere: boolean = undefined;
  @JsonProperty('jconon_application:data_abilitazione_professione_ingegnere', ISODateConverter)
  public data_abilitazione_professione_ingegnere: Date = undefined;
  @JsonProperty('jconon_application:fl_iscrizione_albo_professione_ingegnere')
  public fl_iscrizione_albo_professione_ingegnere: boolean = undefined;
  @JsonProperty('jconon_application:data_iscrizione_albo_professione_ingegnere', ISODateConverter)
  public data_iscrizione_albo_professione_ingegnere: Date = undefined;
  @JsonProperty('jconon_application:provincia_iscrizione_albo_professione_ingegnere')
  public provincia_iscrizione_albo_professione_ingegnere: string = undefined;
  @JsonProperty('jconon_application:sezione_iscrizione_albo_professione_ingegnere')
  public sezione_iscrizione_albo_professione_ingegnere: string = undefined;
  @JsonProperty('jconon_application:settore_iscrizione_albo_professione_ingegnere')
  public settore_iscrizione_albo_professione_ingegnere: string = undefined;


  @JsonProperty('jconon_application:fl_abilitazione_professione_forense')
  public fl_abilitazione_professione_forense: boolean = undefined;
  @JsonProperty('jconon_application:data_abilitazione_professione_forense', ISODateConverter)
  public data_abilitazione_professione_forense: Date = undefined;
  
  @JsonProperty('jconon_application:fl_area_territoriale')
  public fl_area_territoriale: boolean = undefined;
  @JsonProperty('jconon_application:area_territoriale')
  public area_territoriale: string = undefined;

  @JsonProperty('jconon_application:profilo_componente')
  public profilo_componente: string = undefined;

  @JsonProperty('jconon_application:fl_ulteriore_laurea')
  public fl_ulteriore_laurea: boolean = undefined;
  @JsonProperty('jconon_application:tipo_ulteriore_laurea')
  public tipo_ulteriore_laurea: string = undefined;
  @JsonProperty('jconon_application:data_ulteriore_laurea', ISODateConverter)
  public data_ulteriore_laurea: Date = undefined;
  @JsonProperty('jconon_application:punteggio_ulteriore_laurea')
  public punteggio_ulteriore_laurea: string = undefined;
  @JsonProperty('jconon_application:istituto_ulteriore_laurea')
  public istituto_ulteriore_laurea: string = undefined;
  @JsonProperty('jconon_application:fl_ulteriore_laurea_equipollente')
  public fl_ulteriore_laurea_equipollente: boolean = undefined;

  @JsonProperty('jconon_application:fl_ulteriore_dottorato')
  public fl_ulteriore_dottorato: boolean = undefined;
  @JsonProperty('jconon_application:tipo_ulteriore_dottorato')
  public tipo_ulteriore_dottorato: string = undefined;
  @JsonProperty('jconon_application:data_ulteriore_dottorato', ISODateConverter)
  public data_ulteriore_dottorato: Date = undefined;
  @JsonProperty('jconon_application:istituto_ulteriore_dottorato')
  public istituto_ulteriore_dottorato: string = undefined;

  @JsonProperty('jconon_application:fl_altri_assegni')
  public fl_altri_assegni: boolean = undefined;
  @JsonProperty('jconon_application:testo_altri_assegni')
  public testo_altri_assegni: string = undefined;

  @JsonProperty('jconon_application:fl_dichiarazione_1')
  public fl_dichiarazione_1: boolean;
  @JsonProperty('jconon_application:fl_dichiarazione_2')
  public fl_dichiarazione_2: boolean;
  @JsonProperty('jconon_application:fl_dichiarazione_3')
  public fl_dichiarazione_3: boolean;
  @JsonProperty('jconon_application:fl_dichiarazione_4')
  public fl_dichiarazione_4: boolean;
  @JsonProperty('jconon_application:fl_residenza_generica')
  public fl_residenza_generica: boolean;
  

  constructor() {
    super();
    this.cognome = undefined;
    this.nome = undefined;
    this.data_nascita = undefined;
    this.sesso = undefined;
    this.nazione_nascita = undefined;
    this.comune_nascita = undefined;
    this.provincia_nascita = undefined;
    this.codice_fiscale = undefined;
    this.nazione_residenza = undefined;
    this.comune_residenza = undefined;
    this.provincia_residenza = undefined;
    this.indirizzo_residenza = undefined;
    this.num_civico_residenza = undefined;
    this.cap_residenza = undefined;
    this.fl_cittadino_italiano = undefined;
    this.nazione_cittadinanza = undefined;
    this.nazione_comunicazioni = undefined;
    this.comune_comunicazioni = undefined;
    this.provincia_comunicazioni = undefined;
    this.indirizzo_comunicazioni = undefined;
    this.num_civico_comunicazioni = undefined;
    this.cap_comunicazioni = undefined;
    this.email_comunicazioni = undefined;
    this.email_pec_comunicazioni = undefined;
    this.telefono_comunicazioni = undefined;
    this.data_domanda = undefined;
    this.stato_domanda = undefined;
    this.esclusione_rinuncia = undefined;
    this.fl_ritiro = undefined;
    this.user = undefined;
    this.fl_dichiarazione_sanzioni_penali = undefined;
    this.fl_dichiarazione_dati_personali = undefined;
    this.dummy = undefined;
    this.graduatoria = undefined;
    this.totale_punteggio = undefined;
    this.esito_call = undefined;
    this.protocollo_data_graduatoria = undefined;
    this.protocollo_numero_graduatoria = undefined;
    this.protocollo_data_assunzione_idoneo = undefined;
    this.protocollo_numero_assunzione_idoneo = undefined;
    this.last_section_completed = undefined;

    this.fl_possesso_requisiti = undefined;

    this.fl_dichiarazione_1 = undefined;
    this.fl_dichiarazione_2 = undefined;
    this.fl_dichiarazione_3 = undefined;
    this.fl_dichiarazione_4 = undefined;
    this.fl_residenza_generica = undefined;


  }

  public isProvvisoria(): boolean {
    return this.stato_domanda === StatoDomanda.PROVVISORIA;
  }

  public isConfermata(): boolean {
    return this.stato_domanda === StatoDomanda.CONFERMATA;
  }

  public isSospesa(): boolean {
    return this.esclusione_rinuncia === EsclusioneRiununcia.SOSPESA;
  }

  public isShowEsclusioneRiununcia(user: User): boolean {
    if (this.esclusione_rinuncia && this.isConfermata()) {
      if (this.esclusione_rinuncia === EsclusioneRiununcia.SOSPESA && 
            (user.isRdP(this.call.rdp) || user.isConcorsi())) {
        return true;
      } else if ((this.esclusione_rinuncia === EsclusioneRiununcia.SCHEDA_ANONIMA_RESPINTA && user.isRdP(this.call.rdp))||
                (this.esclusione_rinuncia !== EsclusioneRiununcia.SCHEDA_ANONIMA_RESPINTA && 
                  this.esclusione_rinuncia !== EsclusioneRiununcia.SOSPESA)) {
        return true;
      }
    }
    return false;
  }

}
