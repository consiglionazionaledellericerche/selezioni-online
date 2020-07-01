import {JsonProperty, JsonObject} from 'json2typescript';
import { PropertyStatoDomandaConverter, StatoDomanda } from './stato-domanda.enum';
import { EsclusioneRiununcia, PropertyEsclusioneRiununciaConverter } from './esclusione-rinuncia.enum';

@JsonObject("ApplicationState")
export class ApplicationState  {
    @JsonProperty("stato_domanda", PropertyStatoDomandaConverter)
    public stato_domanda: string = undefined;
    @JsonProperty("esclusione_rinuncia", PropertyEsclusioneRiununciaConverter, true)
    public esclusione_rinuncia: string = undefined;
    @JsonProperty("count")
    public count: number = undefined;

    public isProvvisoria(): boolean {
        return this.stato_domanda === StatoDomanda.PROVVISORIA;
    }

    public isConfermata(): boolean {
        return this.stato_domanda === StatoDomanda.CONFERMATA;
    }

    public isSospesa(): boolean {
        return this.esclusione_rinuncia === EsclusioneRiununcia.SOSPESA;
    }

    public isNonAmmessa(): boolean {
        return this.esclusione_rinuncia === EsclusioneRiununcia.NON_AMMESSO;
    }

    public isRitirata(): boolean {
        return this.esclusione_rinuncia === EsclusioneRiununcia.RITIRATA;
    }

    public isEsclusa(): boolean {
        return this.esclusione_rinuncia !== undefined;
    }
    
    public getLabel(): string {
        if (this.isProvvisoria()) {
            return 'application.status.temporary';
        } else if (this.isConfermata() && !this.isEsclusa()) {
            return 'application.status.active';
        } else if (this.isEsclusa()) {
            if (this.isNonAmmessa()) {
                return 'application.status.not_admitted';
            } else if (this.isRitirata()) {
                return 'application.status.withdrawal';
            } else {
                return 'application.status.excluded';
            }
        }
    }
}
