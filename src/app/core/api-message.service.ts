import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class ApiMessageService {

    private _loading : boolean = false;

    // Messaggi emessi dagli api services
    public onApiMessage = new Subject<ApiMessage>();

    // Loader component
    public onLoad = new Subject<boolean>();

    public sendMessage(type: MessageType, message: string) {
        this.onApiMessage.next(new ApiMessage(type, message));
    }

    public start() {
        this._loading = true;
    }

    public complete() {
        this._loading = false;
    }

    get isLoading(): boolean {
        return this._loading;
    }

}

export class ApiMessage {
    constructor(public type: MessageType, public message: string) {}
}

export enum MessageType {
    ERROR,
    SUCCESS,
    WARNING
}
