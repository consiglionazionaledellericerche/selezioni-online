import { Document } from '../../common/model/document.model';
import {JsonProperty, JsonObject} from 'json2typescript';

@JsonObject("Attachment")
export class Attachment extends Document {
  @JsonProperty('jconon_protocollo:numero', null, true)
  public numeroProtocollo: string;
  @JsonProperty('jconon_protocollo:data', null, true)
  public dataProtocollo: Date;
  @JsonProperty('jconon_attachment:originalFileName', null, true)
  public originalFileName: string;

  constructor() {
      super();
      this.numeroProtocollo = undefined;
      this.dataProtocollo = undefined;
      this.originalFileName = undefined;
  }
}
