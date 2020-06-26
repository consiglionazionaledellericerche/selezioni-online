import { CmisObject } from './cmisobject.model';

export class Page<T extends CmisObject> {

  constructor(public items: T[],
              public count: number,
              public offset: number,
              public page: number) {}

}
