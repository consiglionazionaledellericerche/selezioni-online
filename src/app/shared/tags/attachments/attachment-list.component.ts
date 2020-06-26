
import {catchError, map, switchMap} from 'rxjs/operators';
import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Attachment} from '../../../common/model/attachment.model';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {CmisObject} from '../../../common/model/cmisobject.model';
import {ConfigService} from '../../../core/config.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ErrorObservable} from 'rxjs-compat/observable/ErrorObservable';
import {ApiMessageService} from '../../../core/api-message.service';

@Component({
  selector: 'app-attachment-list',
  template:
     `
    <app-show-layout *ngIf="initialized" [strong]='true' [label]="'attachments'">
      <div *ngIf="attachments" [ngStyle]="{'position': 'relative', 'top': '-4px'}">
        <span>
          <em> {{ attachmentText() }}</em>
        </span>
        <button class="btn btn-sm btn-light d-inline-block ml-3"
                data-toggle="tooltip" data-placement="top" title="Gestisci allegati"
                (click)="openModal(template)">
          <i class="fa fa-folder-open-o" aria-hidden="true"></i>
        </button>
      </div>

      <ng-template #template>
          <div class="modal-header">
            <h4 class="modal-title pull-left">Gestione allegati per {{ entity.getLabel() }}</h4>
            <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">

            <table class="table table-bordered">
              <thead class="thead-light">
              <tr class="">
                <th scope="col">Nome</th>
                <th scope="col">Descrizione</th>
                <th scope="col">Elimina</th>
              </tr>
              </thead>
              <tbody>

              <tr *ngFor="let attachment of attachments">
                <td> {{ attachment.filename }}

                  <button class="btn btn-link" (click)="getBlob(attachment.key, attachment.filename)">
                    <i class="fa fa-download" aria-hidden="true"></i>
                  </button>

                </td>
                <td>{{ attachment.description }}</td>
                <td class="text-center">
                  <button class="btn btn-outline-danger btn-xs pt-0 pb-0" (click)="onDelete(attachment.key)">
                    <i class="fa fa-trash" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
              </tbody>
            </table>

            <div class="card bg-light mt-5">
              <h5 class="d-inline-block p-3"><i class="fa fa-paperclip"></i> Aggiungi allegato</h5>

              <form *ngIf="attachmentForm" [formGroup]="attachmentForm" (ngSubmit)="onSubmit()">
                <app-control-attachment formControlName="file"></app-control-attachment>
                <app-control-text formControlName="descr"></app-control-text>
                <app-buttons-layout>
                  <app-button-save></app-button-save>
                </app-buttons-layout>
              </form>
            </div>

          </div>
       </ng-template>

    </app-show-layout>
    `,
  styles:
    [
    ]
})
export class AttachmentListComponent implements OnInit {

  @Input() entity: CmisObject;

  @Input() attachments: Attachment[];

  @Input() attachmentForm: FormGroup;

  @Output() attachmentFormSubmit = new EventEmitter<any>();

  @Output() attachmentDelete = new EventEmitter<string>();

  downloadPath;

  modalRef: BsModalRef;

  constructor(private modalService: BsModalService,
              private configService: ConfigService,
              protected apiMessageService: ApiMessageService,
              private httpClient: HttpClient) {}

  ngOnInit() {
    this.configService.getApiBase().subscribe((apiBase) => {
      this.downloadPath = apiBase + '/ace/v1/docs?key=';
    });
  }

  public initialized() {
    return this.downloadPath;
  }

  public attachmentText() {
    if (this.attachments.length === 0) {
      return 'Non sono presenti file allegati.';
    }
    if (this.attachments.length === 1) {
      return 'Presente 1 file allegato.';
    }
    return 'Presenti ' + this.attachments.length + ' files allegati.';
  }

  openModal(template: TemplateRef<any>) {
    const config = {
      class: 'modal-dialog-centered modal-lg'
    };
    this.modalRef = this.modalService.show(template, config);
  }

  onSubmit() {
    this.modalRef.hide();
    this.attachmentFormSubmit.emit();
  }

  onDelete(key: string) {
    this.modalRef.hide();
    this.attachmentDelete.emit(key);
  }

  getBlob(key: string, filename: string) {

    const endpoint = '/ace/v1/docs?key=' + key;

    return this.configService.getApiBase().pipe(switchMap((apiBase) => {

      return this.httpClient.get(apiBase + endpoint, {responseType: 'blob'}).pipe(map( (res) => {

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

