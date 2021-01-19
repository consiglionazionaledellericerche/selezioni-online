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
