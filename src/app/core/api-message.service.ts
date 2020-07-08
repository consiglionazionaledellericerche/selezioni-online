import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class ApiMessageService {

    // Messaggi emessi dagli api services
    public onApiMessage = new Subject<ApiMessage>();

    // Loader component
    public onLoad = new Subject<boolean>();

    public sendMessage(type: MessageType, message: string) {
        this.onApiMessage.next(new ApiMessage(type, message));
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
