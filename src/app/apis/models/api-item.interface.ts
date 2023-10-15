import { RequestDataField } from './request-data-field.interface';
import { NameValueStringObject } from './name-value-string-object.interface';

export interface ApiItem {
    name: string;
    requestMethod: string;
    requestUrl: string;
    basicAuth: boolean;
    responseBody: string;
    responseHeaders: NameValueStringObject[];
    responseContentType: string;
    bodyDataSource: 'fields'|'raw';
    bodyFields: RequestDataField[];
    headers: RequestDataField[];
    bodyJson: string;
}
