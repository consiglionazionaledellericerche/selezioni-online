import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { switchMap } from 'rxjs/operators';
import { ConfigService } from '../../config.service';

/**
 * Download di un file prodotto dal backend (es. estrazioni Excel inviate per email):
 * /download?nodeRef=...&deleteAfterDownload=true. Il file viene scaricato con l'utente autenticato.
 */
@Component({
  selector: 'app-download',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="row justify-content-center my-5">
      <div class="col-lg-6">
        <div class="card shadow-sm rounded p-4 text-center">
          @switch (state) {
            @case ('loading') {
              <div class="d-flex justify-content-center mb-3"><div class="progress-spinner progress-spinner-active"></div></div>
              <h1 class="h4">{{ 'download.loading' | translate }}</h1>
            }
            @case ('done') {
              <svg class="icon icon-xl icon-success mx-auto mb-3"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-check-circle"></use></svg>
              <h1 class="h4">{{ 'download.done' | translate }}</h1>
              <p class="text-secondary mb-0">{{ fileName }}</p>
            }
            @case ('error') {
              <svg class="icon icon-xl icon-danger mx-auto mb-3"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-error"></use></svg>
              <h1 class="h4">{{ 'download.error' | translate }}</h1>
              <p class="text-secondary">{{ 'download.error_info' | translate }}</p>
            }
          }
          <a routerLink="/" class="btn btn-outline-primary btn-sm mt-3 align-self-center">{{ 'layout.home' | translate }}</a>
        </div>
      </div>
    </div>
  `,
})
export class DownloadComponent implements OnInit {
  public state: 'loading' | 'done' | 'error' = 'loading';
  public fileName = '';
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  ngOnInit(): void {
    const nodeRef = this.route.snapshot.queryParamMap.get('nodeRef');
    if (!nodeRef) {
      this.state = 'error';
      return;
    }
    let params = new HttpParams().set('nodeRef', nodeRef);
    if (this.route.snapshot.queryParamMap.get('deleteAfterDownload') === 'true') {
      params = params.set('deleteAfterDownload', 'true');
    }
    this.configService.getGateway().pipe(
      switchMap(gateway => this.http.get(gateway + '/rest/content', { params, responseType: 'blob', observe: 'response' }))
    ).subscribe(response => {
      const disposition = response.headers.get('Content-Disposition') || '';
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
      this.fileName = match ? decodeURIComponent(match[1] || match[2]) : 'estrazione.xls';
      saveAs(response.body, this.fileName);
      this.state = 'done';
    }, () => this.state = 'error');
  }
}
