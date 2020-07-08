import {JsonConverter, JsonCustomConvert} from 'json2typescript';
import { DatePipe } from '@angular/common';

@JsonConverter
export class ISODateConverter implements JsonCustomConvert<Date> {
    serialize(date: Date): any {
        return new DatePipe('en-US').transform(date,"yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ");
    }
    deserialize(date: any): Date {
        return new Date(date);
    }
}