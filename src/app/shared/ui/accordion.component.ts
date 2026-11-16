import { Component, ContentChildren, Input, QueryList, AfterContentInit, forwardRef, inject } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Accordion con il markup di Bootstrap Italia (.accordion / .accordion-item), senza dipendenze esterne.
 * Sostituisce <accordion>/<accordion-group> di ngx-bootstrap mantenendone l'interfaccia usata:
 * [closeOthers], #ref.isOpen, #ref.toggleOpen() e l'intestazione proiettata con l'attributo accordion-heading.
 */
@Component({
  selector: 'app-accordion',
  standalone: true,
  template: `<div class="accordion"><ng-content></ng-content></div>`,
})
export class AccordionComponent implements AfterContentInit {
  @Input() closeOthers = false;
  /** Accettato per compatibilità, l'animazione è quella di Bootstrap Italia. */
  @Input() isAnimated = true;
  @ContentChildren(forwardRef(() => AccordionGroupComponent), { descendants: true }) groups: QueryList<AccordionGroupComponent>;

  ngAfterContentInit(): void {}

  opened(group: AccordionGroupComponent): void {
    if (this.closeOthers && this.groups) {
      this.groups.filter(g => g !== group).forEach(g => g.isOpen = false);
    }
  }
}

let nextId = 0;

@Component({
  selector: 'app-accordion-group',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="accordion-item" [ngClass]="panelClass">
      <div class="accordion-header" [id]="headerId">
        <div class="accordion-button-wrapper d-flex align-items-center" role="button" tabindex="0"
             [attr.aria-expanded]="isOpen" [attr.aria-controls]="bodyId"
             (click)="toggleOpen()" (keydown.enter)="toggleOpen()" (keydown.space)="$event.preventDefault(); toggleOpen()">
          <div class="flex-grow-1 min-w-0"><ng-content select="[accordion-heading]"></ng-content></div>
          <svg class="icon icon-primary ms-2 flex-shrink-0 accordion-chevron" [class.open]="isOpen" aria-hidden="true">
            <use href="/bootstrap-italia/dist/svg/sprites.svg#it-expand"></use>
          </svg>
        </div>
      </div>
      <div class="accordion-collapse collapse" [class.show]="isOpen" [id]="bodyId" role="region" [attr.aria-labelledby]="headerId">
        <div class="accordion-body"><ng-content></ng-content></div>
      </div>
    </div>
  `,
  styles: [`
    .accordion-button-wrapper { cursor: pointer; padding: .75rem 1rem; border-bottom: 1px solid #e3e8ee; }
    .accordion-button-wrapper:hover { background: #f0f6fc; }
    .accordion-chevron { transition: transform .2s ease; }
    .accordion-chevron.open { transform: rotate(180deg); }
    .min-w-0 { min-width: 0; }
  `],
})
export class AccordionGroupComponent {
  @Input() panelClass: string;
  @Input() isOpen = false;
  private readonly accordion = inject(AccordionComponent, { optional: true });
  readonly headerId = 'acc-h-' + (++nextId);
  readonly bodyId = 'acc-b-' + nextId;

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.accordion?.opened(this);
    }
  }
}
