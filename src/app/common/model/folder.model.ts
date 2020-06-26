import { CmisObject } from './cmisobject.model';
import {JsonProperty, JsonObject} from 'json2typescript';

@JsonObject("Folder")
export class Folder extends CmisObject{
  @JsonProperty('cmis:parentId')
  protected parentId: string;
  @JsonProperty('cmis:allowedChildObjectTypeIds')
  protected allowedChildObjectTypeIds: string[];
  @JsonProperty('cmis:path')
  protected path: string;

  constructor() {
    super();
    this.parentId = undefined;
    this.allowedChildObjectTypeIds = undefined;
    this.path = undefined;
  }
}
