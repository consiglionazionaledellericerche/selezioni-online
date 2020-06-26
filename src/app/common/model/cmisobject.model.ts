import {AllowableAction} from './allowableaction.enum';
import {JsonProperty, JsonObject} from 'json2typescript';

@JsonObject("CmisObject")
export abstract class CmisObject {
  @JsonProperty('cmis:objectId')
  protected objectId: string;
  @JsonProperty('cmis:name')
  protected name: string;
  @JsonProperty('cmis:description')
  protected description: string;
  @JsonProperty('cm:title', null, true)
  protected title: string;
  @JsonProperty('cmis:objectTypeId')
  protected objectTypeId: string;
  @JsonProperty('cmis:baseTypeId')
  protected baseTypeId: string;
  @JsonProperty('cmis:createdBy')
  protected createdBy: string;
  @JsonProperty('cmis:creationDate')
  protected creationDate: Date;
  @JsonProperty('cmis:lastModifiedBy')
  protected lastModifiedBy: string;
  @JsonProperty('cmis:lastModificationDate')
  protected lastModificationDate: Date;
  @JsonProperty('cmis:secondaryObjectTypeIds')
  protected secondaryObjectTypeIds: string[];

  public allowableActions: AllowableAction[];

  constructor() {
    this.objectId = undefined;
    this.name = undefined;
    this.title = undefined;
    this.description = undefined;
    this.objectTypeId = undefined;
    this.baseTypeId = undefined;
    this.createdBy = undefined;
    this.creationDate = undefined;
    this.lastModifiedBy = undefined;
    this.lastModificationDate = undefined;
    this.secondaryObjectTypeIds = undefined;
  }

  public getObjectId(): string {
    return this.objectId;
  }

  public getObjectTypeId(): string {
    return this.objectTypeId;
  }

  public getId(): string {
    return this.objectId;
  }

  public referenceValue() {
    return this.getObjectId();
  }

  public hasId() {
    return this.objectId !== undefined && this.objectId !== null;
  }

  public toTableRow() {
    return null;
  }

  public setAllowableActions(allowableActions: string[]) {
    this.allowableActions = [];
    if (allowableActions) {
      allowableActions.forEach(allowableAction => {
        this.allowableActions.push(AllowableAction[allowableAction]);
      });
    }
  }

  public hasAllowableActions(allowableAction: AllowableAction) {
    return this.allowableActions.includes(allowableAction);
  }

}
