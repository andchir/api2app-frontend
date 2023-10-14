import {NameValueStringObject} from './name-value-string-object.interface';

export interface ApiItem {
    name: string;
    requestMethod: string;
    requestUrl: string;
    basicAuth: boolean;
    responseJson: string;
    bodyDataSource: 'fields'|'raw';
    bodyFields: NameValueStringObject[];
    headers: NameValueStringObject[];
    bodyJson: string;
}
