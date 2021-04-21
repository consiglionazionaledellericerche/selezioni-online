import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Input, SimpleChanges} from '@angular/core';
import {CommonListComponent} from '../../common/controller/common-list.component';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup} from '@angular/forms';
import {NavigationService} from '../../core/navigation.service';
import { Attachment } from './attachment.model';
import {TranslateService} from '@ngx-translate/core';
import {ChildrenService} from './children.service';
import {catchError, map, switchMap} from 'rxjs/operators';
import {ConfigService} from '../config.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ErrorObservable} from 'rxjs-compat/observable/ErrorObservable';
import {ApiMessageService, MessageType} from '../api-message.service';
import { ObjectTypeService } from '../object-type.service';
import { Observable, of } from 'rxjs';
import { DocumentService } from '../document/document.service';
import { CmisObject } from '../../common/model/cmisobject.model';
import { ManageDocumentComponent } from '../document/manage-document.component';
import { Document } from '../../common/model/document.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'children-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
  `
    <!-- List -->
    <app-list-layout [loading]="loading" [items]="items" [page]="getPage()"
                     [count]="count" [page_offset]="service.getPageOffset()" (onChangePage)="onChangePage($event)">
      <li *ngFor="let item of items" [ngClass]="listItemClasses()">
        <app-list-item-document [item]="item" (onDelete)="onDelete(item.getId())" (onEdit)="onEdit(item)">
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
                     private httpClient: HttpClient,
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
  
  public onDelete(objectId: string) {
    this.documentService.deleteDocument(objectId).subscribe((result) => {
      this.translateService.get('message.document.delete.success').subscribe((label) => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, label);
      });
      this.loadList();
    });
  }

  public onEdit(cmisObject: CmisObject) {
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

    const endpoint = '/rest/content?nodeRef=' + key;

    return this.configService.getGateway().pipe(switchMap((gateway) => {

      return this.httpClient.get(gateway + endpoint, {responseType: 'blob'}).pipe(map( (res) => {

        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove(); // remove the element

        return res;
      }),catchError((responseError: HttpErrorResponse) => {

        this.apiMessageService.onApiMessage.error('Immpossibile scaricare il file allegato');

        return ErrorObservable.create(responseError);
      }),);
    })).subscribe( () => {});
  }

}
