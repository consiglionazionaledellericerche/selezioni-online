import {WizardItem} from './wizard-item.model';

export class Wizard {

  public active;

  public valid;

  constructor(public items: WizardItem[]) {
    this.active = items[0];
  }

  public isActive(id) {
    return this.active.id === id;
  }

  hasPrevious() {
    return this.items.indexOf(this.active) !== 0;
  }

  public hasNext() {
    return this.items.indexOf(this.active) < this.items.length - 1;
  }

  public next() {
    if (!this.hasNext()) {
      return this.active;
    }
    this.active = this.items[this.items.indexOf(this.active) + 1];
    return this.active;
  }

  public back() {
    if (!this.hasPrevious()) {
      return this.active;
    }
    this.active = this.items[this.items.indexOf(this.active) - 1];
    return this.active;
  }

}
