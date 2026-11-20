/**
 * Tipologie di bando nell'ordine del frontend legacy (home/main.get.js): per "description" del tipo, che nel
 * modello fissa l'ordine di presentazione; vale anche per le sotto-tipologie (es. Tempo Indeterminato).
 */
export function sortCallTypes<T extends { description?: string, childs?: T[] }>(types: T[]): T[] {
  if (!Array.isArray(types)) {
    return types;
  }
  // confronto per codice dei caratteri come in JavaScript nel legacy (a < b): le maiuscole vengono prima
  // ("Inserisci…" di tempo determinato/indeterminato prima di "b) …", "c) …")
  const byDescription = (a: T, b: T) => {
    const x = String(a?.description ?? '');
    const y = String(b?.description ?? '');
    return x < y ? -1 : (x > y ? 1 : 0);
  };
  return [...types]
    .map(type => type && Array.isArray(type.childs) ? { ...type, childs: sortCallTypes(type.childs) } : type)
    .sort(byDescription);
}
