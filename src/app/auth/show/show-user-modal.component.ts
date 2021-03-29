import {Component, Input, TemplateRef, OnInit} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { User } from '../model/user.model';
import { ConfigService } from '../../core/config.service';
import { switchMap, map, catchError} from 'rxjs/operators';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { SpringError } from '../../common/model/spring-error.model';
import {ApiMessageService, MessageType} from '../../core/api-message.service';
import {throwError as observableThrowError, of as observableOf, Observable} from 'rxjs';
import { Helpers } from '../../common/helpers/helpers';

@Component({
  selector: 'app-show-user-modal',
  template: `
    
    <span  class="mr-1">
      <span *ngIf="label">{{ label | translate }}</span>
      <button class="btn btn-link pt-0 pb-1 pl-1" (click)="openModal(template)"><span class="font-weight-bold">{{username}}</span></button>
    </span>

    <ng-template #template>
      <div class="modal-header">
        <h4 class="modal-title pull-left text-primary"><i class="fa fa-info-circle"></i> {{'property' | translate}}</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body vh80">
        <table class="table table-striped table-hover table-borderless">  
          <tbody>
            <tr><td class="font-weight-bolder">{{'user.username' | translate}}</td><td>{{user.userName}}</td></tr>
            <tr><td class="font-weight-bolder">{{'user.firstname' | translate}}</td><td>{{user.firstName}}</td></tr>
            <tr><td class="font-weight-bolder">{{'user.lastname' | translate}}</td><td>{{user.lastName}}</td></tr>
            <tr *ngIf="user.matricola"><td class="font-weight-bolder">{{'user.matricola' | translate}}</td><td>{{user.matricola}}</td></tr>
            <tr *ngIf="user.mobile"><td class="font-weight-bolder">{{'user.mobile' | translate}}</td><td><a href="tel:{{user.mobile}}">{{user.mobile}}</a></td></tr>
            <tr><td class="font-weight-bolder">{{'user.email' | translate}}</td><td><a href="mailto:{{user.getEmail()}}">{{user.getEmail()}}</a></td></tr>
            <tr *ngIf="user.emailesterno"><td class="font-weight-bolder">{{'user.emailesterno' | translate}}</td><td><a href="mailto:{{user.emailesterno}}">{{user.emailesterno}}</a></td></tr>
            <tr><td class="font-weight-bolder">{{'user.codicefiscale' | translate}}</td><td>{{user.codicefiscale}}</td></tr>
          </tbody>
        </table>
        <div *ngIf="groups && user.groups && user.groups.length > 0">
          <h4>{{'user.groups'| translate}}</h4>
          <ol>
            <li *ngFor="let group of user.groups">
              <app-show-group-members-modal
                [groupName]="group.itemName"  
                [displayName]="group.displayName">
              </app-show-group-members-modal>
            </li>
          </ol>
        </div>  
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-primary" (click)="modalRef.hide()">{{'close' | translate}}</button>
      </div>
    </ng-template>
  `
})
export class ShowUserModalComponent {

  @Input() label;
  @Input() username;
  @Input() groups: string = 'false';
  user: User;
  modalRef: BsModalRef;
  constructor(private modalService: BsModalService,               
              private httpClient: HttpClient,
              protected apiMessageService: ApiMessageService,
              private configService: ConfigService) {}
   
  openModal(template: TemplateRef<any>) {
    this.getUser().subscribe((user) => {
      this.user = Helpers.buildInstance(user, User);
      this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'modal-md' }));      
    })
    return false;
  }

  getUser(): Observable<User> {
    var params = new HttpParams()
          .set('url', 'service/cnr/person/person/' + this.username);
    if (this.groups == 'true'){
      params = params.set('groups', this.groups);
    }
    return this.configService.getProxy()
    .pipe(
      switchMap((proxy) => {
        return this.httpClient.get<User>(proxy, {params: params})
          .pipe(
            map((user) => {
                return user;
            }),
            catchError( (httpErrorResponse: HttpErrorResponse) => {
              const springError = new SpringError(httpErrorResponse);
              this.apiMessageService.sendMessage(MessageType.ERROR,  springError.getRestErrorMessage());
              return observableThrowError(springError);
            })
          );
      })
    );
  }
}
