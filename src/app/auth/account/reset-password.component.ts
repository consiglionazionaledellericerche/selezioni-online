import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';
import { ConfigService } from '../../core/config.service';

/**
 * Nuova password dal link della mail di recupero (?userid=&pin=): POST /openapi/v1/user/reset-password.
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [TranslatePipe, RouterLink, FormsModule],
  template: `
    <div class="row justify-content-center my-5">
      <div class="col-lg-6">
        <div class="card shadow-sm rounded p-4">
          <h1 class="h3 text-primary">{{ 'account.reset.title' | translate }}</h1>
          @if (done) {
            <div class="alert alert-success">{{ 'account.reset.done' | translate }}</div>
            <a class="btn btn-primary" routerLink="/auth/signin">{{ 'account.login' | translate }}</a>
          } @else if (!userid || !pin) {
            <div class="alert alert-danger mb-0">{{ 'account.reset.invalid_link' | translate }}</div>
          } @else {
            <p class="text-secondary">{{ 'account.reset.info' | translate:{ value: userid } }}</p>
            <form (ngSubmit)="submit()">
              <div class="form-group">
                <label for="rp-pwd" class="active">{{ 'account.reset.password' | translate }} *</label>
                <input id="rp-pwd" type="password" class="form-control" name="password" autocomplete="new-password"
                       [(ngModel)]="password" required minlength="8">
                <small class="form-text">{{ 'account.reset.rules' | translate }}</small>
              </div>
              <div class="form-group">
                <label for="rp-confirm" class="active">{{ 'account.reset.confirm' | translate }} *</label>
                <input id="rp-confirm" type="password" class="form-control" name="confirm" autocomplete="new-password"
                       [(ngModel)]="confirm" required [class.is-invalid]="confirm && confirm !== password">
                @if (confirm && confirm !== password) {
                  <div class="invalid-feedback d-block">{{ 'account.reset.mismatch' | translate }}</div>
                }
              </div>
              @if (error) {
                <div class="alert alert-danger">{{ error }}</div>
              }
              <button type="submit" class="btn btn-primary" [disabled]="busy || password.length < 8 || password !== confirm">
                {{ 'account.reset.submit' | translate }}
              </button>
            </form>
          }
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  public userid: string;
  public pin: string;
  public password = '';
  public confirm = '';
  public busy = false;
  public done = false;
  public error: string;

  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  ngOnInit(): void {
    this.userid = this.route.snapshot.queryParamMap.get('userid');
    this.pin = this.route.snapshot.queryParamMap.get('pin');
  }

  submit(): void {
    if (this.password.length < 8 || this.password !== this.confirm) {
      return;
    }
    this.busy = true;
    this.error = null;
    this.configService.getApiBase().pipe(
      switchMap(apiBase => this.http.post(apiBase + '/v1/user/reset-password',
        { userid: this.userid, pin: this.pin, password: this.password }))
    ).subscribe(() => {
      this.busy = false;
      this.done = true;
    }, error => {
      this.busy = false;
      this.error = error?.error?.message || 'Errore';
    });
  }
}
