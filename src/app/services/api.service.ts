import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { environment } from '../../environments/environment';

import { catchError, iif, Observable } from 'rxjs';

import { ApiItem } from '../apis/models/api-item.interface';
import { RequestDataField } from '../apis/models/request-data-field.interface';
import { DataService } from './data.service.abstract';

const BASE_URL = environment.apiUrl;

@Injectable()
export class ApiService extends DataService<ApiItem> {

    constructor(
        httpClient: HttpClient
    ) {
        super(httpClient);
        this.requestUrl = `${BASE_URL}api_items`;
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
                headersData[item.name] = item.value;
                if (item.name.toLowerCase() === 'accept' && item.value.includes('/')) {
                    responseTypeValue = item.value.split('/')[1];
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
            requestUrl = `${BASE_URL}proxy`;
            requestMethod = 'POST';
        }

        // Headers
        const headersData: {[header: string]: string} = {};
        data.headers.forEach((item) => {
            if (item.name && item.value && !item.hidden) {
                headersData[item.name] = item.value;
            }
        });
        if (data.basicAuth) {
            const authToken = btoa(`${data.authLogin}:${data.authPassword}`);
            headersData['Authorization'] = `Basic ${authToken}`;
        }

        if (sendAsFormData) {
            headersData['Enctype'] = 'multipart/form-data';
            delete headersData['Content-Type'];
            delete headersData['content-Type'];
            // headersData['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        // Request body
        const formData = new FormData();
        let body: any = data.bodyDataSource === 'raw'
            ? data.requestContentType === 'json' ? JSON.parse(data.bodyContent || '{}') : data.bodyContent
            : {};
        if (data.bodyDataSource === 'fields') {
            body = {};
            data.bodyFields.forEach((item) => {
                if (item.name && (item.value || item.file) && !item.hidden) {
                    body[item.name] = item.value || '';
                    if (data.sendAsFormData) {
                        if (item.isFile) {
                            if (item.file) {
                                formData.append(item.name, item.file || '');
                            } else {
                                if (Array.isArray(item.value)) {
                                    item.value.forEach((file) => {
                                        formData.append((item.value.length > 1 ? `${item.name}[]` : item.name), file);
                                    });
                                } else {
                                    formData.append(item.name, item.value || '');
                                }
                            }
                        } else {
                            formData.append(item.name, item.value || '');
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
                    data: body,
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
                headersData['X-CSRFToken'] = csrfToken || window['csrf_token'] || '';
                headersData['Mode'] = 'same-origin';
            }
        }

        const headers = new HttpHeaders(headersData);
        const requestData = sendAsFormData ? formData : body;
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
        const url = `${BASE_URL}proxy`;
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
            delete item.file;
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
                if (((fileLoadedEvent.target?.result || '') as string).indexOf('{') === 0) {
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
            if (['image', 'audio'].includes(contentType)) {
                fileReader.readAsDataURL(blob);
            } else {
                fileReader.readAsText(blob);
            }
        });
    }

    getCookie(name: string|null): string {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    searchItems(search: string): Observable<{count: number, results: ApiItem[]}> {
        const url = this.requestUrl;
        const params = this.createParams({search});
        return this.httpClient.get<{count: number, results: ApiItem[]}>(url, Object.assign({}, this.httpOptions, {params}))
            .pipe(
                catchError(this.handleError)
            );
    }
}
