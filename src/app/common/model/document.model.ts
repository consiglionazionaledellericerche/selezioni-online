import { CmisObject } from './cmisobject.model';
import {JsonProperty, JsonObject} from 'json2typescript';

@JsonObject("Document")
export class Document extends CmisObject{
  @JsonProperty('cmis:isImmutable')
  protected isImmutable: boolean;
  @JsonProperty('cmis:isLatestVersion')
  protected isLatestVersion: boolean;
  @JsonProperty('cmis:isMajorVersion')
  protected isMajorVersion: boolean;
  @JsonProperty('cmis:isLatestMajorVersion')
  protected isLatestMajorVersion: boolean;
  @JsonProperty('cmis:versionLabel')
  protected versionLabel: string;
  @JsonProperty('cmis:isVersionSeriesCheckedOut')
  protected isVersionSeriesCheckedOut: boolean;
  @JsonProperty('cmis:versionSeriesCheckedOutBy')
  protected versionSeriesCheckedOutBy: string;
  @JsonProperty('cmis:versionSeriesCheckedOutId')
  protected versionSeriesCheckedOutId: string;
  @JsonProperty('cmis:checkinComment')
  protected checkinComment: string;
  @JsonProperty('cmis:contentStreamLength')
  protected contentStreamLength: number;
  @JsonProperty('cmis:contentStreamMimeType')
  protected contentStreamMimeType: string;
  @JsonProperty('cmis:contentStreamFileName')
  protected contentStreamFileName: string;
  @JsonProperty('cmis:contentStreamId')
  protected contentStreamId: string;
  @JsonProperty('cmis:isPrivateWorkingCopy')
  protected isPrivateWorkingCopy: boolean;

  private MIMETYPE = {
    'application/pdf' : 'fa-file-pdf-o text-danger',
    'application/msword' : 'fa-file-word-o text-primary',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'fa-file-word-o text-primary',
    'application/ms-word' : 'fa-file-word-o text-primary',
    'application/gzip' : 'fa-file-archive-o text-info',
    'image/png' : 'fa-file-image-o text-primary'
  }

  constructor() {
    super();
    this.isImmutable = undefined;
    this.isLatestVersion = undefined;
    this.isMajorVersion = undefined;
    this.isLatestMajorVersion = undefined;
    this.versionLabel = undefined;
    this.isVersionSeriesCheckedOut = undefined;
    this.versionSeriesCheckedOutBy = undefined;
    this.versionSeriesCheckedOutId = undefined;
    this.checkinComment = undefined;
    this.contentStreamLength = undefined;
    this.contentStreamMimeType = undefined;
    this.contentStreamFileName = undefined;
    this.contentStreamId = undefined;
    this.isPrivateWorkingCopy = undefined;
  }

  public getMimeTypeIcon(): string {
    if (this.MIMETYPE[this.contentStreamMimeType]) {
      return this.MIMETYPE[this.contentStreamMimeType];
    }
    return 'fa-file-o';
  }

  public getFileSize(): string {
    var suffix = ["bytes", "Kb", "Mb", "Gb", "Tb", "Pb"], tier = 0;
    var bytes = this.contentStreamLength;
    while (bytes >= 1024) {
      bytes = bytes / 1024;
      tier++;
    }
    return Math.round(bytes * 10) / 10 + " " + suffix[tier];
  }
}
