import {JsonProperty, JsonObject} from 'json2typescript';
import { Base } from '../../common/model/base.model';

@JsonObject("Capabilities")
export class Capabilities {
  constructor() {}
  @JsonProperty("isAdmin")
  public isAdmin: boolean = undefined;
  @JsonProperty("isGuest")
  public isGuest: boolean = undefined;
  @JsonProperty("isMutable")
  public isMutable: boolean = undefined;
}

@JsonObject("Group")
export class Group {
  constructor() {}
  public static CONCORSI : string = 'CONCORSI';
  public static CONCORSI_RDP : string = 'CONCORSI_RDP';
  public static CONCORSI_COMMISSIONE : string = 'CONCORSI_COMMISSIONE';

  @JsonProperty("itemName")
  public itemName: string = undefined;
  @JsonProperty("displayName")
  public displayName: string = undefined;
}

@JsonObject("User")
export class User implements Base{
  constructor() {}  
  @JsonProperty("userName")
  public userName: string = undefined;
  @JsonProperty("lastName")
  public lastName: string = undefined;
  @JsonProperty("firstName")
  public firstName: string = undefined;
  @JsonProperty("enabled")
  public enabled: boolean = undefined;
  @JsonProperty("codicefiscale", null, true)
  public codicefiscale: string = undefined;
  @JsonProperty("departmentNumber", null, true)
  public departmentNumber: string = undefined;
  @JsonProperty("matricola", null, true)
  public matricola: string = undefined;
  @JsonProperty("mobile", null, true)
  public mobile: string = undefined;
  @JsonProperty("email")
  public email: string = undefined;
  @JsonProperty("emailesterno", null, true)
  public emailesterno: string = undefined;
  @JsonProperty("emailcertificatoperpuk", null, true)
  public emailcertificatoperpuk: string = undefined;
  @JsonProperty("groups", null, true)
  public groups: Group[] = undefined;
  @JsonProperty("capabilities", null, true)
  public capabilities: Capabilities = undefined;
  @JsonProperty("organization", null, true)
  public organization: string = undefined;

  public getId(): string {
    return this.userName;
  }

  public hasId(): boolean {
    return this.userName !== undefined;
  }

  setAllowableActions(allowableActions: string[]) {}
  
  public getEmail(): string {
    if (this.email && this.email !== 'nomail') {
      return this.email;
    }
    return this.emailcertificatoperpuk;
  }
  
  public getIcon(): string {
    if (this.getSesso()) {
      if (this.getSesso() === 'M') {
        return 'fa-male';
      } else if (this.getSesso() === 'F') {
        return 'fa-female';
      } 
    }
    return 'fa-user-circle-o';
  }

  private getSesso(): string {
    if (this.codicefiscale) {
      return Number(this.codicefiscale.substring(9,11)) > 40 ? 'F' : 'M';
    }
  }

  public isMemberOf(groupName: string): boolean {
    return this.groups.filter((group) => {
      group.itemName === groupName || group.itemName === 'GROUP_' + groupName
    }).length !== 0;
  }

  public isRdP(groupName: string): boolean {
    return this.isMemberOf(groupName) || this.isMemberOf(Group.CONCORSI_RDP) || this.capabilities.isAdmin;
  }

  public isCommissione(groupName: string): boolean {
    return this.isMemberOf(groupName) || this.isMemberOf(Group.CONCORSI_COMMISSIONE) || this.capabilities.isAdmin;
  }

  public isConcorsi(): boolean {
    return this.isMemberOf(Group.CONCORSI);
  }
}
