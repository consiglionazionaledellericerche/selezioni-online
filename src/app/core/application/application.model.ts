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
  
  constructor() {
    super();
    this.cognome = null;
    this.nome = null;
    this.data_nascita = null;
    this.sesso = null;
    this.nazione_nascita = null;
    this.comune_nascita = null;
    this.provincia_nascita = null;
    this.codice_fiscale = null;
    this.nazione_residenza = null;
    this.comune_residenza = null;
    this.provincia_residenza = null;
    this.indirizzo_residenza = null;
    this.num_civico_residenza = null;
    this.cap_residenza = null;
    this.fl_cittadino_italiano = null;
    this.nazione_cittadinanza = null;
    this.nazione_comunicazioni = null;
    this.comune_comunicazioni = null;
    this.provincia_comunicazioni = null;
    this.indirizzo_comunicazioni = null;
    this.num_civico_comunicazioni = null;
    this.cap_comunicazioni = null;
    this.email_comunicazioni = null;
    this.email_pec_comunicazioni = null;
    this.telefono_comunicazioni = null;
    this.data_domanda = null;
    this.stato_domanda = null;
    this.esclusione_rinuncia = null;
    this.fl_ritiro = null;
    this.user = null;
    this.fl_dichiarazione_sanzioni_penali = null;
    this.fl_dichiarazione_dati_personali = null;
    this.dummy = null;
    this.graduatoria = null;
    this.totale_punteggio = null;
    this.esito_call = null;
    this.protocollo_data_graduatoria = null;
    this.protocollo_numero_graduatoria = null;
    this.protocollo_data_assunzione_idoneo = null;
    this.protocollo_numero_assunzione_idoneo = null;
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
