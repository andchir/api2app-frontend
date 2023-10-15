import { RequestDataField } from './request-data-field.interface';
import { NameValueStringObject } from './name-value-string-object.interface';

export interface ApiItem {
    name: string;
    requestMethod: string;
    requestUrl: string;
    basicAuth: boolean;
    bodyDataSource: 'fields'|'raw';
    authLogin: string;
    authPassword: string;

    bodyFields: RequestDataField[];
    bodyJson: string;
    headers: RequestDataField[];

    responseBody: string;
    responseHeaders: NameValueStringObject[];
    responseContentType: string;
}
