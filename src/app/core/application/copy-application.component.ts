import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalRef } from '../../shared/modal/modal.service';
import { TranslateService } from '@ngx-translate/core';
import { Application } from './application.model';
import { ApplicationService } from './application.service';
import { CallService } from '../call/call.service';
import { Call } from '../call/call.model';
import { ApiMessageService, MessageType } from '../api-message.service';

/**
 * Duplica una domanda in un altro bando attivo dello stesso tipo
 * (equivalente dell'azione "duplica" di cool-jconon).
 */
@Component({
  standalone: false,
  selector: 'copy-application',
  template: `
    <div class="modal-header border-bottom">
      <h3 class="modal-title float-start text-primary pb-2 text-truncate">
        <i class="fa fa-copy"></i> {{'application.copy_dialog.title' | translate}}
      </h3>
      <button type="button" class="btn p-0 ms-2 float-end" aria-label="Close" (click)="modalRef.hide()">
        <svg class="icon"><use href="/assets/bootstrap-italia/svg/sprites.svg#it-close-circle"></use></svg>
      </button>
    </div>
    <div class="modal-body">
      <p class="small" innerHtml="{{'application.copy_dialog.info' | translate:{codice: application.call?.codice} }}"></p>
      <div class="form-group mb-3">
        <input type="text" class="form-control" [(ngModel)]="filter"
               [placeholder]="'application.copy_dialog.filter' | translate">
      </div>
      <app-layout-wait [loaded]="calls"></app-layout-wait>
      <div *ngIf="calls && filtered().length === 0" class="alert alert-info" translate>application.copy_dialog.empty</div>
      <div class="it-list-wrapper" *ngIf="calls">
        <ul class="it-list">
          <li *ngFor="let call of filtered()">
            <a href="javascript:" (click)="selected = call" [ngClass]="{'active bg-light': selected === call}">
              <div class="it-right-zone">
                <span class="text">
                  <strong>{{call.codice}}</strong>
                  <em *ngIf="call.sede"> - {{call.sede}}</em>
                  <br>
                  <small>{{'call.data_fine_invio_domande' | translate}}: {{call.data_fine_invio_domande | date:'dd/MM/yyyy HH:mm'}}</small>
                </span>
                <svg *ngIf="selected === call" class="icon icon-primary"><use href="/assets/bootstrap-italia/svg/sprites.svg#it-check"></use></svg>
              </div>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-secondary" (click)="modalRef.hide()" translate>button.cancel</button>
      <button class="btn btn-primary" [disabled]="!selected || copying" (click)="onCopy()">
        {{'application.copy_dialog.confirm' | translate}}
      </button>
    </div>
  `
})
export class CopyApplicationComponent implements OnInit {

  public application: Application;
  public calls: Call[];
  public selected: Call;
  public filter = '';
  public copying = false;

  @Output() copied = new EventEmitter<{callId: string, applicationId: string}>();

  constructor(
    public modalRef: ModalRef,
    private applicationService: ApplicationService,
    private callService: CallService,
    private apiMessageService: ApiMessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    const call = this.application.call;
    this.callService.getAll({
      page: 0,
      offset: 100,
      filterType: 'active',
      type: call.objectTypeId.substring(2)
    }).subscribe((calls) => {
      this.calls = calls.filter(c => c.getObjectId() !== call.getObjectId());
    }, () => {
      this.calls = [];
    });
  }

  public filtered(): Call[] {
    const term = (this.filter || '').toLowerCase();
    return (this.calls || []).filter(c =>
      !term ||
      (c.codice || '').toLowerCase().indexOf(term) !== -1 ||
      (c.sede || '').toLowerCase().indexOf(term) !== -1
    );
  }

  public onCopy() {
    this.copying = true;
    this.applicationService.pasteApplication(this.application.getObjectId(), this.selected.getObjectId())
      .subscribe((applicationId) => {
        this.apiMessageService.sendMessage(MessageType.SUCCESS, 'application.copy_dialog.success');
        this.modalRef.hide();
        this.copied.emit({callId: this.selected.getObjectId(), applicationId: applicationId});
      }, () => {
        this.copying = false;
      });
  }
}
