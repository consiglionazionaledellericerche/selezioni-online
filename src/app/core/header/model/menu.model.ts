import {MenuItem} from './menuitem.model';

export class Menu {

  constructor(public name: string,
              public icon: string,
              public items: MenuItem[],
              public path: string = '',
              public active: boolean = false) {}

  /**
   * Il menu è attivo se almeno un item è attivo.
   * @returns {boolean}
   */
  public isActive(): boolean {
    let active = this.active;
    this.items.forEach(item => {
      if (item.active) {
        active = true;
      }
    });
    return active;
  }
}
