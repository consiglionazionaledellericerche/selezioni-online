import {AllowableAction} from './allowableaction.enum';
import {JsonProperty, JsonObject} from 'json2typescript';
import { Base } from './base.model';
import { ISODateConverter } from '../helpers/ISODateConverter';

@JsonObject("CmisObject")
export abstract class CmisObject implements Base{
  @JsonProperty('cmis:objectId')
  public objectId: string;
  @JsonProperty('cmis:name')
  public name: string;
  @JsonProperty('cm:description')
  public description: string;
  @JsonProperty('cm:title')
  public title: string;
  @JsonProperty('cmis:objectTypeId')
  public objectTypeId: string;
  @JsonProperty('cmis:baseTypeId')
  public baseTypeId: string;
  @JsonProperty('cmis:createdBy')
  public createdBy: string;
  @JsonProperty('cmis:creationDate', ISODateConverter)
  public creationDate: Date;
  @JsonProperty('cmis:lastModifiedBy')
  public lastModifiedBy: string;
  @JsonProperty('cmis:lastModificationDate', ISODateConverter)
  public lastModificationDate: Date;
  @JsonProperty('cmis:secondaryObjectTypeIds')
  public secondaryObjectTypeIds: string[];
  @JsonProperty('aspect', String, true)
  public aspect: string[];

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
    this.aspect = undefined;
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

  public getType(): string {
    return this.objectTypeId;
  }

  public getBaseType(): string {
    return this.baseTypeId;
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

  canDelete(): boolean {
    return this.hasAllowableActions(AllowableAction.CAN_DELETE_OBJECT);
  }

  canEdit(): boolean {
    return this.hasAllowableActions(AllowableAction.CAN_UPDATE_PROPERTIES);
  }

}
