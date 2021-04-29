import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import { LoadingState } from '../auth/loading-state.enum';

@Injectable()
export class ApiMessageService {
    private loadingEventSource: Subject<LoadingState> = new Subject();
    // Observable LoadingState streams
    loadingEvent$ = this.loadingEventSource.asObservable();
  
    // Messaggi emessi dagli api services
    public onApiMessage = new Subject<ApiMessage>();

    // Loader component
    public onLoad = new Subject<boolean>();

    public sendMessage(type: MessageType, message: string) {
        this.onApiMessage.next(new ApiMessage(type, message));
    }

    public addLoading(loadingState: LoadingState) {
        this.loadingEventSource.next(loadingState);
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
