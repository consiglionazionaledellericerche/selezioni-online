import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';
import { ConfigService } from '../../core/config.service';

/**
 * Attivazione dell'utenza dal link della mail di registrazione (?userid=&pin=): conferma con
 * GET /openapi/v1/user/confirm-account e invito ad accedere.
 */
@Component({
  selector: 'app-confirm-account',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  template: `
    <div class="row justify-content-center my-5">
      <div class="col-lg-7">
        <div class="card shadow-sm rounded p-4 text-center">
          @if (state === 'loading') {
            <div class="progress-spinner progress-spinner-active mx-auto mb-3"><span class="visually-hidden">…</span></div>
            <p class="mb-0">{{ 'account.confirm.loading' | translate }}</p>
          } @else if (state === 'done') {
            <svg class="icon icon-xl icon-success mx-auto mb-3"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-check-circle"></use></svg>
            <h1 class="h3 text-success">{{ 'account.confirm.done_title' | translate }}</h1>
            <p>{{ 'account.confirm.done' | translate:{ value: userName } }}</p>
            <a class="btn btn-primary" routerLink="/auth/signin">{{ 'account.login' | translate }}</a>
          } @else {
            <svg class="icon icon-xl icon-danger mx-auto mb-3"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-error"></use></svg>
            <h1 class="h3 text-danger">{{ 'account.confirm.error_title' | translate }}</h1>
            <p>{{ error || ('account.confirm.error' | translate) }}</p>
            <a class="btn btn-outline-primary" routerLink="/auth/signin">{{ 'account.login' | translate }}</a>
          }
        </div>
      </div>
    </div>
  `
})
export class ConfirmAccountComponent implements OnInit {
  public state: 'loading' | 'done' | 'error' = 'loading';
  public userName: string;
  public error: string;

  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const userid = params.get('userid');
    const pin = params.get('pin');
    if (!userid || !pin) {
      this.state = 'error';
      return;
    }
    this.configService.getApiBase().pipe(
      switchMap(apiBase => this.http.get<{ userName: string }>(apiBase + '/v1/user/confirm-account',
        { params: new HttpParams().set('userid', userid).set('pin', pin) }))
    ).subscribe(result => {
      this.userName = result?.userName || userid;
      this.state = 'done';
    }, error => {
      this.error = error?.error?.message;
      this.state = 'error';
    });
  }
}
