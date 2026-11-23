import { ChangeDetectorRef } from '@angular/core';
import { BRAND } from '../../../brand/brand';
import { CallBulkinfoService } from './call-bulkinfo.service';

/**
 * Campi visibili in una sezione della gestione del bando: tutti per il CNR; con BRAND.callSectionsFromBulkinfo solo
 * quelli del form del bulkinfo del tipo di bando (es. affix_sezione_3 dei bandi Lincei). In più si possono escludere
 * proprietà fisse (BRAND.callDetailHidden).
 */
export class CallSectionFields {
  /** undefined: in caricamento; null: nessun filtro. */
  private properties: Set<string> | null | undefined = BRAND.callSectionsFromBulkinfo ? undefined : null;

  constructor(private readonly hidden: string[] = []) {}

  load(service: CallBulkinfoService, callType: string, formName: string, changeDetector?: ChangeDetectorRef,
       onLoaded?: () => void): void {
    if (!BRAND.callSectionsFromBulkinfo || !callType) {
      this.properties = null;
      return;
    }
    service.formProperties(callType, formName).subscribe(properties => {
      this.properties = properties;
      if (onLoaded) {
        onLoaded();
      }
      if (changeDetector) {
        changeDetector.markForCheck();
      }
    });
  }

  /** Proprietà (es. "jconon_call:profilo") o nome del campo del bulkinfo (es. "aspect_macro_call"). */
  shows(property: string): boolean {
    if (this.hidden.includes(property)) {
      return false;
    }
    if (this.properties === undefined) {
      return false;
    }
    return !this.properties || this.properties.has(property) ||
      this.properties.has(property.startsWith('jconon_call:') ? property.substring('jconon_call:'.length) : 'jconon_call:' + property);
  }
}
