import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Input, SimpleChanges} from '@angular/core';
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
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalConfirmComponent } from '../../shared/tags/wizard/modal-confirm.component';

@Component({
  selector: 'children-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
  `
    <!-- List -->
    <app-list-layout [loading]="loading" [items]="items" [page]="getPage()"
                     [count]="count" [page_offset]="service.getPageOffset()" (onChangePage)="onChangePage($event)">
      <li *ngFor="let item of items" [ngClass]="listItemClasses()">
        <app-list-item-document [item]="item" (onDelete)="onDelete(item)" (onEdit)="onEdit(item)">
          <div class="col-sm-12 font-weight-bolder"> 
            <a 
              class="pl-0 pb-0 text-truncate d-block"
              href="javascript:"
              (click)="getBlob(item.objectId, item.name)">
              <i class="fa fa-fw {{ item.getMimeTypeIcon() }}"></i> {{ item.name }}
            </a>
          </div>
          <div class="col-sm-12 pt-1">{{item.objectTypeId | translate}}</div> 
          <div class="col-sm-12 pt-1">
            <span class="font-weight-bold">{{item.getFileSize()}}</span>
            <span *ngIf="show_date">{{'document.last_modified'| translate:{value: item.lastModificationDate| date:'dd/MM/yyyy HH:mm'} }}</span>
          </div> 
        </app-list-item-document>
      </li>
    </app-list-layout>
  `
})
export class ChildrenListComponent extends CommonListComponent<Attachment> implements OnInit {

  public items: Attachment[] = [];

  @Input() parentId: string;
  @Input() typeId: string;
  @Input() queryName: string;
  @Input() show_date: string;
  bsModalRef: BsModalRef;

  public constructor(public service: ChildrenService,
                     protected documentService: DocumentService,  
                     private modalService: BsModalService,                   
                     protected configService: ConfigService,
                     protected apiMessageService: ApiMessageService,
                     protected route: ActivatedRoute,
                     protected objectTypeService: ObjectTypeService,
                     protected router: Router,
                     protected changeDetector: ChangeDetectorRef,
                     protected navigationService: NavigationService,
                     protected translateService: TranslateService) {
    super(service, route, router, changeDetector, navigationService);
  }

  public setItems(items: Attachment[]) {
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

}
