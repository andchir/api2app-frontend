import { RequestDataField } from './request-data-field.interface';
import { NameValueStringObject } from './name-value-string-object.interface';

export interface ApiItem {
    id: number;
    name: string;
    requestMethod: string;
    requestUrl: string;
    requestContentType: string;
    basicAuth: boolean;
    bodyDataSource: 'fields'|'raw';
    authLogin: string;
    authPassword: string;
    sendAsFormData: boolean;

    bodyFields: RequestDataField[];
    bodyContent: string;
    headers: RequestDataField[];

    responseBody: string;
    responseHeaders: NameValueStringObject[];
    responseContentType: string;

    uuid: string;
    shared: boolean;
}
