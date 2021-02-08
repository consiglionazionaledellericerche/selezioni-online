
export class Sede {
    public id: string;
    public sedeId: string;
    public label: string;

    constructor(sedeId: string, label: string) {
        this.sedeId = sedeId;
        this.label = label;
        this.id = sedeId;
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
