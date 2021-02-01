import { Folder } from '../../common/model/folder.model';
import {JsonProperty, JsonObject} from 'json2typescript';
import { Call } from '../call/call.model';
import { StatoDomanda, PropertyStatoDomandaConverter } from './stato-domanda.enum';
import { EsclusioneRiununcia, PropertyEsclusioneRiununciaConverter } from './esclusione-rinuncia.enum';
import { User } from '../../auth/model/user.model';
import { ISODateConverter } from '../../common/helpers/ISODateConverter';
import { ObjectToIdConverter } from '../../common/helpers/ObjectToIdConverter';

@JsonObject("Application")
export class Application extends Folder {
  @JsonProperty('jconon_application:cognome')
  public cognome: string;
  @JsonProperty('jconon_application:nome')
  public nome: string;
  @JsonProperty('jconon_application:data_nascita', ISODateConverter, true)
  public data_nascita: Date;
  @JsonProperty('jconon_application:sesso')
  public sesso: string;
  @JsonProperty('jconon_application:nazione_nascita')
  public nazione_nascita: string;
  @JsonProperty('jconon_application:comune_nascita', ObjectToIdConverter, true)
  public comune_nascita: string;
  @JsonProperty('jconon_application:provincia_nascita')
  public provincia_nascita: string;
  @JsonProperty('jconon_application:codice_fiscale')
  public codice_fiscale: string;
  @JsonProperty('jconon_application:nazione_residenza')
  public nazione_residenza: string;
  @JsonProperty('jconon_application:comune_residenza', ObjectToIdConverter, true)
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
  @JsonProperty('jconon_application:comune_comunicazioni')
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
  @JsonProperty('jconon_application:data_domanda', ISODateConverter, true)
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
  public fl_titolo_riserva_posti: boolean = undefined;
  @JsonProperty('jconon_application:motivazione_riserva_posti')
  public motivazione_riserva_posti: string = undefined;

  @JsonProperty('jconon_application:fl_diploma')
  public fl_diploma: boolean = undefined;
  @JsonProperty('jconon_application:tipo_diploma')
  public tipo_diploma: string = undefined;
  @JsonProperty('jconon_application:data_diploma', ISODateConverter, true)
  public data_diploma: Date = undefined;
  @JsonProperty('jconon_application:punteggio_diploma')
  public punteggio_diploma: string = undefined;
  @JsonProperty('jconon_application:istituto_diploma')
  public istituto_diploma: string = undefined;

  @JsonProperty('jconon_application:fl_laurea')
  public fl_laurea: boolean = undefined;
  @JsonProperty('jconon_application:tipo_laurea')
  public tipo_laurea: string = undefined;
  @JsonProperty('jconon_application:data_laurea', ISODateConverter, true)
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
  @JsonProperty('jconon_application:data_dottorato', ISODateConverter, true)
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
