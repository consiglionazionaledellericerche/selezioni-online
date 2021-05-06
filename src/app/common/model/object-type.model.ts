import { Document } from './document.model';
import { Folder } from './folder.model';
import { Application } from '../../core/application/application.model'
import { Call } from '../../core/call/call.model'

import { Attachment } from './attachment.model';
import { DocumentoRiconoscimento } from './documento_riconoscimento.model'
import { User } from '../../auth/model/user.model';

export class ObjectType {
  public static defaultAspect: string[] = [
    'P:jconon_attachment:generic_document', 
    'P:cm:titled'
  ];  
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
      model: Attachment,
      aspect: ObjectType.defaultAspect
    },
    'D:jconon_documento_riconoscimento:attachment': {
      model: DocumentoRiconoscimento,
      aspect: ObjectType.defaultAspect
    },
    'D:jconon_attachment:call_it' : {
      model: Attachment
    },
    'D:cvelement:contratto_lavoro_cnr' : {
      model: Attachment,
      aspect: [
        'P:cm:titled',
        'P:cvelement:commonDalAlIncorso', 
        'P:cvelement:commonSedeCNR',
        'P:cvelement:commonProfilo'
      ]
    }
  };

  static createInstance(cmisType: string, cmisBaseType: string): { new (): any; } {
    return this.getModel(cmisType, cmisBaseType);
  }

  static getModel(first: string, second: string): any {
    return (ObjectType.classes[first] || ObjectType.classes[second]).model;
  }

  static getAspect(cmisType: string): string[] {
    let objectType = ObjectType.classes[cmisType];
    if (objectType) {
      return objectType.aspect || ObjectType.defaultAspect;
    }    
    return ObjectType.defaultAspect;
  }
}
