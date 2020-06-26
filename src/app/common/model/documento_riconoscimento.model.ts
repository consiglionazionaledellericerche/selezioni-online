import { Document } from './document.model';
import {JsonProperty, JsonObject} from 'json2typescript';

@JsonObject("DocumentoRiconoscimento")
export class DocumentoRiconoscimento extends Document{
    @JsonProperty('jconon_documento_riconoscimento:numero')
    protected numero: string;
    @JsonProperty('jconon_documento_riconoscimento:tipologia')
    protected tipologia: string;
    @JsonProperty('jconon_documento_riconoscimento:emittente')
    protected emittente: string;
    @JsonProperty('jconon_documento_riconoscimento:data_scadenza')
    protected data_scadenza: Date;
    constructor() {
        super();
        this.numero = undefined;
        this.tipologia = undefined;
        this.emittente = undefined;
        this.data_scadenza = undefined;
    }
}
