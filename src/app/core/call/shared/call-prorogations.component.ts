import { ChangeDetectorRef, Component, Input, OnChanges, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ManageCallService } from '../manage-call.service';

/**
 * Proroghe e riaperture di un bando (documenti jconon_attachment:prorogation), come nel frontend legacy:
 * per ciascuna la nuova scadenza; le riaperture in esecuzione di atto giudiziale sono indicate a parte.
 */
@Component({
  selector: 'app-call-prorogations',
  standalone: true,
  imports: [DatePipe, TranslatePipe],
  template: `
    @for (p of items; track $index) {
      <div class="prorogation" [class.compact]="compact">
        <span class="badge rounded-pill" [class]="isJudgment(p) ? 'bg-secondary' : 'bg-warning text-dark'">
          {{ (isJudgment(p) ? 'layout.prorogation_judgment' : 'layout.prorogation') | translate }}
        </span>
        <span class="ms-1">{{ 'layout.prorogation_deadline' | translate }}
          <strong>{{ p['jconon_attachment:data_fine'] | date:'dd/MM/yyyy HH:mm' }}</strong>
        </span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .prorogation { margin-top: .35rem; font-size: .9rem; }
    .prorogation.compact { font-size: .8rem; }
  `],
})
export class CallProrogationsComponent implements OnChanges {
  @Input() callId: string;
  @Input() compact = false;
  public items: any[] = [];
  private readonly manageCallService = inject(ManageCallService);
  // usato anche dentro componenti OnPush (riga del bando): la risposta asincrona va segnalata
  private readonly changeDetector = inject(ChangeDetectorRef);
  private loadedFor: string;

  ngOnChanges(): void {
    if (this.callId && this.callId !== this.loadedFor) {
      this.loadedFor = this.callId;
      this.manageCallService.prorogations(this.callId).subscribe(items => {
        this.items = Array.isArray(items) ? items : [];
        this.changeDetector.markForCheck();
      });
    }
  }

  isJudgment(p: any): boolean {
    return p['cmis:objectTypeId'] === 'D:jconon_attachment:call_re_judgment';
  }
}
