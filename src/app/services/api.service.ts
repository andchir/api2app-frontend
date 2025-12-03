import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, isDevMode, LOCALE_ID } from '@angular/core';
import { BASE_URL } from '../../environments/environment';

import { catchError, iif, Observable } from 'rxjs';
import { SseClient } from 'ngx-sse-client';

import { ApiItem } from '../apis/models/api-item.interface';
import { RequestDataField } from '../apis/models/request-data-field.interface';
import { DataService } from './data.service.abstract';
import { VkAppOptions } from '../apps/models/vk-app-options.interface';

@Injectable()
export class ApiService extends DataService<ApiItem> {

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        httpClient: HttpClient,
        private sseClient: SseClient
    ) {
        super(httpClient);
        this.requestUrl = `${BASE_URL}${this.locale}/api/v1/api_items`;
    }

    static getDefault(): ApiItem {
        return {
            id: 0,
            name: '',
            uuid: '',
            shared: false,
            hidden: false,
            requestMethod: 'GET',
            requestUrl: 'https://httpbin.org/json',
            requestContentType: 'json',
            basicAuth: false,
            sendAsFormData: false,
            dailyLimitUsage: 0,
            dailyLimitForUniqueUsers: false,
            paidOnly: false,
            stream: false,
            pricePerUse: 0,
            responseBody: '',
            responseHeaders: [],
            responseContentType: 'json',
            bodyDataSource: 'fields',
            sender: 'browser',
            authLogin: '',
            authPassword: '',
            bodyFields: [
                {name: '', value: ''}
            ],
            headers: [
                {name: 'Content-Type', value: 'application/json'},
                {name: 'Accept', value: 'application/json'},
                // {name: 'Access-Control-Allow-Origin', value: '*'},
                {name: '', value: ''}
            ],
            queryParams: [
                {name: '', value: ''}
            ],
            bodyContent: '',
            bodyContentFlatten: '',
            bodyContentPrivate: false
        };
    }

    static getPropertiesRecursively(data: any, string: string = '', outputKeys = [], values = []): {
        outputKeys: string[],
        values: string|number|boolean[]
    } {
        if (typeof data === 'object') {
            if (Array.isArray(data)) {
                data.forEach((item, index) => {
                    outputKeys.push(string + (string ? '.' : '') + index);
                    values.push(item);
                    this.getPropertiesRecursively(item, string + (string ? '.' : '') + index, outputKeys, values);
                });
            } else {
                for (let prop in data) {
                    if (this.isJson(data[prop])) {
                        data[prop] = JSON.parse(data[prop]);
                    }
                    if (typeof data[prop] === 'object') {
                        outputKeys.push(string + (string ? '.' : '') + prop);
                        values.push(data[prop]);
                        this.getPropertiesRecursively(data[prop], string + (string ? '.' : '') + prop, outputKeys, values);
                    } else {
                        outputKeys.push(string + (string ? '.' : '') + prop);
                        values.push(data[prop]);
                    }
                }
            }
        }
        return {outputKeys, values};
    }

    static getPropertiesKeyValueObject(outputKeys: string[], values: string|number|boolean[]): {[key: string]: string|number|boolean} {
        const output = {};
        outputKeys.forEach((value, index) => {
            output[value] = values[index];
        });
        return output;
    }

    static isJson(str: any): boolean {
        if (typeof str !== 'string' || !str.match(/^[\[{]/)) {
            return false;
        }
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    static getCurrentDateISO(): string {
        return new Date().toISOString().split('T')[0];
    }

    static getUserSessionId(app_uuid: string, dayMode = false): string {
        let sessionId = window.localStorage.getItem(`session-${app_uuid}`);
        const currentDate = ApiService.getCurrentDateISO();
        if (sessionId) {
            return dayMode ? `${currentDate}-${sessionId}` : sessionId;
        }
        sessionId = ApiService.generateFallbackUUID();
        window.localStorage.setItem(`session-${app_uuid}`, sessionId);
        return dayMode ? `${currentDate}-${sessionId}` : sessionId;
    }

    static generateFallbackUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static getApiRequestUrl(apiItem: ApiItem, isApiTesting = false): string {
        if (apiItem.sender === 'server') {
            return isApiTesting ? `${BASE_URL}api/v1/proxy` : `${BASE_URL}api/v1/inference`;
        }
        return apiItem.requestUrl;
    }

    static getApiRequestMethod(apiItem: ApiItem): string {
        if (apiItem.sender === 'server') {
            return 'POST';
        }
        return apiItem.requestMethod;
    }

    static getApiHeaders(apiItem: ApiItem): {[key: string]: string} {
        const headersData: {[header: string]: string} = {};
        apiItem.headers.forEach((item) => {
            if (item.name && item.value && !item.hidden) {
                headersData[item.name] = String(item.value);
            }
        });
        if (apiItem.basicAuth && apiItem.authLogin && apiItem.authPassword && apiItem.sender !== 'server') {
            const authToken = btoa(`${apiItem.authLogin}:${apiItem.authPassword}`);
            headersData['Authorization'] = `Basic ${authToken}`;
        }
        return headersData;
    }

    getContentTypeFromHeaders(headers: RequestDataField[]): string {
        let responseTypeValue = 'json';
        const headersData: {[header: string]: string} = {};
        headers.forEach((item) => {
            if (item.name && item.value && !item.hidden) {
                headersData[item.name] = String(item.value);
                if (item.name.toLowerCase() === 'accept' && String(item.value).includes('/')) {
                    responseTypeValue = String(item.value).split('/')[1];
                }
            }
        });
        return responseTypeValue;
    }

    getInnerParams(data: any): any {
        const outData = {};
        const innerOptions = {};
        const innerData = {};
        for (const key of Object.keys(data)) {
            if (key === '__inner') {
                Object.assign(innerData, data[key]);
            } else if (key.includes('__')) {
                innerOptions[key.replace('__', '')] = data[key];
            } else {
                outData[key] = data[key];
            }
        }
        return {outData, innerOptions, innerData};
    }

    applyInnerParams(app_uuid: string, data: any, innerValues: any = null, useRequestData = true): any {
        const {outData, innerOptions, innerData} = useRequestData
            ? this.getInnerParams(data)
            : {outData: data, innerOptions: {}, innerData: {}};
        if (typeof innerValues === 'object') {
            Object.assign(innerData, innerValues);
        }
        Object.assign(innerData, {
            'SESSION_ID': ApiService.getUserSessionId(app_uuid),
            'DATE_SESSION_ID': ApiService.getUserSessionId(app_uuid, true)
        });
        if (Object.keys(innerOptions).length > 0) {
            for (const key of Object.keys(outData)) {
                for (const optKey of Object.keys(innerOptions)) {
                    if (!optKey.includes(`${key}:`)) {
                        continue;
                    }
                    const [mainKey, optsStr] = optKey.split(':');
                    for (const dKey of Object.keys(innerData)) {
                        if (optsStr.includes(`${dKey}=${innerData[dKey]}`)) {
                            outData[mainKey] = innerOptions[optKey];
                        }
                    }
                }
            }
        }
        for (const outKey of Object.keys(outData)) {
            if (typeof outData[outKey] === 'object') {
                if (Array.isArray(outData[outKey])) {
                    outData[outKey] = outData[outKey].map((item) => {
                        if (typeof item === 'object' && !Array.isArray(item)) {
                            return this.applyInnerParams(app_uuid, item, innerData);
                        }
                        if (typeof item === 'string') {
                            return this.replaceData(item, innerData);
                        }
                        return item;
                    });
                } else {
                    outData[outKey] = this.applyInnerParams(app_uuid, outData[outKey], innerData);
                }
            } else if (typeof outData[outKey] === 'string') {
                outData[outKey] = this.replaceData(outData[outKey], innerData);
            }
        }
        return outData;
    }

    replaceData(inputString: string, innerData: any): any {
        for (const dKey of Object.keys(innerData)) {
            inputString = inputString.replace(`{${dKey}}`, innerData[dKey]);
        }
        return inputString;
    }

    apiRequest(appUuid: string, apiItem: ApiItem, isApiTesting = true, vkAppOptions?: VkAppOptions): Observable<HttpResponse<any>|Event> {
        const requestUrl = ApiService.getApiRequestUrl(apiItem, isApiTesting);
        const requestMethod = ApiService.getApiRequestMethod(apiItem);
        const bodyDataSource = apiItem.bodyDataSource;
        const sendAsFormData = (apiItem?.sendAsFormData || false) && bodyDataSource === 'fields';
        const headersData: {[header: string]: string} = ApiService.getApiHeaders(apiItem);

        if (sendAsFormData) {
            // headersData['Enctype'] = 'multipart/form-data';
            // headersData['Content-Type'] = 'application/x-www-form-urlencoded';
            delete headersData['Content-Type'];
            delete headersData['content-Type'];
        }

        // Request body
        const bodyContent = apiItem.requestContentType === 'json' && apiItem.bodyContent
            ? JSON.parse(apiItem.bodyContent)
            : apiItem.bodyContent || null;
        const bodyContentFlatten = apiItem.requestContentType === 'json' && apiItem.bodyContentFlatten
            ? JSON.parse(apiItem.bodyContentFlatten)
            : {};
        const formData = new FormData();
        const bodyRaw = bodyDataSource === 'raw' ? bodyContent : null;
        const bodyRawFlatten = bodyDataSource === 'raw' ? bodyContentFlatten : null;
        let body: any = null;
        if (bodyDataSource === 'fields') {
            body = {};
            const vkDataField = apiItem.bodyFields.find((item) => {
                return item.name === 'opt_vk_data';
            });
            // Inject VK data
            if (vkDataField && vkDataField.value) {
                let dataField = apiItem.bodyFields.find((field) => {
                    return field.name === 'data';
                });
                if (!dataField) {
                    dataField = {name: 'data', value: '', hidden: false};
                    apiItem.bodyFields.push(dataField);
                }
                if (dataField.value !== '[RAW]') {
                    const vkData = JSON.parse(vkDataField.value as string) || {};
                    dataField.value = dataField.value
                        ? JSON.stringify(Object.assign({}, {'input': dataField.value}, vkData))
                        : JSON.stringify(vkData);
                }
            }
            apiItem.bodyFields.forEach((item) => {
                if (!item.name || item.name === 'opt_vk_data' || item.hidden || (typeof item.value === 'string' && !item.value && !item.files)) {
                    return;
                }
                let value = typeof item.value === 'string'
                    ? (item.value || '')
                    : item.value;
                if (!sendAsFormData && typeof value === 'string') {
                    if (value === '[]') {
                        value = [];
                    } else if (['true', 'false'].includes(String(value))) {
                        value = value === 'true';
                    } else if (!Number.isNaN(Number(value))) {
                        value = Number(value);
                    }
                }
                body[item.name] = value;
                if (apiItem.sendAsFormData) {
                    if (item.isFile) {
                        if (item.files) {
                            if (Array.isArray(item.files)) {
                                item.files.forEach((file) => {
                                    formData.append(item.name, file, file.name);
                                });
                            }
                        } else {
                            if (Array.isArray(item.value)) {
                                item.value.forEach((file) => {
                                    formData.append(item.name, file);
                                });
                            } else {
                                if ((item.value as any) instanceof File) {
                                    formData.append(item.name, (item.value as any));
                                }
                                else {
                                    formData.append(item.name, String(item.value || ''));
                                }
                            }
                        }
                    } else {
                        if (item.value === '[RAW]') {
                            // Inject VK data
                            if (vkDataField && vkDataField.value && typeof vkDataField.value === 'string') {
                                const vkData = JSON.parse(vkDataField.value as string);
                                if (vkData) {
                                    Object.assign(bodyContent, vkData);
                                }
                            }
                            formData.append('opt__body', JSON.stringify(bodyContent));
                        }
                        formData.append(item.name, String(item.value) || '');
                    }
                }
            });
        }

        // Query parameters
        let queryParams = {};
        apiItem.queryParams.forEach((item) => {
            if (!item.value || item.hidden) {
                return;
            }
            queryParams[item.name] = item.value;
        });

        const requestHeaders = apiItem.sender === 'server'
            // ? (headersData['Content-Type'] ? {'Content-Type': headersData['Content-Type']} : {})
            ? (!sendAsFormData ? {'Content-Type': 'application/json'} : {})
            : Object.assign({}, headersData);

        if (!isApiTesting) {
            if (headersData['Accept']) {
                delete headersData['Accept'];
            }
            if (headersData['Content-Type']) {
                delete headersData['Content-Type'];
            }
        }

        if (apiItem.sender === 'server') {
            if (sendAsFormData) {
                formData.append('opt__uuid', apiItem.uuid || '');
                formData.append('opt__queryParams', Object.keys(queryParams).join(','));

                if (apiItem?.urlPartIndex !== null && apiItem?.urlPartValue) {
                    formData.append('opt__urlPartIndex', String(apiItem.urlPartIndex));
                    formData.append('opt__urlPartValue', String(apiItem.urlPartValue));
                }

                if (apiItem?.basicAuth && apiItem?.authLogin && apiItem?.authPassword) {
                    formData.append('opt__basicAuth', apiItem.basicAuth ? '1' : '0');
                    formData.append('opt__authLogin', apiItem.authLogin);
                    formData.append('opt__authPassword', apiItem.authPassword);
                }
                formData.append('opt__headers', Object.keys(headersData).join(','));
                formData.append('opt__headers_values', Object.values(headersData).join(','));
                if (isApiTesting) {
                    formData.append('opt__requestUrl', apiItem?.requestUrl || '');
                    formData.append('opt__requestMethod', apiItem?.requestMethod || 'GET');
                    formData.append('opt__responseContentType', apiItem?.responseContentType || '');
                    formData.append('opt__sendAsFormData', apiItem?.sendAsFormData ? '1' : '0');
                }
                if (vkAppOptions?.appLaunchParamsJson) {
                    formData.append('opt__vk_app_launch_params', vkAppOptions.appLaunchParamsJson);
                }
                formData.append('opt__session_id', ApiService.getUserSessionId(appUuid));
                formData.append('opt__date_session_id', ApiService.getUserSessionId(appUuid, true));
            } else {
                body = Object.assign({}, {
                    body,
                    bodyRaw,
                    bodyRawFlatten,
                    queryParams: Object.assign({}, queryParams),
                    opt__uuid: apiItem?.uuid,
                    opt__session_id: ApiService.getUserSessionId(appUuid),
                    opt__date_session_id: ApiService.getUserSessionId(appUuid, true)
                });
                if (vkAppOptions?.appLaunchParamsJson) {
                    body.opt__vk_app_launch_params = vkAppOptions.appLaunchParamsJson;
                }
                if (apiItem?.urlPartIndex !== null && apiItem?.urlPartValue) {
                    Object.assign(body, {
                        opt__urlPartIndex: apiItem.urlPartIndex,
                        opt__urlPartValue: apiItem.urlPartValue
                    });
                }
                if (apiItem?.basicAuth && apiItem?.authLogin && apiItem?.authPassword) {
                    Object.assign(body, {
                        opt__basicAuth: true,
                        opt__authLogin: apiItem.authLogin,
                        opt__authPassword: apiItem.authPassword
                    });
                }
                if (isApiTesting) {
                    Object.assign(body, {
                        headers: Object.assign({}, headersData),
                        opt__requestUrl: apiItem?.requestUrl,
                        opt__requestMethod: apiItem?.requestMethod,
                        opt__responseContentType: apiItem?.responseContentType,
                        opt__sendAsFormData: apiItem?.sendAsFormData
                    });
                } else {
                    Object.assign(body, {
                        headers: Object.assign({}, headersData)
                    });
                }
            }
            if (!isDevMode()) {
                const csrfToken = DataService.getCookie('csrftoken');
                requestHeaders['X-CSRFToken'] = csrfToken || window['csrf_token'] || '';
                requestHeaders['Mode'] = 'same-origin';
            }
        }

        const headers = new HttpHeaders(requestHeaders);
        let requestData = sendAsFormData ? formData : (body || bodyRaw);
        const responseType = 'blob';
        const params = this.createParams(queryParams);

        // Apply template
        if (apiItem.sender !== 'server' && !sendAsFormData) {
            requestData = this.applyInnerParams(appUuid, requestData);
        }

        // Stream mode
        if (apiItem.stream) {
            return this.sseClient.stream(requestUrl, {
                keepAlive: false,
                responseType: 'event'
            }, { headers, params, body: requestData }, requestMethod);
        }

        let httpRequest;
        switch (requestMethod) {
            case 'POST':
                httpRequest = this.httpClient.post(requestUrl, requestData, {headers, responseType, params, observe: 'response'});
                break;
            case 'PUT':
                httpRequest = this.httpClient.put(requestUrl, requestData, {headers, responseType, params, observe: 'response'});
                break;
            case 'PATCH':
                httpRequest = this.httpClient.patch(requestUrl, requestData, {headers, responseType, params, observe: 'response'});
                break;
            case 'DELETE':
                httpRequest = this.httpClient.delete(requestUrl, {headers, responseType, params, observe: 'response'});
                break;
            case 'HEAD':
            case 'OPTIONS':
            case 'PURGE':
                httpRequest = this.httpClient.request(requestMethod, requestUrl, {headers, responseType, params, observe: 'response'});
                break;
            default:
                httpRequest = this.httpClient.get(requestUrl, {headers, responseType, params, observe: 'response'});
        }

        return httpRequest;
    }

    apiRequestByProxy(data: any): Observable<HttpResponse<any>> {
        const url = `${BASE_URL}api/v1/proxy`;
        const csrfToken = '';// DataService.getCookie('csrftoken');
        // console.log('csrfToken', csrfToken);
        // console.log('window.csrf_token', window['csrf_token']);
        let headers;
        if (isDevMode()) {
            headers = new HttpHeaders({
                'Content-Type': 'application/json'
            });
        } else {
            headers = new HttpHeaders({
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || window['csrf_token'] || '',
                'Mode': 'same-origin'
            });
        }
        const responseType = 'blob';
        return this.httpClient.post(url, data, {headers, responseType, observe: 'response'});
    }

    override updateItem(apiItem: ApiItem): Observable<ApiItem> {
        apiItem = JSON.parse(JSON.stringify(apiItem));// Clone object
        apiItem.bodyFields = apiItem.bodyFields.map((item) => {
            if (typeof item.hidden === 'undefined') {
                item.hidden = false;
            }
            if (typeof item.private === 'undefined') {
                item.private = false;
            }
            delete item.files;
            return item;
        });
        apiItem.headers = apiItem.headers.map((item) => {
            if (typeof item.hidden === 'undefined') {
                item.hidden = false;
            }
            if (typeof item.private === 'undefined') {
                item.private = false;
            }
            return item;
        });
        if (['image', 'audio'].includes(apiItem.responseContentType)) {
            apiItem.responseBody = '';
        }
        return iif(
            () => !!apiItem.id,
            this.putItem(apiItem, apiItem.id),
            this.postItem(apiItem)
        )
    }

    getRawDataFields(apiItem: ApiItem): string[] {
        if (!apiItem) {
            return [];
        }
        const output = apiItem.bodyFields.map((item) => {
            return !item.hidden && item.value === '[RAW]' ? item['name'] : '';
        });
        return output.filter((name) => {
            return name;
        });
    }

    getDataFromBlob(blob: Blob, contentType = 'json'): Promise<any> {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = (fileLoadedEvent) => {
                if (['[', '{'].includes(((fileLoadedEvent.target?.result || '') as string).substring(0, 1))) {
                    try {
                        const responseData = JSON.parse((fileLoadedEvent.target?.result || '[]') as string);
                        resolve(responseData);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    resolve(fileLoadedEvent.target?.result || '');
                }
            };
            if (contentType.includes('audio/')
                || contentType.includes('image/')
                || ['image', 'audio'].includes(contentType)) {
                    fileReader.readAsDataURL(blob);
            } else {
                fileReader.readAsText(blob);
            }
        });
    }

    searchItems(search: string): Observable<{count: number, results: ApiItem[]}> {
        const url = this.requestUrl;
        const params = this.createParams({search});
        return this.httpClient.get<{count: number, results: ApiItem[]}>(url, Object.assign({}, this.httpOptions, {params}))
            .pipe(
                catchError(this.handleError)
            );
    }

    importItem(inputString: string, inputLink: string = ''): Observable<{success: boolean}> {
        const url = `${BASE_URL}${this.locale}/api/v1/api_import_from_curl`;
        return this.httpClient.post<{success: boolean}>(url, {inputString, inputLink}, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    cloneItem(uuid: string): Observable<{success: boolean}> {
        const url = `${this.requestUrl}/${uuid}/clone`
        return this.httpClient.post<{success: boolean}>(url, {}, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }
}
