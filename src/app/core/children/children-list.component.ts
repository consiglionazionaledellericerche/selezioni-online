import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Input, SimpleChanges} from '@angular/core';
import {CommonListComponent} from '../../common/controller/common-list.component';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup} from '@angular/forms';
import {NavigationService} from '../../core/navigation.service';
import { Attachment } from './attachment.model';
import {TranslateService} from '@ngx-translate/core';
import {ChildrenService} from './children.service';
import {catchError, map, switchMap} from 'rxjs/operators';
import {ConfigService} from '../config.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ErrorObservable} from 'rxjs-compat/observable/ErrorObservable';
import {ApiMessageService} from '../api-message.service';

@Component({
  selector: 'children-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
  `
    <!-- List -->
    <app-list-layout [loading]="loading" [items]="items" [page]="getPage()"
                     [count]="count" [page_offset]="service.getPageOffset()" (onChangePage)="onChangePage($event)">
      <li *ngFor="let item of items" [ngClass]="listItemClasses()">
        <app-list-item-document [item]="item" (onDelete)="onDelete(item.getId())">
          <div class="col-sm-12 font-weight-bold"> 
            <button 
              class="btn btn-link pl-0 pb-0 text-truncate"
              style="max-width: inherit;" 
              (click)="getBlob(item.objectId, item.name)">
              <i class="fa fa-fw {{ item.getMimeTypeIcon() }}"></i> {{ item.name }}
            </button>
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

  @Input() parentId: String;
  @Input() type: String;
  @Input() show_date: String;

  public constructor(public service: ChildrenService,
                     protected configService: ConfigService,
                     protected apiMessageService: ApiMessageService,
                     private httpClient: HttpClient,
                     protected route: ActivatedRoute,
                     protected changeDetector: ChangeDetectorRef,
                     protected navigationService: NavigationService,
                     protected translateService: TranslateService) {
    super(service, route, changeDetector, navigationService);
  }

  public setItems(items: Attachment[]) {
    this.items = items;
  }

  public getItems(): Attachment[] {
    return this.items;
  }

  public buildFilterForm(): FormGroup {
    return new FormGroup({
      parentId: new FormControl(this.parentId),
      fetchObject: new FormControl(true),
      type:  new FormControl(this.type)
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
