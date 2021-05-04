import {Component, Input, TemplateRef, OnInit} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { User } from '../model/user.model';
import { ConfigService } from '../../core/config.service';
import { switchMap, map, catchError} from 'rxjs/operators';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { SpringError } from '../../common/model/spring-error.model';
import {ApiMessageService, MessageType} from '../../core/api-message.service';
import {throwError as observableThrowError, of as observableOf, Observable} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-show-group-members-modal',
  template: `

    <button class="btn btn-link pt-0 pb-1 pl-1 col-sm-12" (click)="openModal(template)">
      <div class="font-weight-bold text-truncate text-left">{{displayName}}</div>
    </button>

    <ng-template #template>
      <div class="modal-header">
        <h4 class="modal-title pull-left text-primary"><i class="fa fa-info-circle"></i> {{displayName | translate}}</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body vh80">
          <ol>
            <li *ngFor="let user of users">
              <app-show-user-modal [username]="user"></app-show-user-modal>
            </li>
          </ol>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-primary" (click)="modalRef.hide()">{{'close' | translate}}</button>
      </div>
    </ng-template>
  `
})
export class ShowGroupMembersModalComponent {

  @Input() groupName;
  @Input() displayName;
  
  protected users: string[] = undefined;

  modalRef: BsModalRef;
  constructor(private modalService: BsModalService,               
              private httpClient: HttpClient,
              protected apiMessageService: ApiMessageService,
              public translateService: TranslateService,
              private configService: ConfigService) {}
   
  openModal(template: TemplateRef<any>) {
    this.getUsers().subscribe((users) => {
      this.users = users;
      this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'modal-md' }));      
    }) 
    return false;
  }

  getUsers(): Observable<string[]> {
    const params = new HttpParams()
          .set('url', 'service/cnr/groups/' + this.groupName + '/members');
    return this.configService.getProxy()
    .pipe(
      switchMap((proxy) => {
        return this.httpClient.get<string[]>(proxy, {params: params})
          .pipe(
            map((result: any) => {
                return result.people;
            }),
            catchError( (httpErrorResponse: HttpErrorResponse) => {
              const springError = new SpringError(httpErrorResponse, this.translateService);
              this.apiMessageService.sendMessage(MessageType.ERROR,  springError.getRestErrorMessage());
              return observableThrowError(springError);
            })
          );
      })
    );
  }
}
