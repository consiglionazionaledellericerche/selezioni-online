import { AllowableAction } from '../../common/model/allowableaction.enum';
import { DocumentPermissionsModalComponent } from '../document/actions/document-permissions-modal.component';
import { SendAttachmentModalComponent } from '../document/actions/send-attachment-modal.component';
import { ApplicationOperationsService } from '../application/application-operations.service';
import { ManageCallService } from '../call/manage-call.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonListComponent} from '../../common/controller/common-list.component';
import { ActivatedRoute, Router} from '@angular/router';
import { FormControl, FormGroup} from '@angular/forms';
import { NavigationService} from '../../core/navigation.service';
import { Attachment } from './attachment.model';
import { TranslateService} from '@ngx-translate/core';
import { ChildrenService} from './children.service';
import { switchMap} from 'rxjs/operators';
import { ConfigService} from '../config.service';
import { ApiMessageService, MessageType} from '../api-message.service';
import { ObjectTypeService } from '../object-type.service';
import { Observable, of } from 'rxjs';
import { DocumentService } from '../document/document.service';
import { CmisObject } from '../../common/model/cmisobject.model';
import { ManageDocumentComponent } from '../document/manage-document.component';
import { Document } from '../../common/model/document.model';
import { ModalRef, ModalService } from '../../shared/modal/modal.service';
import { ModalConfirmComponent } from '../../shared/tags/wizard/modal-confirm.component';

@Component({
  standalone: false,
  selector: 'children-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
  `
    <!-- List -->
    <app-list-layout [loading]="loading" [items]="items" [page]="getPage()"
                     [count]="count" [page_offset]="service.getPageOffset()" (onChangePage)="onChangePage($event)">
      <li *ngFor="let item of items" class="doc-item">
        <app-list-item-document [item]="item" (onDelete)="onDelete(item)" (onEdit)="onEdit(item)">
          <div class="doc-file">
            <svg class="icon doc-icon" [class]="'icon doc-icon ' + iconClass(item)" aria-hidden="true">
              <use [attr.href]="'/bootstrap-italia/dist/svg/sprites.svg#' + icon(item)"></use>
            </svg>
            <div class="doc-text">
              <button type="button" class="btn btn-link p-0 doc-name text-start" (click)="getBlob(item.objectId, item.name)">
                {{ item.name }}
              </button>
              <div class="doc-type">
                {{ item.objectTypeId | translate }}<ng-container *ngIf="item.title && item.title !== item.name"> · {{ item.title }}</ng-container>
              </div>
              <div class="doc-meta">
                <span>{{ format(item) }} · {{ item.getFileSize() }}</span>
                <span *ngIf="show_date && validDate(item.lastModificationDate)">
                  <svg class="icon icon-xs" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-calendar"></use></svg>
                  {{ item.lastModificationDate | date:'dd/MM/yyyy HH:mm' }}
                </span>
                <span *ngIf="version(item)">{{ 'layout.attachments.version' | translate }} {{ version(item) }}</span>
              </div>
              <!-- azioni degli allegati del bando (come nel legacy: aggiorna, autorizzazioni, spedisci allegato) -->
              <div *ngIf="callId" class="doc-macro">
                <button *ngIf="canReplace(item)" type="button" class="btn btn-link btn-sm p-0" (click)="replaceInput.click()">
                  <svg class="icon icon-xs icon-primary me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-upload"></use></svg>{{'document.replace' | translate}}
                </button>
                <input #replaceInput type="file" class="d-none" (change)="replace(item, $event)">
                <button *ngIf="canAcl(item)" type="button" class="btn btn-link btn-sm p-0" (click)="permissions(item)">
                  <svg class="icon icon-xs icon-primary me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-locked"></use></svg>{{'document.permissions.title' | translate}}
                </button>
                <button type="button" class="btn btn-link btn-sm p-0" (click)="sendToCandidates(item)">
                  <svg class="icon icon-xs icon-primary me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-mail"></use></svg>{{'document.send.title' | translate}}
                </button>
              </div>
              <div *ngIf="macroCallId" class="doc-macro">
                <button type="button" class="btn btn-link btn-sm p-0" (click)="linkToChildren(item)">
                  <svg class="icon icon-xs icon-primary me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-link"></use></svg>{{'call_manage.attachments.link_children' | translate}}
                </button>
                <button type="button" class="btn btn-link btn-sm p-0" (click)="copyToChildren(item)">
                  <svg class="icon icon-xs icon-primary me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-copy"></use></svg>{{'call_manage.attachments.copy_children' | translate}}
                </button>
              </div>
            </div>
          </div>
        </app-list-item-document>
      </li>
    </app-list-layout>
  `,
  styles: [`
    .doc-item { list-style: none; border-bottom: 1px solid #e3e8ee; }
    .doc-item:last-child { border-bottom: 0; }
    .doc-file { display: flex; gap: .9rem; align-items: flex-start; min-width: 0; }
    .doc-icon { flex-shrink: 0; width: 2.25rem; height: 2.25rem; margin-top: .1rem; }
    .doc-text { min-width: 0; }
    .doc-name { font-weight: 600; font-size: 1rem; word-break: break-word; }
    .doc-type { font-size: .85rem; color: #455b71; margin-top: .1rem; }
    .doc-meta { display: flex; flex-wrap: wrap; gap: .25rem 1.25rem; margin-top: .3rem; font-size: .85rem; color: #5d7083; }
    .doc-meta .icon { width: .9rem; height: .9rem; fill: #5d7083; vertical-align: -2px; }
    .doc-macro { display: flex; flex-wrap: wrap; gap: .25rem 1.25rem; margin-top: .4rem; }
    .icon-pdf { fill: #d9364f; } .icon-doc { fill: var(--app-primary); } .icon-sheet { fill: #008758; } .icon-other { fill: #5d7083; }
  `]
})
export class ChildrenListComponent extends CommonListComponent<Attachment> implements OnInit {

  public items: Attachment[] = [];

  @Input() parentId: string;
  @Input() typeId: string;
  @Input() queryName: string;
  @Input() show_date: string;
  /** Se valorizzato (id del bando) mostra le azioni sugli allegati del bando: aggiorna, autorizzazioni, spedisci. */
  @Input() callId: string;
  /** Se valorizzato (id del macro-bando) mostra le azioni per collegare o copiare l'allegato nei bandi figli. */
  @Input() macroCallId: string;
  bsModalRef: ModalRef;

  public constructor(public service: ChildrenService,
                     protected documentService: DocumentService,  
                     private modalService: ModalService,                   
                     protected configService: ConfigService,
                     protected apiMessageService: ApiMessageService,
                     protected route: ActivatedRoute,
                     protected objectTypeService: ObjectTypeService,
                     protected router: Router,
                     protected changeDetector: ChangeDetectorRef,
                     private operationsService: ApplicationOperationsService,
                     protected navigationService: NavigationService,
                     protected translateService: TranslateService,
                     protected manageCallService: ManageCallService) {
    super(service, route, router, changeDetector, navigationService);
  }

  /** Numero di documenti dell'elenco (per tipologia), dopo ogni caricamento. */
  @Output() counted = new EventEmitter<number>();

  public setItems(items: Attachment[]) {
    setTimeout(() => this.counted.emit(this.count));
    this.items = items;
  }

  public getItems(): Attachment[] {
    return this.items;
  }

  public beforeOnInit(): Observable<any> {
    if (this.queryName === undefined && this.typeId !== undefined) {
      return this.objectTypeService.type(this.typeId).pipe(switchMap((result) => {
        this.queryName = result.queryName;
        return of(null);
      }));
    } else {
      return of(null);
    } 
  }
  
  public onDelete(cmisObject: CmisObject) {
    this.translateService.get('message.document.delete.confirm', {value : cmisObject.name}).subscribe((label) => {
      const initialState = {
        'body': label
      };
      this.bsModalRef = this.modalService.show(ModalConfirmComponent, Object.assign({initialState}, { animated: true, class: 'modal-dialog-centered' }));
      this.bsModalRef.content.confirm.subscribe(() => {
        this.documentService.deleteDocument(cmisObject.getObjectId()).subscribe((result) => {
          this.translateService.get('message.document.delete.success').subscribe((label) => {
            this.apiMessageService.sendMessage(MessageType.SUCCESS, label);
          });
          this.loadList();
        });  
      });      
    });
  }

  public linkToChildren(item: Attachment) {
    this.manageCallService.linkAttachmentToChildren(this.macroCallId, item.getObjectId()).subscribe((result) => {
      this.translateService.get('call_manage.attachments.done', {value: result.count}).subscribe((label) => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, label);
      });
    });
  }

  public copyToChildren(item: Attachment) {
    this.manageCallService.copyAttachmentToChildren(this.macroCallId, item.getObjectId()).subscribe((result) => {
      this.translateService.get('call_manage.attachments.done', {value: result.count}).subscribe((label) => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, label);
      });
    });
  }

  canReplace(item: Attachment): boolean {
    return item.hasAllowableActions(AllowableAction.CAN_SET_CONTENT_STREAM) || item.canEdit();
  }

  canAcl(item: Attachment): boolean {
    return item.hasAllowableActions(AllowableAction.CAN_APPLY_ACL);
  }

  /** Aggiorna il contenuto dell'allegato (nuova versione), come "aggiorna" del legacy. */
  replace(item: Attachment, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    input.value = '';
    if (!file) {
      return;
    }
    this.operationsService.updateDocument(file, { 'cmis:objectId': item.objectId, 'cmis:objectTypeId': item.objectTypeId })
      .subscribe(() => {
        this.translateService.get('message.document.upload.success', { value: file.name })
          .subscribe(label => this.apiMessageService.sendMessage(MessageType.SUCCESS, label));
        this.loadList();
      });
  }

  permissions(item: Attachment): void {
    this.modalService.show(DocumentPermissionsModalComponent,
      { initialState: { objectId: item.objectId, name: item.name }, class: 'modal-lg' });
  }

  sendToCandidates(item: Attachment): void {
    this.modalService.show(SendAttachmentModalComponent,
      { initialState: { callId: this.callId, objectId: item.objectId, name: item.name }, class: 'modal-dialog-centered' });
  }

  public onEdit(cmisObject: Document) {
    const initialState = {
      entity: cmisObject,
      typeId: cmisObject.objectTypeId
    };

    this.bsModalRef = this.modalService.show(ManageDocumentComponent, Object.assign({initialState}, { animated: true, class: 'modal-lg' }));
    this.bsModalRef.content.event.subscribe((document: Document) => {
      this.translateService.get('message.document.upload.success', {value: document.name}).subscribe((label) => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, label);
      });
      this.loadList();
    });

  }

  public buildFilterForm(): FormGroup {
    return new FormGroup({
      parentId: new FormControl(this.parentId),
      fetchObject: new FormControl(true),
      type:  new FormControl(this.queryName)
    });
  }

  getBlob(key: string, filename: string) {
    this.service.getBlob('/rest/content?nodeRef=' + key, filename);
  }

  protected isScrollTopOnPageChange(): boolean {
    return false;
  }

  private mime(item: Attachment): string {
    return String((item as any).contentStreamMimeType || '').toLowerCase();
  }

  private signed(item: Attachment): boolean {
    return /\.p7m$/i.test(String(item.name || '')) || this.mime(item).includes('pkcs7');
  }

  /** Icona del formato del file. */
  icon(item: Attachment): string {
    const mime = this.mime(item);
    if (this.signed(item)) { return 'it-file-signed'; }
    if (mime.includes('pdf')) { return 'it-file-pdf'; }
    if (mime.includes('word') || mime.includes('opendocument.text')) { return 'it-file-docx'; }
    if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) { return 'it-file-xlsx'; }
    if (mime.includes('zip') || mime.includes('compressed')) { return 'it-file-compressed'; }
    if (mime.startsWith('image/')) { return 'it-file-image'; }
    return 'it-file';
  }

  iconClass(item: Attachment): string {
    const icon = this.icon(item);
    return icon === 'it-file-pdf' || icon === 'it-file-signed' ? 'icon-pdf'
      : icon === 'it-file-docx' ? 'icon-doc' : icon === 'it-file-xlsx' ? 'icon-sheet' : 'icon-other';
  }

  /** Formato del file (estensione o tipo MIME). */
  format(item: Attachment): string {
    const name = String(item.name || '');
    const ext = name.includes('.') ? name.split('.').pop() : '';
    return (ext || this.mime(item).split('/').pop() || '').toUpperCase();
  }

  version(item: Attachment): string {
    const label = (item as any).versionLabel;
    return label && label !== '1.0' ? label : '';
  }

  /** Data presente e valida. */
  validDate(value: any): boolean {
    return !!value && !isNaN(new Date(value).getTime());
  }
}
