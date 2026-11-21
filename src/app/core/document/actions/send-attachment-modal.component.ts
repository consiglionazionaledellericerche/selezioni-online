import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';
import { ModalRef } from '../../../shared/modal/modal.service';
import { ConfigService } from '../../config.service';
import { ApiMessageService, MessageType } from '../../api-message.service';

/**
 * Spedisci allegato (come nel legacy): invia via PEC l'allegato del bando a tutti i candidati con domanda attiva,
 * all'indirizzo PEC (o email) indicato nella domanda.
 */
@Component({
  selector: 'app-send-attachment-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="modal-header">
      <h2 class="modal-title h5 no_toc">{{ 'document.send.title' | translate }}: {{ name }}</h2>
      <button type="button" class="btn-close" [attr.aria-label]="'layout.close' | translate" (click)="modalRef.hide()">
        <svg class="icon"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-close"></use></svg>
      </button>
    </div>
    <form [formGroup]="form" (ngSubmit)="send()">
      <div class="modal-body pt-3">
        <p class="small text-secondary">{{ 'document.send.info' | translate }}</p>
        <div class="form-group">
          <label for="sa-user" class="active">{{ 'communications.pec_user' | translate }} *</label>
          <input id="sa-user" class="form-control" formControlName="userNamePEC" autocomplete="username">
        </div>
        <div class="form-group">
          <label for="sa-pwd" class="active">{{ 'communications.pec_password' | translate }} *</label>
          <input id="sa-pwd" type="password" class="form-control" formControlName="passwordPEC" autocomplete="current-password">
        </div>
      </div>
      <div class="modal-footer d-flex justify-content-between">
        <button type="button" class="btn btn-outline-secondary" (click)="modalRef.hide()">{{ 'button.cancel' | translate }}</button>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || busy">{{ 'document.send.submit' | translate }}</button>
      </div>
    </form>
  `
})
export class SendAttachmentModalComponent implements OnInit {
  public callId: string;
  public objectId: string;
  public name: string;
  public form: FormGroup;
  public busy = false;

  public readonly modalRef = inject(ModalRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly apiMessageService = inject(ApiMessageService);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.form = this.formBuilder.group({ userNamePEC: ['', Validators.required], passwordPEC: ['', Validators.required] });
  }

  send(): void {
    this.busy = true;
    const params = new HttpParams().set('objectId', this.objectId)
      .set('userNamePEC', this.form.value.userNamePEC).set('passwordPEC', this.form.value.passwordPEC);
    this.configService.getApiBase().pipe(
      switchMap(apiBase => this.http.post<{ count: number }>(apiBase + '/v1/call/' + encodeURIComponent(this.callId) + '/attachments/send',
        params))
    ).subscribe(result => {
      this.busy = false;
      this.apiMessageService.sendMessage(MessageType.SUCCESS,
        this.translateService.instant('document.send.done', { value: result?.count ?? 0 }));
      this.modalRef.hide();
    }, error => {
      this.busy = false;
      this.apiMessageService.sendMessage(MessageType.ERROR, error?.error?.message || 'admin.error.generic');
    });
  }
}
