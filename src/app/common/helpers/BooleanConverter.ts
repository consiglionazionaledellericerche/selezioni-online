import {JsonConverter, JsonCustomConvert} from 'json2typescript';
import { isBoolean } from 'util';

@JsonConverter
export class BooleanConverter implements JsonCustomConvert<boolean> {
    serialize(param: boolean): boolean {
        return param;
    }

    deserialize(param: any): boolean {
        if (isBoolean(param))
            return param;
        return param === 'true' ? true : false;
    }
}