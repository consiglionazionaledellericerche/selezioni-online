import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { ConfigService } from '../config.service';

export const PUSH_TOPICS = ['calls', 'deadlines', 'convocations', 'communications'];

export interface PushConfig {
  enabled: boolean;
  publicKey: string;
  topics: string[];
}

export interface PushDevice {
  endpoint: string;
  userAgent: string;
  created: number;
}

export interface PushSettings {
  topics: string[];
  devices: PushDevice[];
}

/**
 * Notifiche push della PWA (API /openapi/v1/push di cool-jconon) e installazione dell'app.
 * Il service worker di Angular mostra le notifiche e, al clic, apre la pagina indicata dal backend.
 */
@Injectable({ providedIn: 'root' })
export class PushNotificationsService {

  constructor(private http: HttpClient,
              private configService: ConfigService,
              private swPush: SwPush,
              private swUpdate: SwUpdate) {}

  /** Il browser supporta le notifiche push e il service worker è attivo (solo build di produzione). */
  get supported(): boolean {
    return this.swPush.isEnabled && typeof window !== 'undefined' && 'Notification' in window && 'PushManager' in window;
  }

  /** Permesso del browser: default (da chiedere), granted, denied. */
  get permission(): NotificationPermission | 'unsupported' {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  }

  /** iOS/iPadOS: le notifiche sono disponibili solo con l'app aggiunta alla schermata Home. */
  get needsHomeScreen(): boolean {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return ios && !this.standalone;
  }

  get standalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  }

  /** Installazione proposta dal browser (evento beforeinstallprompt salvato in index.html). */
  get canInstall(): boolean {
    return !!(window as any).__installPrompt && !this.standalone;
  }

  install(): Promise<boolean> {
    const prompt = (window as any).__installPrompt;
    if (!prompt) {
      return Promise.resolve(false);
    }
    prompt.prompt();
    return prompt.userChoice.then((choice: any) => {
      (window as any).__installPrompt = null;
      return choice && choice.outcome === 'accepted';
    });
  }

  /** Aggiornamenti dell'app pronti (nuova versione scaricata dal service worker). */
  versionReady(): Observable<boolean> {
    if (!this.swUpdate.isEnabled) {
      return of(false);
    }
    return this.swUpdate.versionUpdates.pipe(map(event => event.type === 'VERSION_READY'));
  }

  config(): Observable<PushConfig> {
    return this.api(apiBase => this.http.get<PushConfig>(apiBase + '/v1/push/config'));
  }

  settings(): Observable<PushSettings> {
    return this.api(apiBase => this.http.get<PushSettings>(apiBase + '/v1/push/subscription'));
  }

  /** Iscrizione del browser corrente (null se non iscritto). */
  currentSubscription(): Observable<PushSubscription | null> {
    return this.supported ? this.swPush.subscription.pipe(take(1)) : of(null);
  }

  /** Chiede il permesso, iscrive il dispositivo e salva gli argomenti scelti. */
  enable(topics: string[]): Observable<PushSettings> {
    return this.config().pipe(
      switchMap(config => from(this.swPush.requestSubscription({ serverPublicKey: config.publicKey }))),
      switchMap(subscription => this.api(apiBase => this.http.put<PushSettings>(apiBase + '/v1/push/subscription',
        { subscription: subscription.toJSON(), topics })))
    );
  }

  updateTopics(topics: string[]): Observable<PushSettings> {
    return this.api(apiBase => this.http.put<PushSettings>(apiBase + '/v1/push/topics', topics));
  }

  /** Cancella l'iscrizione di questo dispositivo, nel browser e sul server. */
  disable(): Observable<PushSettings> {
    return this.currentSubscription().pipe(
      switchMap(subscription => {
        const endpoint = subscription ? subscription.endpoint : null;
        const unsubscribe = subscription ? from(this.swPush.unsubscribe()).pipe(catchError(() => of(null))) : of(null);
        return unsubscribe.pipe(switchMap(() => endpoint ? this.removeDevice(endpoint) : this.settings()));
      })
    );
  }

  removeDevice(endpoint: string): Observable<PushSettings> {
    return this.api(apiBase => this.http.delete<PushSettings>(apiBase + '/v1/push/subscription',
      { params: new HttpParams().set('endpoint', endpoint) }));
  }

  test(): Observable<{ sent: number }> {
    return this.api(apiBase => this.http.post<{ sent: number }>(apiBase + '/v1/push/test', null));
  }

  private api<T>(call: (apiBase: string) => Observable<T>): Observable<T> {
    return this.configService.getApiBase().pipe(switchMap(apiBase => call(apiBase)));
  }
}
