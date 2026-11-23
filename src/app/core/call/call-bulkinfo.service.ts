import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { ConfigService } from '../config.service';

/**
 * Proprietà previste dai form del bulkinfo del tipo di bando (affix_sezione_1, _2, _3 ...): le installazioni che
 * estendono cool-jconon (BRAND.callSectionsFromBulkinfo, es. Lincei) mostrano nelle sezioni della gestione del bando
 * solo i campi del proprio bulkinfo, come il frontend legacy.
 */
@Injectable({ providedIn: 'root' })
export class CallBulkinfoService {
  private cache = new Map<string, Observable<Set<string> | null>>();

  constructor(private http: HttpClient, private configService: ConfigService) {}

  /** Proprietà del form; null se il bulkinfo non è disponibile (allora valgono tutti i campi). */
  formProperties(callType: string, formName: string): Observable<Set<string> | null> {
    const key = callType + '|' + formName;
    if (!this.cache.has(key)) {
      this.cache.set(key, this.configService.getGateway().pipe(
        switchMap(gateway => this.http.get<any>(gateway + '/rest/bulkInfo/view/' + encodeURIComponent(callType) +
          '/form/' + encodeURIComponent(formName))),
        map(view => {
          const form = view && (view[formName] || view['default']);
          if (!form) {
            return null;
          }
          return new Set<string>(Object.keys(form).map(name => form[name]?.property || form[name]?.name || name)
            .concat(Object.keys(form).map(name => 'jconon_call:' + name)));
        }),
        catchError(() => of(null)),
        shareReplay(1)
      ));
    }
    return this.cache.get(key);
  }
}
