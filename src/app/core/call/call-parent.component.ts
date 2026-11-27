import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Call } from './call.model';
import { CallService } from './call.service';

/**
 * Bando di riferimento (macro bando) di un bando figlio: codice con il collegamento al dettaglio e profilo.
 * Non mostra nulla per i bandi che non appartengono a un bando multiplo.
 */
@Component({
  selector: 'app-call-parent',
  standalone: true,
  imports: [NgIf, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="parent" class="call-parent d-flex flex-wrap align-items-center gap-2 small">
      <svg class="icon icon-sm icon-primary" aria-hidden="true"><use href="/bootstrap-italia/dist/svg/sprites.svg#it-folder"></use></svg>
      <span class="text-secondary">{{ 'call_manage.children.parent' | translate }}:</span>
      <a class="fw-semibold" [routerLink]="['/call-detail']" [queryParams]="{ callId: parent.objectId }">{{ parent.codice }}</a>
      <span *ngIf="parent.profilo" class="text-secondary">{{ parent.profilo }}</span>
    </div>
  `,
  styles: [`.call-parent { margin: .25rem 0 .5rem; }`]
})
export class CallParentComponent implements OnChanges {
  @Input() call: Call;
  public parent: Call;
  private loadedFor: string;
  private readonly callService = inject(CallService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngOnChanges(): void {
    const call: any = this.call;
    if (!call || !call.has_macro_call || !call.parentId) {
      this.parent = undefined;
      this.loadedFor = undefined;
      return;
    }
    if (this.loadedFor === call.parentId) {
      return;
    }
    this.loadedFor = call.parentId;
    this.callService.getById(call.parentId).subscribe(parent => {
      this.parent = parent && parent.codice ? parent : undefined;
      this.changeDetectorRef.markForCheck();
    }, () => {
      this.parent = undefined;
      this.changeDetectorRef.markForCheck();
    });
  }
}
