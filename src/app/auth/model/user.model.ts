import { JsonProperty, JsonObject } from 'json2typescript';
import { Base } from '../../common/model/base.model';
import { BooleanConverter } from '../../common/helpers/BooleanConverter';
import { ISODateConverter } from '../../common/helpers/ISODateConverter';

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
  public static GESTORI_BORSE_DI_STUDIO : string = 'GESTORI_BORSE_DI_STUDIO';
  /** Tipo dei bandi di borse di studio: il gruppo GESTORI_BORSE_DI_STUDIO è RdP di tutti (CallService). */
  public static CALL_TYPE_BORSE_DI_STUDIO : string = 'F:jconon_call_bstd:folder';

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
  @JsonProperty("enabled", null, true)
  public enabled: boolean = undefined;
  @JsonProperty("password", null, true)
  public password: string = undefined;
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
  @JsonProperty("sesso", null, true)
  public sesso: string = undefined;
  @JsonProperty("statoestero", null, true)
  public statoestero: string = undefined;
  @JsonProperty("straniero", BooleanConverter, true)
  public straniero: boolean = undefined;
  @JsonProperty("dataDiNascita", ISODateConverter, true)
  public dataDiNascita: Date = undefined;
  
  public getId(): string {
    return this.userName;
  }

  public getType(): string {
    return 'cm:person';
  }

  public getBaseType(): string {
    return this.getType();
  }

  public hasId(): boolean {
    return this.userName !== undefined;
  }

  setAllowableActions(allowableActions: string[]) {}
  
  public canDelete(): boolean {
    return false;
  }

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
    return (this.groups || []).filter((group) =>
      group.itemName === groupName || group.itemName === 'GROUP_' + groupName
    ).length !== 0;
  }

  /**
   * RdP del bando: membro del gruppo RDP, di CONCORSI_RDP, amministratore oppure, per i bandi di borse di
   * studio, membro di GESTORI_BORSE_DI_STUDIO (il backend non mette più in sessione i gruppi GROUP_RDP_*
   * ereditati dal gruppo dei gestori).
   */
  public isRdP(groupName: string, callTypeId?: string): boolean {
    return this.isMemberOf(groupName) || this.isMemberOf(Group.CONCORSI_RDP) ||
      (callTypeId === Group.CALL_TYPE_BORSE_DI_STUDIO && this.isMemberOf(Group.GESTORI_BORSE_DI_STUDIO)) ||
      !!(this.capabilities && this.capabilities.isAdmin);
  }

  public isCommissione(groupName: string): boolean {
    return this.isMemberOf(groupName) || this.isMemberOf(Group.CONCORSI_COMMISSIONE) || !!(this.capabilities && this.capabilities.isAdmin);
  }

  public isConcorsi(): boolean {
    return this.isMemberOf(Group.CONCORSI);
  }
}
