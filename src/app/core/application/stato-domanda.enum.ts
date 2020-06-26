import { EnumConverter } from "../../common/helpers/EnumConverter";

export enum StatoDomanda {
    CONFERMATA = 'C', 
    INIZIALE = 'I', 
    PROVVISORIA = 'P', 
    ESCLUSA = 'E',
    RINUNCIA = 'R', 
    SCHEDA_ANONIMA_RESPINTA = 'S', 
    NON_AMMESSO = 'N',
    SOSPESA = 'A'
}

export class PropertyStatoDomandaConverter extends EnumConverter<StatoDomanda> {
    constructor() {
        super(StatoDomanda);
    }
}