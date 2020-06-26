import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlSegment} from '@angular/router';
import {Injectable, Injector} from '@angular/core';
import {ApiMessageService, MessageType} from '../core/api-message.service';
import {CommonService} from '../common/controller/common.service';

import {Observable} from 'rxjs';
import { switchMap, map } from 'rxjs/operators';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router,
              protected injector: Injector,
              protected apiMessageService: ApiMessageService) {}

  canActivate(route: ActivatedRouteSnapshot, { url }: RouterStateSnapshot): Observable<boolean> {

    const service: CommonService<any> = this.injector.get(route.data['service']);
    const pCheck = route.data['function'] ? route.data['function'] : 'pCheck';

    console.info('Check url:' + url);
    return service[pCheck]().pipe(map((result) => {
      if (result) {
        return true;
      }
      this.router.navigateByUrl('/auth/signin', { state: { redirect: url } });
      if (result != null) {
        this.apiMessageService.sendMessage(MessageType.ERROR, 'Permessi non sufficienti');
      } else {
        this.apiMessageService.sendMessage(MessageType.ERROR, 'Il servizio è momentaneamente non disponibile.' +
          ' Riprovare fra alcuni secondi.');
      }
    }));
  }

}
