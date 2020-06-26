import {Base} from './base.model';

export abstract class Period extends Base {

  constructor(protected id: number, public inizioValidita, public fineValidita) {
    super(id);
    this.inizioValidita = inizioValidita ? new Date(inizioValidita) : null;
    this.fineValidita = fineValidita ? new Date(fineValidita) : null;
  }

  /**
   * FIXME: l'assegnamento nel costruttore non ha esito. Usare il getter.
   * @returns {Date}
   */
  getInizio() {
    return this.inizioValidita ? new Date(this.inizioValidita) : null;
  }

  getFine() {
    return this.fineValidita ? new Date(this.fineValidita) : null;
  }

  belongToPeriod(date: Date): boolean {
    return this.fromIsActive(date) && this.toIsActive(date);
  }

  private fromIsActive(date) {
    return !this.getInizio() || (!date || this.getInizio() <= date);
  }

  private toIsActive(date) {
    return !this.getFine() || (!date || this.getFine() >= date);
  }

  periodBelongToPeriod(from, to) {
    return this.belongToPeriod(from) && this.belongToPeriod(to);
  }


}
