import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from './document.service';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'download-document',
  template: `
    <div class="alert alert-success">
        <strong>{{'message.document.download.success' | translate:{value: fileName} }}</strong>
    </div>
  `
})
export class DownloadDocumentComponent implements OnInit{

  constructor(
    public service: DocumentService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected translateService: TranslateService,
  ) {}
  private nodeRef: string;
  public fileName: string;

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
        this.nodeRef = queryParams['nodeRef'];
        this.fileName = queryParams['fileName'];
        this.service.getDocument(this.nodeRef, this.fileName).subscribe(res => {
            if (res && res.status && res.status === 401) {
                this.router.navigateByUrl('auth/signin', { state: { redirect: this.route.snapshot['_routerState'].url } });
            }
        });
    });
  }
}
