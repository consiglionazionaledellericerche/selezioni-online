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
