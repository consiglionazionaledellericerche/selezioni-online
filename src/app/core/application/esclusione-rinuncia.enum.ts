import { EnumConverter } from "../../common/helpers/EnumConverter";

export enum EsclusioneRiununcia {
    RITIRATA = 'R', 
    ESCLUSA = 'E',
    SCHEDA_ANONIMA_RESPINTA = 'S', 
    NON_AMMESSO = 'N',
    SOSPESA = 'A'
}

export class PropertyEsclusioneRiununciaConverter extends EnumConverter<EsclusioneRiununcia> {
    constructor() {
        super(EsclusioneRiununcia);
    }
}