import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../core/config.service';

interface AdminLink {
  path: string;
  label: string;
  icon: string;
  rbac?: string;
  visible?: boolean;
}

@Component({
  standalone: false,
  selector: 'app-admin-section',
  template: `
    <div class="container-fluid pt-2">
      <h2 class="text-primary mb-3" translate>admin.title</h2>
      <ul class="nav nav-tabs auto mb-3">
        <ng-container *ngFor="let link of links">
          <li class="nav-item" *ngIf="link.visible">
            <a class="nav-link" [routerLink]="[link.path]" routerLinkActive="active">
              <svg class="icon icon-sm me-1"><use [attr.href]="'/assets/bootstrap-italia/svg/sprites.svg#' + link.icon"></use></svg>
              {{link.label | translate}}
            </a>
          </li>
        </ng-container>
      </ul>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AdminSectionComponent implements OnInit {

  public links: AdminLink[] = [
    { path: 'groups', label: 'admin.menu.groups', icon: 'it-pa', rbac: 'groups' },
    { path: 'gestori', label: 'admin.menu.gestori', icon: 'it-key', rbac: 'gestori' },
    { path: 'users', label: 'admin.menu.users', icon: 'it-user', rbac: 'gestione-utenti' },
    { path: 'rbac', label: 'admin.menu.rbac', icon: 'it-locked', rbac: 'rbac-admin' },
    { path: 'cache', label: 'admin.menu.cache', icon: 'it-refresh' },
    { path: 'views', label: 'admin.menu.views', icon: 'it-files' },
    { path: 'js-console', label: 'admin.menu.jsConsole', icon: 'it-code-circle', rbac: 'jsConsole' }
  ];

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user && user.capabilities && user.capabilities.isAdmin) {
      this.links.forEach(link => link.visible = true);
      return;
    }
    const paths = this.links.filter(link => link.rbac).map(link => ({ path: link.rbac, method: 'GET' }));
    this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.post<string[]>(apiBase + '/v1/pcheck', paths)),
      catchError(() => of([] as string[]))
    ).subscribe(permitted => {
      this.links.forEach(link => link.visible = !!link.rbac && permitted.includes(link.rbac));
    });
  }
}
