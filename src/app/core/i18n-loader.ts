import { HttpBackend, HttpClient } from '@angular/common/http';
import { Provider } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { ConfigService } from './config.service';
import { CustomTranslationCompiler } from '../common/helpers/translation-compiler';

function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  for (const [key, value] of Object.entries(source ?? {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)
      && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

/**
 * Come in GesFor: unisce le traduzioni di design-angular-kit (bootstrap-italia/i18n) con quelle
 * dell'applicazione (etichette remote di cool-jconon + assets/i18n). In caso di chiavi uguali
 * prevalgono quelle dell'applicazione. I riferimenti "@:chiave" vengono risolti come faceva
 * CustomTranslationCompiler.
 */
export class MergedTranslateLoader implements TranslateLoader {
  private readonly http: HttpClient;
  private readonly appLoader: ConfigService;

  constructor(handler: HttpBackend, private readonly kitPrefix: string, private readonly kitSuffix: string) {
    // HttpBackend: le traduzioni non passano dagli interceptor applicativi
    this.http = new HttpClient(handler);
    this.appLoader = new ConfigService(this.http);
  }

  getTranslation(lang: string): Observable<TranslationObject> {
    const kit = this.http.get<Record<string, any>>(`${this.kitPrefix}${lang}${this.kitSuffix}`).pipe(catchError(() => of({})));
    const app = this.appLoader.getTranslation(lang).pipe(catchError(() => of({})));
    return forkJoin([kit, app]).pipe(
      map(([kitLabels, appLabels]) => {
        const merged = deepMerge(deepMerge({}, kitLabels), appLabels);
        return new CustomTranslationCompiler().compileTranslations(merged, lang) as TranslationObject;
      })
    );
  }
}

export function mergedTranslateLoader(kitPrefix: string, kitSuffix: string): Provider {
  return {
    provide: TranslateLoader,
    useFactory: (handler: HttpBackend) => new MergedTranslateLoader(handler, kitPrefix, kitSuffix),
    deps: [HttpBackend],
  };
}
