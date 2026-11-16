import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { AuthService } from '../../auth/auth.service';

interface ConsoleLine {
  type: 'command' | 'success' | 'error' | 'log';
  text: string;
}

/**
 * Console JavaScript sul repository Alfresco (ex pagina legacy jsConsole).
 * Il webscript che esegue il codice e' riservato agli utenti ADMIN di Alfresco.
 * Come nella versione legacy, ogni comando e' preceduto dalla funzione help(obj),
 * che elenca proprieta' e metodi di un oggetto.
 */
@Component({
  standalone: false,
  selector: 'app-admin-js-console',
  template: `
    <div class="alert alert-warning small" translate>admin.jsConsole.warning</div>
    <div class="form-group mb-2">
      <label for="js-command" class="active" translate>admin.jsConsole.command</label>
      <textarea id="js-command" class="form-control font-monospace editor" rows="10" spellcheck="false"
        [(ngModel)]="command" (keydown)="onKeyDown($event)"></textarea>
      <small class="text-muted" translate>admin.jsConsole.shortcut</small>
    </div>
    <div class="d-flex gap-2 mb-3">
      <button class="btn btn-primary btn-sm" [disabled]="running || !command?.trim()" (click)="execute()" translate>admin.jsConsole.execute</button>
      <button class="btn btn-outline-secondary btn-sm" (click)="lines = []" translate>admin.jsConsole.clear</button>
    </div>
    <div class="terminal p-2 rounded font-monospace small">
      <div *ngFor="let line of lines" [ngClass]="'line-' + line.type"><span *ngIf="line.type === 'command'" class="fw-bold">{{prompt}} </span>{{line.text}}</div>
      <div *ngIf="running" class="line-log">...</div>
    </div>
  `,
  styles: [
    '.editor { tab-size: 2; }',
    '.terminal { background: #1e1e1e; color: #d4d4d4; min-height: 12rem; max-height: 50vh; overflow: auto; white-space: pre-wrap; word-break: break-word; }',
    '.line-command { color: #9cdcfe; }',
    '.line-error { color: #f48771; }',
    '.line-log { color: #c5c5c5; font-style: italic; }',
    '.line-success { color: #b5cea8; }'
  ]
})
export class JsConsoleComponent implements OnInit {

  public static STORAGE_KEY = 'jsConsoleCode';
  private static HELP = 'function help(item){ var obj = {}; for(k in item){ ' +
    'obj[k] = (typeof item[k] !== "object") ? item[k] : typeof item[k]; } return obj; };';

  public command = '';
  public lines: ConsoleLine[] = [];
  public running = false;
  public prompt = '#';

  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.prompt = (user ? user.userName : '') + '@alfresco #';
    try {
      this.command = localStorage.getItem(JsConsoleComponent.STORAGE_KEY) || '';
    } catch (e) {
      this.command = '';
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.execute();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const target = event.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      this.command = this.command.substring(0, start) + '  ' + this.command.substring(target.selectionEnd);
      setTimeout(() => target.selectionStart = target.selectionEnd = start + 2);
    }
  }

  execute() {
    const command = (this.command || '').trim();
    if (!command || this.running) {
      return;
    }
    try {
      localStorage.setItem(JsConsoleComponent.STORAGE_KEY, command);
    } catch (e) {}
    this.lines.push({ type: 'command', text: command });
    this.running = true;
    this.adminService.jsConsole(JsConsoleComponent.HELP + command).subscribe(result => {
      this.running = false;
      if (result.error) {
        this.lines.push({ type: 'error', text: String(result.error) });
        return;
      }
      (result.logs || []).forEach(log => this.lines.push({ type: 'log', text: 'logger: ' + log }));
      const content = result.output ? result.output.content : undefined;
      this.lines.push({ type: 'success', text: content === undefined ? 'undefined' : JSON.stringify(content, null, 2) });
    }, (message: string) => {
      this.running = false;
      this.lines.push({ type: 'error', text: 'Error: ' + message });
    });
  }
}
