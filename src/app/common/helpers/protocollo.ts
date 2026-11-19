/** Cifre del numero di protocollo: i numeri più corti si completano con zeri davanti (es. 4444 → 0004444). */
export const PROTOCOLLO_CIFRE = 7;

/**
 * Completa il numero di protocollo con gli zeri iniziali fino a 7 cifre, come nel frontend legacy.
 * Valori non numerici (es. con lettere o barre) restano come sono.
 */
export function padProtocollo(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }
  const text = String(value).trim();
  return /^\d+$/.test(text) && text.length < PROTOCOLLO_CIFRE ? text.padStart(PROTOCOLLO_CIFRE, '0') : text;
}
