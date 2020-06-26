import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-wizard-item-content',
  template:
     `
    <!-- FORM -->
      <ng-content></ng-content>
      <div class="row">
        <div class="container">

          <button class="btn btn-secondary float-left mr-1" (click)="onWizardExit.emit()">
            Annulla </button>

          <button *ngIf="wizard.hasPrevious()"
                  (click)="back()"
                  class="btn btn-info float-left"> <i class="fa fa-arrow-circle-left"></i> Precedente</button>

          <button *ngIf="wizard.hasNext()"
                  (click)="next()"
                  [disabled]="!isValid()"
                  class="btn btn-info float-right mt-2 mb-2"> <i class="fa fa-arrow-circle-right"></i> Successivo</button>

          <button *ngIf="!wizard.hasNext()" class="btn btn-primary float-right mt-2 mb-2" [disabled]="!wizardValid"
                  (click)="onWizardSubmit.emit()">
            Salva In Gerarchia</button>
        </div>

      </div>
    `,
  styles:
      [],
  encapsulation: ViewEncapsulation.None
})
export class WizardItemContentComponent {

  constructor() {}

  @Input() wizard;

  @Input() itemForm;

  @Input() wizardValid = false;

  @Output() onWizardSubmit = new EventEmitter();

  @Output() onWizardExit = new EventEmitter();

  public next() {
    this.wizard.next();
  }

  public back() {
    this.wizard.back();
  }

  public isValid() {
    return this.itemForm && this.itemForm.valid;
  }

}

