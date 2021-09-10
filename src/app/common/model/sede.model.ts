
export class Sede {
    public id: string;
    public sedeId: string;
    public label: string;
    public citta: string;
    public descrizione: string;
    

    constructor(sedeId: string, label: string, citta: string, descrizione: string) {
        this.sedeId = sedeId;
        this.label = label;
        this.id = sedeId;
        this.citta = citta;
        this.descrizione = descrizione;
    }

    public getId() : string {
        return this.id;
    }

    public getLabel() : string {
        return this.label;
    }

    public getObjectId() : string {
        return this.sedeId;
    }
}
