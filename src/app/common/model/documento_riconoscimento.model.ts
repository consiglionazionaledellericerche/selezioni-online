import { Document } from './document.model';
import {JsonProperty, JsonObject} from 'json2typescript';

@JsonObject("DocumentoRiconoscimento")
export class DocumentoRiconoscimento extends Document{
    @JsonProperty('jconon_documento_riconoscimento:numero')
    public numero: string;
    @JsonProperty('jconon_documento_riconoscimento:tipologia')
    public tipologia: string;
    @JsonProperty('jconon_documento_riconoscimento:emittente')
    public emittente: string;
    @JsonProperty('jconon_documento_riconoscimento:data_scadenza')
    public data_scadenza: Date;
    constructor() {
        super();
        this.numero = undefined;
        this.tipologia = undefined;
        this.emittente = undefined;
        this.data_scadenza = undefined;
    }
}
