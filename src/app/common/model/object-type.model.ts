import { Document } from './document.model';
import { Folder } from './folder.model';
import { Application } from '../../core/application/application.model'
import { Call } from '../../core/call/call.model'


import { Attachment } from './attachment.model';
import { DocumentoRiconoscimento } from './documento_riconoscimento.model'
import { User } from '../../auth/model/user.model';

export class ObjectType {
    
  public static classes = {
    'cmis:document': Document,
    'cmis:folder': Folder,
    'cm:person': User,
    'F:jconon_call:folder': Call,
    'F:jconon_call_tind:folder': Call,
    'F:jconon_call_tind:folder_concorsi_pubblici': Call,
    'F:jconon_call_tind:folder_reclutamento_speciale': Call,
    'F:jconon_call_tind:folder_categorie_protette': Call,
    'F:jconon_call_tdet:folder': Call,
    'F:jconon_call_bstd:folder': Call,
    'F:jconon_call_aric:folder': Call,
    'F:jconon_call_mobility:folder': Call,
    'F:jconon_call_mobility_open:folder': Call,
    'F:jconon_call_director:folder': Call,
    'F:jconon_call_tind:folder_tirocini_categorie_protette': Call,
    'F:jconon_call_tind:manifestazione_interesse': Call,
    'F:jconon_call_employees:folder': Call,
    'F:jconon_application:folder': Application,
  
    'D:jconon_dic_sost:attachment': Attachment,
    'D:jconon_documento_riconoscimento:attachment': DocumentoRiconoscimento
    
  };
}
  