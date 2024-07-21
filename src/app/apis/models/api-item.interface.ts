import { RequestDataField } from './request-data-field.interface';
import { NameValueStringObject } from './name-value-string-object.interface';
import { User } from './user.interface';

export interface ApiItem {
    id: number;
    name: string;
    requestMethod: string;
    requestUrl: string;
    requestContentType: string;
    basicAuth: boolean;
    bodyDataSource: 'fields'|'raw';
    sender: 'server'|'browser';
    authLogin: string;
    authPassword: string;
    sendAsFormData: boolean;
    dailyLimitUsage: number;
    dailyLimitForUniqueUsers: boolean;

    bodyFields: RequestDataField[];
    bodyContent: string;
    headers: RequestDataField[];
    queryParams: RequestDataField[];

    responseBody: string;
    responseHeaders: NameValueStringObject[];
    responseContentType: string;

    uuid: string;
    shared: boolean;
    hidden: boolean;
    url?: string;
    method?: string;

    user?: User;
}
