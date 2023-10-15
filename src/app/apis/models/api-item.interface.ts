import { RequestDataField } from './request-data-field.interface';
import { NameValueStringObject } from './name-value-string-object.interface';

export interface ApiItem {
    name: string;
    requestMethod: string;
    requestUrl: string;
    basicAuth: boolean;
    responseJson: string;
    responseHeaders: NameValueStringObject[];
    bodyDataSource: 'fields'|'raw';
    bodyFields: RequestDataField[];
    headers: RequestDataField[];
    bodyJson: string;
}
