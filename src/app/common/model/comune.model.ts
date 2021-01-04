
export class Comune {
    public id: string;
    public provincia: string;

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
