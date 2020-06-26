import {TableRow} from './table-row.model';
import { CmisObject } from './cmisobject.model';

export class Table {

  constructor(public keys: string[], public rows: TableRow[]) {}

  public static buildBaseTable(keys: string[], items: CmisObject[]) {
    const rows  = [];
    items.forEach( item => {
      const tableRow = item.toTableRow();
      if (tableRow) {
        rows.push(tableRow);
      }
    });
    return new Table(keys, rows);
  }
}
