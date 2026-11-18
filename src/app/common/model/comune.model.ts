
export class Comune {
    public id: string;
    public provincia: string;
    /** Dati dell'archivio ANPR (assenti nei dati salvati con il servizio precedente). */
    public nomeComune?: string;
    public codiceIstat?: string;
    public codiceCatastale?: string;
    public dataIstituzione?: string;
    /** Data di soppressione (yyyy-MM-dd), assente per i comuni in vigore. */
    public dataCessazione?: string;
    public attivo?: boolean;

    constructor(id: string, provincia: string) {
        this.id = id;
        this.provincia = provincia;
    }

    public getId() : string {
        return this.id;
    }

    public getLabel() : string {
        return this.id;
    }

    public getObjectId() : string {
        return this.id;
    }
}
