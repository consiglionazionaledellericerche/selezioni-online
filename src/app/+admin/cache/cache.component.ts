import { Component } from '@angular/core';
import { AdminService, CacheName } from '../admin.service';
import { ApiMessageService, MessageType } from '../../core/api-message.service';

/**
 * Svuotamento delle cache applicative di cool-jconon (ex /rest/cache/reset-*).
 */
@Component({
  standalone: false,
  selector: 'app-admin-cache',
  template: `
    <p class="small text-muted" translate>admin.cache.info</p>
    <div class="row">
      <div class="col-md-6 col-lg-4 mb-3" *ngFor="let cache of caches">
        <div class="card card-bg h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{'admin.cache.' + cache + '.title' | translate}}</h5>
            <p class="small flex-grow-1">{{'admin.cache.' + cache + '.description' | translate}}</p>
            <button class="btn btn-sm" [ngClass]="cache === 'all' ? 'btn-danger' : 'btn-outline-primary'"
              [disabled]="running[cache]" (click)="reset(cache)" translate>admin.cache.reset</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CacheComponent {

  public caches: CacheName[] = ['bulkinfo', 'application', 'call', 'jasper', 'sedi', 'labels', 'types', 'all'];
  public running: {[key: string]: boolean} = {};

  constructor(private adminService: AdminService, private apiMessageService: ApiMessageService) {}

  reset(cache: CacheName) {
    this.running[cache] = true;
    this.adminService.resetCache(cache).subscribe(() => {
      this.running[cache] = false;
      this.apiMessageService.sendMessage(MessageType.SUCCESS, 'admin.cache.done');
    }, () => this.running[cache] = false);
  }
}
