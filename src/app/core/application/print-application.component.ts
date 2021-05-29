import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Document } from '../../common/model/document.model';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiMessageService, MessageType } from '../api-message.service';
import { DocumentService } from '../document/document.service';
import { SearchService } from '../search/search.service';
import { ApplicationService } from './application.service';
import { Application } from './application.model';

@Component({
  selector: 'print-application',
  template: `
      <div class="modal-header border-bottom">
        <h3 *ngIf="!history" class="modal-title pull-left text-primary pb-2 text-truncate"><i class="fa fa-info-circle"></i> {{'application.print.application'|translate}}</h3>
        <h3 *ngIf="history" class="modal-title pull-left text-success pb-2 text-truncate"><i class="fa fa-list-ol"></i> {{'document.history.title'|translate}}</h3>
        <button *ngIf="history" type="button" class="close pull-right" aria-label="Close" (click)="history = false">
          <svg class="icon">
            <use xlink:href="/assets/vendor/sprite.svg#it-restore"></use>
          </svg>
        </button>
        <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
          <svg class="icon">
            <use xlink:href="/assets/vendor/sprite.svg#it-close-circle"></use>
          </svg>
        </button>
      </div>
      <div class="modal-body" [ngClass]="{'overflow-body': history}">
          <span *ngIf="lastPrint && !history" innerHtml="{{'message.application.print.last'| translate:{versionLabel: lastPrint.versionLabel, lastModificationDate: lastPrint.lastModificationDate| date:'dd/MM/yyyy HH:mm'} }}"></span>
          <span *ngIf="!lastPrint && !history" innerHtml="{{'message.application.print.new'| translate }}"></span>
          <div *ngIf="history" class="it-list-wrapper">
            <app-layout-wait [loaded]="historyDocument"></app-layout-wait>
            <ul class="it-list">
              <li *ngFor="let version of historyDocument" class="pb-2">
                <a>  
                  <div class="d-flex align-items-start">
                    <small class="text-monospace" translate>document.history.version</small>
                    <span (click)="onDownload(version.objectId, version.name)" class="badge ml-2 h6 d-table c-pointer" [ngClass]="{'badge-primary': version.isMajorVersion, 'badge-secondary': !version.isMajorVersion}">{{version.versionLabel}}</span>
                    <small class="text-monospace ml-2">{{'document.history.detail'| translate:{contentStreamLength: version.getFileSize(), lastModificationDate: version.lastModificationDate| date:'dd/MM/yyyy HH:mm'} }}</small>
                  </div>
                </a>  
              </li>
            </ul>
          </div>
      </div>
      <div *ngIf="!history" class="modal-footer shadow-lg">
        <div class="d-flex justify-content-between w-100">
          <div *ngIf="lastPrint">
            <button class="btn btn-danger btn-block rounded"
              (click)="onDownload(lastPrint.objectId, lastPrint.name)" translate>application.print.download <i class="fa fa-file-pdf-o" aria-hidden="true"></i> 
            </button>
          </div>
          <div *ngIf="lastPrint" class="pl-2">
            <button class="btn btn-success btn-block rounded"
              (click)="onHistory()" translate>application.print.old <i class="fa fa-list-ol" aria-hidden="true"></i> 
            </button>
          </div>
          <div *ngIf="application.isProvvisoria()" class="ml-auto pl-2">
            <button class="btn btn-outline-secondary btn-block rounded"
                  (click)="onPrint()" translate>application.print.new <i class="fa fa-plus-circle" aria-hidden="true"></i>
            </button>
          </div>  
        </div>  
      </div>
  `,
  styles: [
    '.overflow-body {max-height: calc(100vh - 80px) !important;overflow: auto;}'
  ]
})
export class PrintApplicationComponent implements OnInit{
  public application: Application;
  public lastPrint: Document;
  public history: boolean = false;
  public historyDocument: Document[];

  constructor(
    public modalRef: BsModalRef,
    protected router: Router,
    protected route: ActivatedRoute,
    public searchService: SearchService,
    public documentService: DocumentService,
    public applicationService: ApplicationService,
    public translateService: TranslateService,
    public apiMessageService: ApiMessageService
  ) {

  }
  ngOnInit(): void {
    this.searchService.execute('select cmis:name, cmis:objectTypeId, cmis:baseTypeId, cmis:objectId, cmis:lastModificationDate, cmis:versionLabel ' +
      'from jconon_attachment:application where IN_FOLDER (\''+ this.application.objectId + '\')').subscribe((result) => {
        if (result.length === 1) {
          this.lastPrint = result[0] as Document;
        }
    });
  }

  onDownload(objectId: string, name: string) {
    this.documentService.getDocument(objectId, name).subscribe(res => {
      if (res && res.status && res.status === 401) {
          this.router.navigateByUrl('auth/signin', { state: { redirect: this.route.snapshot['_routerState'].url } });
      }
    });
  }

  onPrint() {
    this.modalRef.hide();
    this.applicationService.printApplication(this.application.objectId).subscribe(res => {
      this.translateService.get('message.application.print.new').subscribe((label) => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, label);
      });
    });
  }

  onHistory() {
    this.history = true;
    this.documentService.history(this.lastPrint.objectId).subscribe((res: Document[]) => {
      this.historyDocument = res;
    });
  }

}
