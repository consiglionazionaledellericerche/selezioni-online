import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Richiede solo che l'utente abbia effettuato l'accesso. Usata dalle pagine di gestione del bando
 * (comunicazioni, commissione, etichette, permessi, bandi figli) i cui permessi effettivi
 * (amministratore, gruppo CONCORSI, RdP del bando) sono verificati dalle API del backend.
 */
@Injectable({ providedIn: 'root' })
export class AuthenticatedGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigateByUrl('/auth/signin', { state: { redirect: state.url } });
    return false;
  }
}
