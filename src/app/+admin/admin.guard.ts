import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../core/config.service';
import { ApiMessageService, MessageType } from '../core/api-message.service';

/**
 * Consente l'accesso alle pagine di amministrazione in base all'id RBAC indicato in data.rbac
 * (gli stessi id delle pagine legacy: groups, gestori, gestione-utenti, rbac-admin, jsConsole).
 * Le pagine senza id RBAC (cache, viste) richiedono il ruolo di amministratore.
 * Il backend ripete comunque gli stessi controlli.
 */
@Injectable()
export class AdminGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
    private configService: ConfigService,
    private httpClient: HttpClient,
    private apiMessageService: ApiMessageService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/auth/signin', { state: { redirect: state.url } });
      return of(false);
    }
    const user = this.authService.getUser();
    if (user && user.capabilities && user.capabilities.isAdmin) {
      return of(true);
    }
    const rbac: string = route.data['rbac'];
    if (!rbac) {
      return of(this.deny());
    }
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => this.httpClient.get<boolean>(apiBase + '/v1/pcheck', {
        params: new HttpParams().set('path', rbac).set('method', 'GET')
      })),
      map(result => result ? true : this.deny()),
      catchError(() => of(this.deny()))
    );
  }

  private deny(): boolean {
    this.apiMessageService.sendMessage(MessageType.ERROR, 'admin.error.forbidden');
    this.router.navigateByUrl('/');
    return false;
  }
}
