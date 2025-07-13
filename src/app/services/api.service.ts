import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, isDevMode, LOCALE_ID } from '@angular/core';
import { BASE_URL } from '../../environments/environment';

import { catchError, iif, Observable } from 'rxjs';

import { ApiItem } from '../apis/models/api-item.interface';
import { RequestDataField } from '../apis/models/request-data-field.interface';
import { DataService } from './data.service.abstract';
import { VkAppOptions } from '../apps/models/vk-app-options.interface';

@Injectable()
export class ApiService extends DataService<ApiItem> {

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        httpClient: HttpClient
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

    applyInnerParams(data: any, innerValues: any = null): any {
        const {outData, innerOptions, innerData} = this.getInnerParams(data);
        if (typeof innerValues === 'object') {
            Object.assign(innerData, innerValues);
        }
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
                            return this.applyInnerParams(item, innerData);
                        }
                        return item;
                    });
                } else {
                    outData[outKey] = this.applyInnerParams(outData[outKey], innerData);
                }
            } else if (typeof outData[outKey] === 'string') {
                for (const dKey of Object.keys(innerData)) {
                    outData[outKey] = outData[outKey].replace(`{${dKey}}`, innerData[dKey]);
                }
            }
        }
        return outData;
    }

    apiRequest(data: ApiItem, isApiTesting = true, vkAppOptions?: VkAppOptions): Observable<HttpResponse<any>> {
        let requestUrl = data.requestUrl;
        let requestMethod = data.requestMethod;
        const bodyDataSource = data.bodyDataSource;
        const sendAsFormData = (data?.sendAsFormData || false) && bodyDataSource === 'fields';

        if (data.sender === 'server') {
            requestUrl = isApiTesting ? `${BASE_URL}api/v1/proxy` : `${BASE_URL}api/v1/inference`;
            requestMethod = 'POST';
        }

        // Headers
        const headersData: {[header: string]: string} = {};
        data.headers.forEach((item) => {
            if (item.name && item.value && !item.hidden) {
                headersData[item.name] = String(item.value);
            }
        });
        if (data.basicAuth && data.authLogin && data.authPassword && data.sender !== 'server') {
            const authToken = btoa(`${data.authLogin}:${data.authPassword}`);
            headersData['Authorization'] = `Basic ${authToken}`;
        }

        if (sendAsFormData) {
            // headersData['Enctype'] = 'multipart/form-data';
            // headersData['Content-Type'] = 'application/x-www-form-urlencoded';
            delete headersData['Content-Type'];
            delete headersData['content-Type'];
        }

        // Request body
        const bodyContent = data.requestContentType === 'json' && data.bodyContent
            ? JSON.parse(data.bodyContent)
            : data.bodyContent || null;
        const bodyContentFlatten = data.requestContentType === 'json' && data.bodyContentFlatten
            ? JSON.parse(data.bodyContentFlatten)
            : {};
        const formData = new FormData();
        const bodyRaw = bodyDataSource === 'raw' ? bodyContent : null;
        const bodyRawFlatten = bodyDataSource === 'raw' ? bodyContentFlatten : null;
        let body: any = null;
        if (bodyDataSource === 'fields') {
            body = {};
            const vkDataField = data.bodyFields.find((item) => {
                return item.name === 'opt_vk_data';
            });
            // Inject VK data
            if (vkDataField && vkDataField.value) {
                let dataField = data.bodyFields.find((field) => {
                    return field.name === 'data';
                });
                if (!dataField) {
                    dataField = {name: 'data', value: '', hidden: false};
                    data.bodyFields.push(dataField);
                }
                if (dataField.value !== '[RAW]') {
                    const vkData = JSON.parse(vkDataField.value as string) || {};
                    dataField.value = dataField.value
                        ? JSON.stringify(Object.assign({}, {'input': dataField.value}, vkData))
                        : JSON.stringify(vkData);
                }
            }
            data.bodyFields.forEach((item) => {
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
                if (data.sendAsFormData) {
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
        data.queryParams.forEach((item) => {
            if (!item.value || item.hidden) {
                return;
            }
            queryParams[item.name] = item.value;
        });

        const requestHeaders = data.sender === 'server'
            ? (headersData['Content-Type'] ? {'Content-Type': headersData['Content-Type']} : {})
            : Object.assign({}, headersData);

        if (headersData['Accept']) {
            delete headersData['Accept'];
        }
        if (headersData['Content-Type']) {
            delete headersData['Content-Type'];
        }

        if (data.sender === 'server') {
            if (sendAsFormData) {
                formData.append('opt__uuid', data.uuid || '');
                formData.append('opt__queryParams', Object.keys(queryParams).join(','));

                if (data?.urlPartIndex !== null && data?.urlPartValue) {
                    formData.append('opt__urlPartIndex', String(data.urlPartIndex));
                    formData.append('opt__urlPartValue', String(data.urlPartValue));
                }

                if (data?.basicAuth && data?.authLogin && data?.authPassword) {
                    formData.append('opt__basicAuth', data.basicAuth ? '1' : '0');
                    formData.append('opt__authLogin', data.authLogin);
                    formData.append('opt__authPassword', data.authPassword);
                }
                formData.append('opt__headers', Object.keys(headersData).join(','));
                formData.append('opt__headers_values', Object.values(headersData).join(','));
                if (isApiTesting) {
                    formData.append('opt__requestUrl', data?.requestUrl || '');
                    formData.append('opt__requestMethod', data?.requestMethod || 'GET');
                    formData.append('opt__responseContentType', data?.responseContentType || '');
                    formData.append('opt__sendAsFormData', data?.sendAsFormData ? '1' : '0');
                }
                if (vkAppOptions?.appLaunchParamsJson) {
                    formData.append('opt__vk_app_launch_params', vkAppOptions.appLaunchParamsJson);
                }
            } else {
                body = Object.assign({}, {
                    body,
                    bodyRaw,
                    bodyRawFlatten,
                    queryParams: Object.assign({}, queryParams),
                    opt__uuid: data?.uuid
                });
                if (vkAppOptions?.appLaunchParamsJson) {
                    body.opt__vk_app_launch_params = vkAppOptions.appLaunchParamsJson;
                }
                if (data?.urlPartIndex !== null && data?.urlPartValue) {
                    Object.assign(body, {
                        opt__urlPartIndex: data.urlPartIndex,
                        opt__urlPartValue: data.urlPartValue
                    });
                }
                if (data?.basicAuth && data?.authLogin && data?.authPassword) {
                    Object.assign(body, {
                        opt__basicAuth: true,
                        opt__authLogin: data.authLogin,
                        opt__authPassword: data.authPassword
                    });
                }
                if (isApiTesting) {
                    Object.assign(body, {
                        headers: Object.assign({}, headersData),
                        opt__requestUrl: data?.requestUrl,
                        opt__requestMethod: data?.requestMethod,
                        opt__responseContentType: data?.responseContentType,
                        opt__sendAsFormData: data?.sendAsFormData
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

        if (data.sender !== 'server' && !sendAsFormData) {
            requestData = this.applyInnerParams(requestData);
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
