import { Base } from './base.model';

export class Page<T extends Base> {

  constructor(public items: T[],
              public count: number,
              public offset: number,
              public page: number,
              public hasMoreItems?: boolean) {}

}
