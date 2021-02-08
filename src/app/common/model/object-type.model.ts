import { Document } from './document.model';
import { Folder } from './folder.model';
import { Application } from '../../core/application/application.model'
import { Call } from '../../core/call/call.model'

import { Attachment } from './attachment.model';
import { DocumentoRiconoscimento } from './documento_riconoscimento.model'
import { User } from '../../auth/model/user.model';

import { JcononAttachmentCallShowComponent } from '../../dynamic/attachment/jconon-attachment-call-show.component';
import { JcononAttachmentDocumentoRiconoscimentoShowComponent } from '../../dynamic/attachment/jconon-attachment-documento-riconoscimento-show.component';
import { JcononAttachmentShowComponent } from '../../dynamic/attachment/jconon-attachment-show.component';
import { JcononAffixAnagraficaComponent } from '../../dynamic/affix/anagrafica.component';
import { JcononAffixResidenzaComponent } from '../../dynamic/affix/residenza.component';
import { JcononAffixDichiarazioniConclusiveComponent } from '../../dynamic/affix/dichiarazioni_conclusive.component';
import { JcononAffixDichiarazioniComponent } from '../../dynamic/affix/dichiarazioni.component';
import { JcononAspectPossessoRequisitiComponent } from '../../dynamic/aspect/possesso-requisiti.component';
import { JcononAspectsDichiarazioneComponent } from '../../dynamic/aspect/dichiarazione.component';
import { JcononAspectIscrizioneListeElettoraliComponent } from '../../dynamic/aspect/iscrizione-liste-elettorali.component';
import { JcononAspectGodimentoDirittiComponent } from '../../dynamic/aspect/godimento-diritti.component';
import { JcononAspectCondannePenaliComponent } from '../../dynamic/aspect/condanne-penali.component';
import { JcononAspectDecadutoAltroImpiegoComponent } from '../../dynamic/aspect/decaduto-altro-impiego.component';
import { JcononAspectDestituitoAltroImpiegoComponent } from '../../dynamic/aspect/destituito-altro-impiego.component';
import { JcononAspectServizioCNRComponent } from '../../dynamic/aspect/servizio-cnr.component';
import { JcononAspectServizioAltreAmministrazioniComponent } from '../../dynamic/aspect/servizio-altre-amministrazioni.component';
import { JcononAspectTitoloRiservaPostiComponent } from '../../dynamic/aspect/titolo-riserva-posti.component';
import { JcononAspectDiplomaComponent } from '../../dynamic/aspect/diploma.component';
import { JcononAspectLaureaComponent } from '../../dynamic/aspect/laurea.component';
import { JcononAspectDottoratoComponent } from '../../dynamic/aspect/dottorato.component';
import { JcononAspectDiversmenteAbileComponent } from '../../dynamic/aspect/diversamente-abile.component';
import { JcononAspectTempiAggiuntiviComponent } from '../../dynamic/aspect/tempi-aggiuntivi.component';
import { JcononAspectAltreBorseStudioComponent } from '../../dynamic/aspect/altre-borse-studio.component';
import { JcononAspectAreaScientificaComponent } from '../../dynamic/aspect/area-scientifica.component';
import { JcononAspectSettoreScientificoTecnologicoComponent } from '../../dynamic/aspect/settore-scientifico-tecnologico.component';
import { JcononAspectInquadramentoComponent } from '../../dynamic/aspect/inquadramento.component';
import { JcononAspectStrutturaAppartenenzaComponent } from '../../dynamic/aspect/struttura-appartenenza.component';
import { JcononAspectHIndexComponent } from '../../dynamic/aspect/h-index.component';
import { JcononAspectServizioAltraAttivitaComponent } from '../../dynamic/aspect/servizio-altra-attivita.component';
import { JcononAspectPossessoCittadinanzaComponent } from '../../dynamic/aspect/possesso-cittadinanza.component';
import { JcononAspectCategorieRiservatarieArt1Component } from '../../dynamic/aspect/categorie-riservatarie-art1.component';
import { JcononAspectCategorieRiservatarieArt18Component } from '../../dynamic/aspect/categorie-riservatarie-art18.component';
import { JcononAspectPatenteGuidaComponent } from '../../dynamic/aspect/patente-guida.component';
import { JcononAspectAttoInterruttivoAnzianitaComponent } from '../../dynamic/aspect/atto-interruttivo-anzianita.component';
import { JcononAspectTitoloPreferenzaPostiComponent } from '../../dynamic/aspect/titolo-preferenza-posti.component';
import { JcononAspectConoscenzaLingueComponent } from '../../dynamic/aspect/conoscenza-lingue.component';
import { JcononAspectSedeComponent } from '../../dynamic/aspect/sede.component';

export class ObjectType {
    
  public static classes = {
    'cmis:document': {
      model: Document
    },
    'cmis:folder': {
      model: Folder
    },
    'cm:person': {
      model: User
    },
    'F:jconon_call:folder': {
      model: Call
    },
    'F:jconon_call_tind:folder': {
      model: Call
    },
    'F:jconon_call_tind:folder_concorsi_pubblici': {
      model: Call
    },
    'F:jconon_call_tind:folder_reclutamento_speciale': {
      model: Call
    },
    'F:jconon_call_tind:folder_categorie_protette': {
      model: Call
    },
    'F:jconon_call_tdet:folder': {
      model: Call
    },
    'F:jconon_call_bstd:folder': {
      model: Call
    },
    'F:jconon_call_aric:folder': {
      model: Call
    },
    'F:jconon_call_mobility:folder': {
      model: Call
    },
    'F:jconon_call_mobility_open:folder': {
      model: Call
    },
    'F:jconon_call_director:folder': {
      model: Call
    },
    'F:jconon_call_tind:folder_tirocini_categorie_protette': {
      model: Call
    },
    'F:jconon_call_tind:manifestazione_interesse': {
      model: Call
    },
    'F:jconon_call_employees:folder': {
      model: Call
    },
    'F:jconon_application:folder': {
      model: Application
    },
    'D:jconon_dic_sost:attachment': {
      model: Attachment
    },
    'D:jconon_documento_riconoscimento:attachment': {
      model: DocumentoRiconoscimento,
      showcomponent: JcononAttachmentDocumentoRiconoscimentoShowComponent
    },
    'D:jconon_attachment:call_it' : {
      model: Attachment,
      showcomponent: JcononAttachmentCallShowComponent
    },

    'affix_tabAnagrafica' : {
      model: Application,
      showcomponent: JcononAffixAnagraficaComponent
    },
    'affix_tabResidenza' : {
      model: Application,
      showcomponent: JcononAffixResidenzaComponent
    },
    'affix_tabDichiarazioni' : {
      model: Application,
      showcomponent: JcononAffixDichiarazioniComponent
    },
    'affix_tabDichiarazioniConclusive' : {
      model: Application,
      showcomponent: JcononAffixDichiarazioniConclusiveComponent
    },
    'P:jconon_application:aspect_possesso_requisiti' : {
      model: Application,
      showcomponent: JcononAspectPossessoRequisitiComponent
    },
    'P:jconon_application:aspect_iscrizione_liste_elettorali' : {
      model: Application,
      showcomponent: JcononAspectIscrizioneListeElettoraliComponent
    },
    'P:jconon_application:aspect_godimento_diritti' : {
      model: Application,
      showcomponent: JcononAspectGodimentoDirittiComponent
    },
    'P:jconon_application:aspect_condanne_penali' : {
      model: Application,
      showcomponent: JcononAspectCondannePenaliComponent
    },
    'P:jconon_application:aspect_condanne_penali_required' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_condanne_penali',
        name: 'fl_condanne_penali',
        required: true,
        label: 'label.jconon_application.fl_condanne_penali'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_decaduto_altro_impiego' : {
      model: Application,
      showcomponent: JcononAspectDecadutoAltroImpiegoComponent
    },
    'P:jconon_application:aspect_destituito_altro_impiego' : {
      model: Application,
      showcomponent: JcononAspectDestituitoAltroImpiegoComponent
    },
    'P:jconon_application:aspect_servizioCNR' : {
      model: Application,
      showcomponent: JcononAspectServizioCNRComponent
    },
    'P:jconon_application:aspect_servizioCNRWithoutDirettore' : {
      model: Application,
      showcomponent: JcononAspectServizioCNRComponent,
      params: {
        hiddenDirettore: true
      }
    },
    'P:jconon_application:aspect_servizio_altre_amministrazioni' : {
      model: Application,
      showcomponent: JcononAspectServizioAltreAmministrazioniComponent
    },
    'P:jconon_application:aspect_servizio_altre_amministrazioniWithoutDirettore' : {
      model: Application,
      showcomponent: JcononAspectServizioAltreAmministrazioniComponent,
      params: {
        hiddenRisoluzione: false
      }
    },
    'P:jconon_application:aspect_idoneita_fisica' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_idoneita_fisica',
        name: 'fl_idoneita_fisica',
        required: true,
        label: 'label.jconon_application.fl_idoneita_fisica'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_titolo_riserva_posti' : {
      model: Application,
      showcomponent: JcononAspectTitoloRiservaPostiComponent
    },
    'P:jconon_application:aspect_diploma' : {
      model: Application,
      showcomponent: JcononAspectDiplomaComponent
    },
    'P:jconon_application:aspect_diploma_not_required' : {
      model: Application,
      params: {
        isFlRequired: false
      },
      showcomponent: JcononAspectDiplomaComponent
    },
    'P:jconon_application:aspect_laurea' : {
      model: Application,
      showcomponent: JcononAspectLaureaComponent
    },
    'P:jconon_application:aspect_laurea_not_required' : {
      model: Application,
      params: {
        isFlRequired: false
      },
      showcomponent: JcononAspectLaureaComponent
    },
    'P:jconon_application:aspect_dottorato' : {
      model: Application,
      showcomponent: JcononAspectDottoratoComponent
    },
    'P:jconon_application:aspect_dottorato_not_required' : {
      model: Application,
      params: {
        isFlRequired: false
      },
      showcomponent: JcononAspectDottoratoComponent
    },
    'P:jconon_application:aspect_diversamente_abile' : {
      model: Application,
      showcomponent: JcononAspectDiversmenteAbileComponent
    },
    'P:jconon_application:aspect_tempi_aggiuntivi' : {
      model: Application,
      showcomponent: JcononAspectTempiAggiuntiviComponent
    },
    'P:jconon_application:aspect_conoscenza_lingua_italiana' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_conoscenza_lingua_italiana',
        name: 'fl_conoscenza_lingua_italiana',
        required: true,
        label: 'label.jconon_application.fl_conoscenza_lingua_italiana'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_conoscenza_inglese_informatica' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_conoscenza_inglese_informatica',
        name: 'fl_conoscenza_inglese_informatica',
        required: true,
        label: 'label.jconon_application.fl_conoscenza_inglese_informatica'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_esperienza' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_esperienza',
        name: 'fl_esperienza',
        required: true,
        label: 'label.jconon_application.fl_esperienza'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_altre_borse_studio' : {
      model: Application,
      showcomponent: JcononAspectAltreBorseStudioComponent
    },
    'P:jconon_application:aspect_condizione_esclusione' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_condizione_esclusione',
        name: 'fl_condizione_esclusione',
        required: true,
        label: 'label.jconon_application.fl_condizione_esclusione'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_area_scientifica' : {
      model: Application,
      showcomponent: JcononAspectAreaScientificaComponent
    },
    'P:jconon_application:aspect_area_scientifica_not_required' : {
      model: Application,
      params: {
        isRequired: false
      },
      showcomponent: JcononAspectAreaScientificaComponent
    },
    'P:jconon_application:aspect_settore_scientifico_tecnologico' : {
      model: Application,
      showcomponent: JcononAspectSettoreScientificoTecnologicoComponent
    },
    'P:jconon_application:aspect_settore_scientifico_tecnologico_not_required' : {
      model: Application,
      params: {
        isRequired: false
      },
      showcomponent: JcononAspectSettoreScientificoTecnologicoComponent
    },
    'P:jconon_application:aspect_inquadramento' : {
      model: Application,
      showcomponent: JcononAspectInquadramentoComponent
    },
    'P:jconon_application:aspect_struttura_appartenenza' : {
      model: Application,
      showcomponent: JcononAspectStrutturaAppartenenzaComponent
    },
    'P:jconon_application:aspect_h_index' : {
      model: Application,
      showcomponent: JcononAspectHIndexComponent
    },
    'P:jconon_application:aspect_servizio_altra_attivita' : {
      model: Application,
      showcomponent: JcononAspectServizioAltraAttivitaComponent
    },
    'P:jconon_application:aspect_conoscenza_informatica_avanzata' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_conoscenza_informatica_avanzata',
        name: 'fl_conoscenza_informatica_avanzata',
        required: true,
        label: 'label.jconon_application.fl_conoscenza_informatica_avanzata'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_possesso_cittadinanza_italiana' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_possesso_cittadinanza_italiana',
        name: 'fl_possesso_cittadinanza_italiana',
        required: true,
        label: 'label.jconon_application.fl_possesso_cittadinanza_italiana'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_possesso_cittadinanza' : {
      model: Application,
      showcomponent: JcononAspectPossessoCittadinanzaComponent
    },
    'P:jconon_application:aspect_categorie_riservatarie_art1' : {
      model: Application,
      showcomponent: JcononAspectCategorieRiservatarieArt1Component
    },
    'P:jconon_application:aspect_categorie_riservatarie_art18' : {
      model: Application,
      showcomponent: JcononAspectCategorieRiservatarieArt18Component
    },
    'P:jconon_application:aspect_lista_disoccupazione_art1' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_lista_disoccupazione_art1',
        name: 'fl_lista_disoccupazione_art1',
        required: true,
        label: 'label.jconon_application.fl_lista_disoccupazione_art1'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_lista_disoccupazione_art18' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_lista_disoccupazione_art18',
        name: 'fl_lista_disoccupazione_art18',
        required: true,
        label: 'label.jconon_application.fl_lista_disoccupazione_art18'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_patente_guida' : {
      model: Application,
      showcomponent: JcononAspectPatenteGuidaComponent
    },
    'P:jconon_application:aspect_atto_interruttivo_anzianita' : {
      model: Application,
      showcomponent: JcononAspectAttoInterruttivoAnzianitaComponent
    },
    'P:jconon_application:aspect_titolo_preferenza_posti' : {
      model: Application,
      showcomponent: JcononAspectTitoloPreferenzaPostiComponent
    },
    'P:jconon_application:aspect_conoscenza_lingue' : {
      model: Application,
      showcomponent: JcononAspectConoscenzaLingueComponent
    },
    'P:jconon_application:aspect_sede' : {
      model: Application,
      showcomponent: JcononAspectSedeComponent
    },










    'P:jconon_application:aspect_dichiarazione_1' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_dichiarazione_1',
        name: 'fl_dichiarazione_1',
        required: false,
        label: 'label.jconon_application.fl_dichiarazione_1'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_dichiarazione_2' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_dichiarazione_2',
        name: 'fl_dichiarazione_2',
        required: false,
        label: 'label.jconon_application.fl_dichiarazione_2'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_dichiarazione_3' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_dichiarazione_3',
        name: 'fl_dichiarazione_3',
        required: true,
        label: 'label.jconon_application.fl_dichiarazione_3'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_dichiarazione_4' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_dichiarazione_4',
        name: 'fl_dichiarazione_4',
        required: true,
        label: 'label.jconon_application.fl_dichiarazione_4'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_residenza_generica' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_residenza_generica',
        name: 'fl_residenza_generica',
        required: true,
        label: 'label.jconon_application.fl_residenza_generica'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    }
  };

  static getModel(first: string, second: string): any {
    return (ObjectType.classes[first] || ObjectType.classes[second]).model;
  }

  static getComponent(selector: string): any {
    var instance = ObjectType.classes[selector];
    if (instance && instance.showcomponent)
      return instance.showcomponent;
    return JcononAttachmentShowComponent;
  }

  static getParams(selector: string): any {
    var instance = ObjectType.classes[selector];
    if (instance && instance.params)
      return instance.params;
    return undefined;
  }

}
