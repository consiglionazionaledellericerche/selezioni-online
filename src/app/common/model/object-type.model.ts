import { Document } from './document.model';
import { Folder } from './folder.model';
import { Application } from '../../core/application/application.model'
import { Call } from '../../core/call/call.model'

import { Attachment } from './attachment.model';
import { DocumentoRiconoscimento } from './documento_riconoscimento.model'
import { User } from '../../auth/model/user.model';

import { Validators } from '@angular/forms';
import { Helpers } from '../helpers/helpers';

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
import { JcononAspectSanzioneDisciplinareComponent } from '../../dynamic/aspect/sanzione-disciplinare.component';
import { JcononAspectSpecializzazioneComponent } from '../../dynamic/aspect/specializzazione.component';
import { JcononAspectEnteCompartoRicercaAppartenenzaComponent } from '../../dynamic/aspect/ente-comparto-ricerca-appartenenza.component';
import { JcononAspectEnteCompartoUniversitaAppartenenzaComponent } from '../../dynamic/aspect/ente-comparto-universita-appartenenza.component';
import { JcononAspectEnteAppartenenzaComponent } from '../../dynamic/aspect/ente-appartenenza.component';
import { JcononAspectSingleFieldComponent } from '../../dynamic/aspect/single-field.component';
import { JcononAspectAreaTecnicaComponent } from '../../dynamic/aspect/area-tecnica.component';
import { JcononAspectToggleWithSingleFieldComponent } from '../../dynamic/aspect/toggle-with-single-field.component';
import { JcononAspectContrattoTDConcorsoComponent } from '../../dynamic/aspect/contratto-td-concorso.component';
import { JcononAspectIdoneoPrecedentiGraduatorieComponent } from '../../dynamic/aspect/idoneo-precedenti-graduatorie.component';
import { JcononAspectAbilitazioneProfessioneIngegnereComponent } from '../../dynamic/aspect/abilitazione-professione-ingegnere.component';
import { JcononAspectUlterioreLaureaComponent } from '../../dynamic/aspect/ulteriore-laurea.component';
import { JcononAspectUlterioreDottoratoComponent } from '../../dynamic/aspect/ulteriore-dottorato.component';

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
      showcomponent: JcononAffixDichiarazioniComponent,
      params: {
        callProperty : "elenco_aspects"
      }
    },
    'affix_tabDatiCNR' : {
      model: Application,
      showcomponent: JcononAffixDichiarazioniComponent,
      params: {
        callProperty : "elenco_aspects_sezione_cnr"
      }
    },
    'affix_tabUlterioriDati' : {
      model: Application,
      showcomponent: JcononAffixDichiarazioniComponent,
      params: {
        callProperty : "elenco_aspects_ulteriori_dati"
      }
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
    'P:jconon_application:aspect_sanzione_disciplinare' : {
      model: Application,
      showcomponent: JcononAspectSanzioneDisciplinareComponent
    },
    'P:jconon_application:aspect_specializzazione' : {
      model: Application,
      showcomponent: JcononAspectSpecializzazioneComponent
    },
    'P:jconon_application:aspect_nulla_osta' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_nulla_osta',
        name: 'fl_nulla_osta',
        required: false,
        label: 'label.jconon_application.fl_nulla_osta'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_nulla_osta_obbligatorio' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_nulla_osta',
        name: 'fl_nulla_osta',
        required: true,
        label: 'label.jconon_application.fl_nulla_osta'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_superato_periodo_prova' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_superato_periodo_prova',
        name: 'fl_superato_periodo_prova',
        required: true,
        label: 'label.jconon_application.fl_superato_periodo_prova'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_ente_comparto_ricerca_appartenenza' : {
      model: Application,
      showcomponent: JcononAspectEnteCompartoRicercaAppartenenzaComponent
    },
    'P:jconon_application:aspect_ente_comparto_universita_appartenenza' : {
      model: Application,
      showcomponent: JcononAspectEnteCompartoUniversitaAppartenenzaComponent
    },
    'P:jconon_application:aspect_ente_appartenenza' : {
      model: Application,
      showcomponent: JcononAspectEnteAppartenenzaComponent
    },
    'P:jconon_application:aspect_anzianita_servizio' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:anzianita_servizio',
        name: 'anzianita_servizio',
        required: true,
        label: 'label.jconon_application.anzianita_servizio',
        type: 'date',
        class: 'col-md-4'
      },
      showcomponent: JcononAspectSingleFieldComponent
    },
    'P:jconon_application:aspect_anzianita_profilo' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:anzianita_profilo',
        name: 'anzianita_profilo',
        required: true,
        label: 'label.jconon_application.anzianita_profilo',
        type: 'date',
        class: 'col-md-4'
      },
      showcomponent: JcononAspectSingleFieldComponent
    },
    'P:jconon_application:aspect_anzianita_livello' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:anzianita_livello',
        name: 'anzianita_livello',
        required: true,
        label: 'label.jconon_application.anzianita_livello',
        type: 'date',
        class: 'col-md-4'
      },
      showcomponent: JcononAspectSingleFieldComponent
    },
    'P:jconon_application:aspect_area_amministrativa' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_area_amministrativa',
        name: 'fl_area_amministrativa',
        required: false,
        label: 'label.jconon_application.fl_area_amministrativa'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_area_tecnica' : {
      model: Application,
      showcomponent: JcononAspectAreaTecnicaComponent
    },
    'P:jconon_application:aspect_precedente_servizio_cnr' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_precedente_servizio_cnr',
        toggleName: 'fl_precedente_servizio_cnr',
        toggleLabel: 'label.jconon_application.fl_precedente_servizio_cnr',
        textPropertyName: 'jconon_application:profilo_precedente_servizio_cnr',
        textName: 'profilo_precedente_servizio_cnr',
        textLabel: 'label.jconon_application.profilo_precedente_servizio_cnr'
      },
      showcomponent: JcononAspectToggleWithSingleFieldComponent
    },
    'P:jconon_application:aspect_precedente_servizio_altre_amministrazioni' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_precedente_servizio_altre_amministrazioni',
        toggleName: 'fl_precedente_servizio_altre_amministrazioni',
        toggleLabel: 'label.jconon_application.fl_precedente_servizio_altre_amministrazioni',
        textPropertyName: 'jconon_application:profilo_precedente_servizio_altre_amministrazioni',
        textName: 'profilo_precedente_servizio_altre_amministrazioni',
        textLabel: 'label.jconon_application.profilo_precedente_servizio_altre_amministrazioni'
      },
      showcomponent: JcononAspectToggleWithSingleFieldComponent
    },
    'P:jconon_application:aspect_alta_qualificazione' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_alta_qualificazione',
        toggleName: 'fl_alta_qualificazione',
        requiredTrue: true,
        textType: "textarea",
        toggleLabel: 'label.jconon_application.fl_alta_qualificazione',
        textPropertyName: 'jconon_application:alta_qualificazione',
        textName: 'alta_qualificazione',
        textLabel: 'label.jconon_application.alta_qualificazione'
      },
      showcomponent: JcononAspectToggleWithSingleFieldComponent
    },
    'P:jconon_application:aspect_esperienza_gestionale' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_esperienza_gestionale',
        toggleName: 'fl_esperienza_gestionale',
        requiredTrue: true,
        textType: "textarea",
        toggleLabel: 'label.jconon_application.fl_esperienza_gestionale',
        textPropertyName: 'jconon_application:esperienza_gestionale',
        textName: 'esperienza_gestionale',
        textLabel: 'label.jconon_application.esperienza_gestionale'
      },
      showcomponent: JcononAspectToggleWithSingleFieldComponent
    },
    'P:jconon_application:aspect_incompatibilita' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_incompatibilita',
        name: 'fl_incompatibilita',
        required: true,
        label: 'label.jconon_application.fl_incompatibilita'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_obblighi_militari' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_obblighi_militari',
        toggleName: 'fl_obblighi_militari',
        toggle: false,
        required: true,
        toggleLabel: 'label.jconon_application.fl_obblighi_militari',
        textPropertyName: 'jconon_application:obblighi_militari_motivazione',
        textName: 'obblighi_militari_motivazione',
        textLabel: 'label.jconon_application.obblighi_militari_motivazione'
      },
      showcomponent: JcononAspectToggleWithSingleFieldComponent
    },
    'P:jconon_application:aspect_licenziamento_disciplinare' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_licenziamento_disciplinare',
        toggleName: 'fl_licenziamento_disciplinare',
        toggle: false,
        required: true,
        textType: "textarea",
        toggleLabel: 'label.jconon_application.fl_licenziamento_disciplinare',
        textPropertyName: 'jconon_application:motivazione_licenziamento_disciplinare',
        textName: 'motivazione_licenziamento_disciplinare',
        textLabel: 'label.jconon_application.motivazione_licenziamento_disciplinare'
      },
      showcomponent: JcononAspectToggleWithSingleFieldComponent
    },
    'P:jconon_application:aspect_vincolo_sede' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_vincolo_sede',
        name: 'fl_vincolo_sede',
        required: true,
        label: 'label.jconon_application.fl_vincolo_sede'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_contratto_altra_pa' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_contratto_altra_pa',
        name: 'fl_contratto_altra_pa',
        required: true,
        label: 'label.jconon_application.fl_contratto_altra_pa'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_contratto_td_concorso' : {
      model: Application,
      showcomponent: JcononAspectContrattoTDConcorsoComponent
    },
    'P:jconon_application:aspect_idoneo_precedenti_graduatorie' : {
      model: Application,
      showcomponent: JcononAspectIdoneoPrecedentiGraduatorieComponent
    },
    'P:jconon_application:aspect_servizi_collocamento' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_dichiarazione_servizi_collocamento',
        name: 'fl_dichiarazione_servizi_collocamento',
        required: true,
        label: 'label.jconon_application.fl_dichiarazione_servizi_collocamento'
      },
      showcomponent: JcononAspectsDichiarazioneComponent
    },
    'P:jconon_application:aspect_motivazioni_candidatura' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:motivazioni_candidatura',
        name: 'motivazioni_candidatura',
        required: true,
        label: 'label.jconon_application.motivazioni_candidatura',
        type: 'textarea',
        validators: [Validators.required, Helpers.maxlengthValidator(1800, {maxlength1800: true})]
      },
      showcomponent: JcononAspectSingleFieldComponent
    },
    'P:jconon_application:aspect_abilitazione_professione_ingegnere' : {
      model: Application,
      showcomponent: JcononAspectAbilitazioneProfessioneIngegnereComponent
    },
    'P:jconon_application:aspect_abilitazione_professione_forense' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_abilitazione_professione_forense',
        toggleName: 'fl_abilitazione_professione_forense',
        toggleLabel: 'label.jconon_application.fl_abilitazione_professione_forense',
        textType: 'date',
        textClass: 'col-md-4',
        textPropertyName: 'jconon_application:data_abilitazione_professione_forense',
        textName: 'data_abilitazione_professione_forense',
        textLabel: 'label.jconon_application.data_abilitazione_professione_forense',
        validators: [Validators.requiredTrue]
      },
      showcomponent: JcononAspectToggleWithSingleFieldComponent
    },
    'P:jconon_application:aspect_area_territoriale' : {
      model: Application,
      params: {
        aspectName: 'P:jconon_application:aspect_area_territoriale',
        propertyName: 'jconon_application:fl_area_territoriale',
        toggleName: 'fl_area_territoriale',
        toggleLabel: 'label.jconon_application.fl_area_territoriale',
        textType: 'select',
        textPropertyName: 'jconon_application:area_territoriale',
        textName: 'area_territoriale',
        textLabel: 'label.jconon_application.area_territoriale',
        validators: [Validators.requiredTrue]
      },
      showcomponent: JcononAspectToggleWithSingleFieldComponent
    },
    'P:jconon_application:aspect_profili' : {
      model: Application,
      params: {
        aspectName: 'P:jconon_application:aspect_profili',
        propertyName: 'jconon_application:profilo_componente',
        name: 'profilo_componente',
        required: true,
        label: 'label.jconon_application.profilo_componente',
        type: 'select'
      },
      showcomponent: JcononAspectSingleFieldComponent
    },
    'P:jconon_application:aspect_ulteriore_laurea' : {
      model: Application,
      showcomponent: JcononAspectUlterioreLaureaComponent
    },
    'P:jconon_application:aspect_ulteriore_dottorato' : {
      model: Application,
      showcomponent: JcononAspectUlterioreDottoratoComponent
    },
    'P:jconon_application:aspect_altri_assegni' : {
      model: Application,
      params: {
        propertyName: 'jconon_application:fl_altri_assegni',
        toggleName: 'fl_altri_assegni',
        toggleLabel: 'label.jconon_application.fl_altri_assegni',
        textType: 'textarea',
        textPropertyName: 'jconon_application:testo_altri_assegni',
        textName: 'testo_altri_assegni',
        textLabel: 'label.jconon_application.testo_altri_assegni',
      },
      showcomponent: JcononAspectToggleWithSingleFieldComponent
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
