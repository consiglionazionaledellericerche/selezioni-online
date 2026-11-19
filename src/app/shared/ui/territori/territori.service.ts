import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { ConfigService } from '../../../core/config.service';

/** Comune italiano dall'archivio ANPR (anche soppresso, con il periodo di validità). */
export interface ComuneTerritorio {
  /** Valore salvato nelle domande: il nome del comune. */
  id: string;
  nomeComune: string;
  provincia: string;
  codiceIstat?: string;
  codiceCatastale?: string;
  dataIstituzione?: string;
  /** yyyy-MM-dd, assente se il comune è in vigore. */
  dataCessazione?: string;
  attivo?: boolean;
}

/** Stato o territorio estero dall'elenco ISTAT. */
export interface StatoTerritorio {
  nome: string;
  nomeEn?: string;
  iso2?: string;
  iso3?: string;
  codiceCatastale?: string;
  continente?: string;
  tipo?: string;
}

export const ITALIA = 'Italia';

/** Dati ufficiali ISTAT/ANPR serviti da cool-jconon (/openapi/v1/territori). */
@Injectable({ providedIn: 'root' })
export class TerritoriService {
  private stati$: Observable<StatoTerritorio[]>;

  constructor(private http: HttpClient, private configService: ConfigService) {}

  /** Tutti gli stati, Italia per prima; caricati una volta sola. */
  stati(): Observable<StatoTerritorio[]> {
    if (!this.stati$) {
      this.stati$ = this.configService.getApiBase().pipe(
        switchMap(apiBase => this.http.get<{ stati: StatoTerritorio[] }>(apiBase + '/v1/territori/stati')),
        map(result => [{ nome: ITALIA, nomeEn: 'Italy', iso2: 'IT', iso3: 'ITA' } as StatoTerritorio]
          .concat((result.stati || []).filter(s => normalize(s.nome) !== normalize(ITALIA)))),
        catchError(() => {
          this.stati$ = null;
          return of([{ nome: ITALIA, iso2: 'IT' } as StatoTerritorio]);
        }),
        shareReplay(1)
      );
    }
    return this.stati$;
  }

  /**
   * Comuni per nome o codice catastale.
   * @param attivi solo quelli in vigore (residenza, recapiti); altrimenti anche i soppressi (luogo di nascita)
   * @param data   solo quelli validi in quella data (yyyy-MM-dd), es. la data di nascita
   */
  comuni(filter: string, attivi: boolean, data?: string, limit = 30): Observable<ComuneTerritorio[]> {
    let params = new HttpParams().set('filter', filter).set('limit', String(limit));
    if (attivi) {
      params = params.set('attivi', 'true');
    }
    if (data) {
      params = params.set('data', data);
    }
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => this.http.get<{ comuni: ComuneTerritorio[] }>(apiBase + '/v1/territori/comuni', { params })),
      map(result => result.comuni || [])
    );
  }
}

/** Testo per i confronti: minuscolo, senza accenti e punteggiatura. */
export function normalize(value: string): string {
  return String(value || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[’'`´]/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Bandiera (emoji) dal codice ISO a due lettere. */
export function flag(iso2: string): string {
  if (!iso2 || !/^[A-Za-z]{2}$/.test(iso2)) {
    return '';
  }
  return String.fromCodePoint(...iso2.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}
