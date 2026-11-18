import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ApiMessageService, MessageType } from '../api-message.service';
import { PUSH_TOPICS, PushDevice, PushNotificationsService, PushSettings } from './push-notifications.service';

/**
 * App e notifiche: installazione della PWA, attivazione delle notifiche push su questo dispositivo,
 * scelta degli argomenti (nuovi bandi, scadenze delle domande in bozza, convocazioni, comunicazioni)
 * e dispositivi iscritti.
 */
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [TranslatePipe, DatePipe],
  template: `
    <div class="row row-title pt-4 pb-2">
      <div class="border-bottom border-primary pb-3">
        <h1 class="h2 text-primary mb-1">{{ 'push.title' | translate }}</h1>
        <p class="mb-0 text-secondary">{{ 'push.subtitle' | translate }}</p>
      </div>
    </div>

    <div class="row g-4 mt-1">
      <div class="col-lg-7">
        <section class="card shadow-sm rounded p-4 mb-4">
          <h2 class="h5 d-flex align-items-center">
            <svg class="icon icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-horn"></use></svg>
            {{ 'push.device.title' | translate }}
          </h2>
          @if (!service.supported) {
            <div class="alert alert-warning mb-0">
              {{ (service.needsHomeScreen ? 'push.device.ios' : 'push.device.unsupported') | translate }}
            </div>
          } @else if (disabledOnServer) {
            <div class="alert alert-warning mb-0">{{ 'push.device.server_disabled' | translate }}</div>
          } @else if (service.permission === 'denied') {
            <div class="alert alert-danger mb-0">{{ 'push.device.denied' | translate }}</div>
          } @else {
            <p class="text-secondary">{{ (subscribed ? 'push.device.active' : 'push.device.inactive') | translate }}</p>
            <div class="d-flex flex-wrap gap-2">
              @if (!subscribed) {
                <button type="button" class="btn btn-primary btn-sm" [disabled]="busy || !topics.length" (click)="enable()">
                  <svg class="icon icon-white icon-sm me-1"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-check"></use></svg>
                  {{ 'push.device.enable' | translate }}
                </button>
              } @else {
                <button type="button" class="btn btn-outline-primary btn-sm" [disabled]="busy" (click)="test()">
                  {{ 'push.device.test' | translate }}
                </button>
                <button type="button" class="btn btn-outline-danger btn-sm" [disabled]="busy" (click)="disable()">
                  {{ 'push.device.disable' | translate }}
                </button>
              }
            </div>
          }
        </section>

        <section class="card shadow-sm rounded p-4">
          <h2 class="h5">{{ 'push.topics.title' | translate }}</h2>
          <p class="small text-secondary">{{ 'push.topics.info' | translate }}</p>
          <ul class="list-unstyled mb-0 topics">
            @for (topic of allTopics; track topic) {
              <li class="d-flex align-items-start gap-3 py-3">
                <div class="toggles">
                  <label [for]="'topic-' + topic" class="m-0">
                    <input type="checkbox" [id]="'topic-' + topic" [checked]="topics.includes(topic)" [disabled]="busy"
                           (change)="toggle(topic)">
                    <span class="lever m-0"></span>
                    <span class="visually-hidden">{{ 'push.topics.' + topic + '.title' | translate }}</span>
                  </label>
                </div>
                <div>
                  <div class="fw-semibold">{{ 'push.topics.' + topic + '.title' | translate }}</div>
                  <div class="small text-secondary">{{ 'push.topics.' + topic + '.description' | translate }}</div>
                </div>
              </li>
            }
          </ul>
        </section>
      </div>

      <div class="col-lg-5">
        <section class="card shadow-sm rounded p-4 mb-4">
          <h2 class="h5 d-flex align-items-center">
            <svg class="icon icon-primary me-2"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-download"></use></svg>
            {{ 'push.install.title' | translate }}
          </h2>
          @if (service.standalone) {
            <p class="mb-0 text-success">{{ 'push.install.installed' | translate }}</p>
          } @else if (service.canInstall) {
            <p class="text-secondary">{{ 'push.install.info' | translate }}</p>
            <button type="button" class="btn btn-primary btn-sm" (click)="install()">{{ 'push.install.button' | translate }}</button>
          } @else if (service.needsHomeScreen) {
            <p class="mb-0 text-secondary">{{ 'push.install.ios' | translate }}</p>
          } @else {
            <p class="mb-0 text-secondary">{{ 'push.install.browser' | translate }}</p>
          }
        </section>

        @if (settings?.devices?.length) {
          <section class="card shadow-sm rounded p-4">
            <h2 class="h5">{{ 'push.devices.title' | translate }}</h2>
            <ul class="list-unstyled mb-0 devices">
              @for (device of settings.devices; track device.endpoint) {
                <li class="d-flex align-items-center gap-2 py-2">
                  <svg class="icon icon-sm icon-secondary"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-software"></use></svg>
                  <div class="me-auto small">
                    <div class="fw-semibold">
                      {{ deviceName(device) }}
                      @if (device.endpoint === currentEndpoint) {
                        <span class="badge bg-primary ms-1">{{ 'push.devices.this' | translate }}</span>
                      }
                    </div>
                    <div class="text-secondary">{{ 'push.devices.since' | translate }} {{ device.created | date:'dd/MM/yyyy' }}</div>
                  </div>
                  <button type="button" class="btn btn-outline-danger btn-sm btn-action" [disabled]="busy" (click)="remove(device)"
                          [attr.aria-label]="'push.devices.remove' | translate">
                    <svg class="icon icon-danger icon-sm"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-delete"></use></svg>
                  </button>
                </li>
              }
            </ul>
          </section>
        }
      </div>
    </div>
  `,
  styles: [`
    .topics li + li, .devices li + li { border-top: 1px solid #e3e8ee; }
    .toggles label { height: auto; }
  `]
})
export class NotificationsComponent implements OnInit {
  public readonly service = inject(PushNotificationsService);
  private readonly apiMessageService = inject(ApiMessageService);
  private readonly translateService = inject(TranslateService);

  public allTopics = PUSH_TOPICS;
  public topics: string[] = [...PUSH_TOPICS];
  public settings: PushSettings;
  public subscribed = false;
  public currentEndpoint: string;
  public disabledOnServer = false;
  public busy = false;

  ngOnInit(): void {
    this.service.config().subscribe(config => this.disabledOnServer = !config.enabled, () => this.disabledOnServer = true);
    this.load();
  }

  private load(): void {
    this.service.settings().subscribe(settings => this.apply(settings), () => {});
    this.service.currentSubscription().subscribe(subscription => {
      this.currentEndpoint = subscription ? subscription.endpoint : null;
      this.refreshSubscribed();
    });
  }

  private apply(settings: PushSettings): void {
    this.settings = settings;
    this.topics = settings.topics || [];
    this.refreshSubscribed();
  }

  /** Iscritto se il browser ha un'iscrizione che il server conosce. */
  private refreshSubscribed(): void {
    this.subscribed = !!this.currentEndpoint && !!this.settings &&
      (this.settings.devices || []).some(device => device.endpoint === this.currentEndpoint);
  }

  enable(): void {
    this.busy = true;
    this.service.enable(this.topics).subscribe(settings => {
      this.busy = false;
      this.apply(settings);
      this.load();
      this.message(MessageType.SUCCESS, 'push.device.enabled');
    }, () => {
      this.busy = false;
      this.message(MessageType.ERROR, this.service.permission === 'denied' ? 'push.device.denied' : 'push.device.error');
    });
  }

  disable(): void {
    this.busy = true;
    this.service.disable().subscribe(settings => {
      this.busy = false;
      this.currentEndpoint = null;
      this.apply(settings);
      this.message(MessageType.SUCCESS, 'push.device.disabled');
    }, () => this.busy = false);
  }

  test(): void {
    this.service.test().subscribe(result => this.message(result.sent ? MessageType.SUCCESS : MessageType.WARNING,
      result.sent ? 'push.device.test_sent' : 'push.device.test_none'));
  }

  toggle(topic: string): void {
    this.topics = this.topics.includes(topic) ? this.topics.filter(t => t !== topic) : [...this.topics, topic];
    if (!this.settings?.devices?.length) {
      return; // salvati all'attivazione
    }
    this.busy = true;
    this.service.updateTopics(this.topics).subscribe(settings => {
      this.busy = false;
      this.apply(settings);
      this.message(MessageType.SUCCESS, 'push.topics.saved');
    }, () => this.busy = false);
  }

  remove(device: PushDevice): void {
    if (device.endpoint === this.currentEndpoint) {
      this.disable();
      return;
    }
    this.busy = true;
    this.service.removeDevice(device.endpoint).subscribe(settings => {
      this.busy = false;
      this.apply(settings);
    }, () => this.busy = false);
  }

  install(): void {
    this.service.install();
  }

  /** Nome leggibile del dispositivo a partire dallo user agent. */
  deviceName(device: PushDevice): string {
    const ua = device.userAgent || '';
    const browser = /edg\//i.test(ua) ? 'Edge' : /firefox/i.test(ua) ? 'Firefox' : /chrome|crios/i.test(ua) ? 'Chrome' :
      /safari/i.test(ua) ? 'Safari' : this.translateService.instant('push.devices.browser');
    const os = /android/i.test(ua) ? 'Android' : /iphone|ipad|ipod/i.test(ua) ? 'iOS' : /windows/i.test(ua) ? 'Windows' :
      /mac os/i.test(ua) ? 'macOS' : /linux/i.test(ua) ? 'Linux' : '';
    return os ? browser + ' — ' + os : browser;
  }

  private message(type: MessageType, key: string): void {
    this.apiMessageService.sendMessage(type, this.translateService.instant(key));
  }
}
