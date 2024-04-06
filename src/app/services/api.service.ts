import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, isDevMode, LOCALE_ID } from '@angular/core';
import { BASE_URL } from '../../environments/environment';

import { catchError, iif, Observable } from 'rxjs';

import { ApiItem } from '../apis/models/api-item.interface';
import { RequestDataField } from '../apis/models/request-data-field.interface';
import { DataService } from './data.service.abstract';

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
            bodyContent: ''
        };
    }

    static getPropertiesRecursively(data: any, string: string = '', outputKeys = [], values = []): {outputKeys: string[], values: string|number|boolean[]} {
        if (typeof data === 'object') {
            if (!Array.isArray(data)) {
                for (let prop in data) {
                    if (typeof data[prop] === 'object') {
                        if (Array.isArray(data[prop])) {
                            outputKeys.push(string + (string ? '.' : '') + prop);
                            values.push(data[prop]);
                        } else {
                            this.getPropertiesRecursively(data[prop], string + (string ? '.' : '') + prop, outputKeys, values);
                        }
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

    apiRequest(data: ApiItem): Observable<HttpResponse<any>> {
        let requestUrl = data.requestUrl;
        let requestMethod = data.requestMethod;
        const sendAsFormData = data?.sendAsFormData || false;

        if (data.sender === 'server') {
            requestUrl = `${BASE_URL}api/v1/proxy`;
            requestMethod = 'POST';
        }

        // Headers
        const headersData: {[header: string]: string} = {};
        data.headers.forEach((item) => {
            if (item.name && item.value && !item.hidden) {
                headersData[item.name] = String(item.value);
            }
        });
        if (data.basicAuth && data.authLogin && data.authPassword) {
            const authToken = btoa(`${data.authLogin}:${data.authPassword}`);
            headersData['Authorization'] = `Basic ${authToken}`;
        }

        if (sendAsFormData) {
            // headersData['Enctype'] = 'multipart/form-data';
            delete headersData['Content-Type'];
            delete headersData['content-Type'];
            // headersData['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        // Request body
        const formData = new FormData();
        const bodyRaw = data.bodyDataSource === 'raw'
            ? data.requestContentType === 'json' ? JSON.parse(data.bodyContent || '{}') : data.bodyContent
            : null;
        let body: any = null;
        if (data.bodyDataSource === 'fields') {
            body = {};
            data.bodyFields.forEach((item) => {
                if (item.name && ((typeof item.value === 'string' && item.value) || typeof item.value !== 'string' || item.files) && !item.hidden) {
                    body[item.name] = typeof item.value === 'string' ? (item.value || '') : item.value;
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
                                    formData.append(item.name, String(item.value) || '');
                                }
                            }
                        } else {
                            formData.append(item.name, String(item.value) || '');
                        }
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

        const requestHeaders = {};
        if (data.sender === 'server') {
            if (sendAsFormData) {
                formData.append('opt__headers', Object.keys(headersData).join(','));
                formData.append('opt__queryParams', Object.keys(queryParams).join(','));
                formData.append('opt__uuid', data.uuid || '');
                formData.append('opt__requestUrl', data.requestUrl || '');
                formData.append('opt__requestMethod', data.requestMethod || 'GET');
                formData.append('opt__responseContentType', data.responseContentType || '');
                formData.append('opt__sendAsFormData', data.sendAsFormData ? '1' : '0');
            } else {
                body = Object.assign({}, {
                    body,
                    bodyRaw,
                    headers: Object.assign({}, headersData),
                    queryParams: Object.assign({}, queryParams),
                    opt__uuid: data?.uuid,
                    opt__requestUrl: data?.requestUrl,
                    opt__requestMethod: data?.requestMethod,
                    opt__responseContentType: data?.responseContentType,
                    opt__sendAsFormData: data?.sendAsFormData
                });
            }
            if (!isDevMode()) {
                const csrfToken = this.getCookie('csrftoken');
                requestHeaders['X-CSRFToken'] = csrfToken || window['csrf_token'] || '';
                requestHeaders['Mode'] = 'same-origin';
            }
        } else {
            Object.assign(requestHeaders, headersData);
        }

        const headers = new HttpHeaders(requestHeaders);
        const requestData = sendAsFormData ? formData : (body || bodyRaw);
        const responseType = 'blob';
        const params = this.createParams(queryParams);

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
        const csrfToken = this.getCookie('csrftoken');
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
            this.putItem(apiItem),
            this.postItem(apiItem)
        )
    }

    getDataFromBlob(blob: Blob, contentType = 'json'): Promise<any> {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = (fileLoadedEvent) => {
                if (['[', '{'].includes(((fileLoadedEvent.target?.result || '') as string).substring(0, 1))) {
                    try {
                        const errorData = JSON.parse((fileLoadedEvent.target?.result || '') as string);
                        resolve(errorData);
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

    importItem(inputString: string): Observable<{success: boolean}> {
        const url = `${BASE_URL}api/v1/api_import_from_curl`;
        return this.httpClient.post<{success: boolean}>(url, {inputString}, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }
}
