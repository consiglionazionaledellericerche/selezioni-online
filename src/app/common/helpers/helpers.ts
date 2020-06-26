
import {AbstractControlDirective, NgControl} from '@angular/forms';
import {CmisObject} from '../model/cmisobject.model';
import {Enum} from '../model/enum.model';
import {DatePipe} from '@angular/common';
import {JsonConvert, ValueCheckingMode} from 'json2typescript';

export class Helpers {
  public static buildInstance(json: any, obj: any): any {
    let jsonConvert: JsonConvert = new JsonConvert();
        jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
        jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; // never allow null
        
    return jsonConvert.deserializeObject(json, obj);
  }

  public static capitalizeName(value: string) {
    let result = '';
    const terms = value.split(' ');
    if (terms) {
      terms.forEach( (term) => {
        if (term.indexOf('\'') > 0) {
          const a = term.split('\'')[0];
          const b = term.split('\'')[1];
          result = result + Helpers.capitalizeWord(a) + '\'' + Helpers.capitalizeWord(b);
        } else {
          result = result + term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();
        }
        result = result + ' ';
      });
    }
    return result;
  }

  public static capitalizeWord(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  public static addDays(date: Date, noOfDays: number): Date {
    if (date === null) {
      return null;
    }
    return new Date(date.getTime() + (noOfDays * (1000 * 60 * 60 * 24)));
  }

  public static formatDate(date: Date): string {
    if (date === null) {
      return null;
    }
    return new DatePipe('en-US').transform(date,"yyyy-MM-dd");
  }

  public static showDate(date: Date): string {
    if (date === null) {
      return null;
    }
    return new DatePipe('en-US').transform(date,"dd/MM/yyyy");
  }

  public static formatDateView(date: Date): string {
    if (date === null) {
      return null;
    }
    return new DatePipe('en-US').transform(date,"dd/MM/yyyy");
  }

  public static formatDateTimeView(date: Date): string {
    if (date === null) {
      return null;
    }
    return new DatePipe('en-US').transform(date,"dd-MM-yyyy HH:mm:ss");
  }

  public static getLabelFromControl(label: string, controlDir: NgControl): string {
    if (label == null) {
      const abstractControl = (<AbstractControlDirective>controlDir).control;
      const formGroup = abstractControl.parent.controls;
      return Object.keys(formGroup).find(name => abstractControl === formGroup[name]) || null;
    }
    return label;
  }

  public static buildDate(value): Date {
    return !value || value instanceof Date ? value : new Date(value);
  }

  /**
   * Stesso oggetto ma con:
   * Base value: id
   * Enum value: enumValue
   * Applicazione: Post e Put Http.
   */
  public static objToJsonObj(obj): {} {
    const jsonObj = {};
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value instanceof Array) {
        jsonObj[key] = [];
        value.forEach( item => {
          jsonObj[key].push(Helpers.valueToJson(item));
        });
        return;
      } else {
        jsonObj[key] = Helpers.valueToJson(value);
      }
    });
    return jsonObj;
  }

  public static objToQueryParam(obj) {
    let s = '';
    if (!obj) {
      return s;
    }
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value instanceof Array) {
        value.forEach( item => {
          s = s + '&' + key + '=' + Helpers.valueToJson(item);
        });
        return;
      } else {
        s = s + '&' + key + '=' + Helpers.valueToJson(value);
      }
    });
    return s;
  }

  public static valueToJson(value) {
    if (value === null || value === undefined) {
      return;
    }
    if (value instanceof CmisObject) {
      return value.referenceValue();
    }
    if (value instanceof Enum) {
      return value.getEnumValue();
    }
    if (value instanceof Date) {
      return Helpers.formatDate(value);
    }
    return value;
  }

  /**
   * Metodo per eseguire in modo sequenziale un numero arbitrario di chiamate async.
   * @param {number[]} array contiene gli input da fornire a fn
   * @param {number} index indice da eseguire
   * @param {(i: number) => Observable<any>} fn
   * @param {Observable<any>} previous
   * @returns {Observable<any>}
   */
  // public static recoursiveSwitch(fn: (arg: any) => Observable<any>, array: any[],
  //                         index?: number, previous?: Observable<any>): Observable<any> {
  //
  //   index = index === undefined ? 0 : index;
  //
  //   // ultima iterata
  //   if (array.length === index) {
  //     return previous;
  //   }
  //
  //   const execution = fn(array[index]);
  //
  //   // prima iterata
  //   if (previous === undefined) {
  //     return this.recoursiveSwitch(fn, array, index + 1, execution);
  //   }
  //
  //   // appendo le iterate intermedie alle precedenti
  //   return previous.switchMap( (value) => {
  //     return this.recoursiveSwitch(fn, array, index + 1, execution);
  //   });
  // }

}

