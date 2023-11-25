import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { iif, Observable } from 'rxjs';

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
            requestMethod: 'GET',
            requestUrl: 'http://httpbin.org/json',
            requestContentType: 'json',
            basicAuth: false,
            sendAsFormData: false,
            responseBody: '',
            responseHeaders: [],
            responseContentType: 'json',
            bodyDataSource: 'fields',
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
            bodyContent: ''
        };
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
        // Get headers
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
        if (data.sendAsFormData && !headersData['enctype']) {
            headersData['enctype'] = 'multipart/form-data';
        }

        // Get request body
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
                            formData.append(item.name, item.file || '');
                        } else {
                            formData.append(item.name, item.value || '');
                        }
                    }
                }
            });
        }

        const headers = new HttpHeaders(headersData);
        const requestData = data.sendAsFormData ? formData : body;
        const responseType = 'blob';

        let httpRequest;
        switch (data.requestMethod) {
            case 'POST':
                httpRequest = this.httpClient.post(data.requestUrl, requestData, {headers, responseType, observe: 'response'});
                break;
            case 'PUT':
                httpRequest = this.httpClient.put(data.requestUrl, requestData, {headers, responseType, observe: 'response'});
                break;
            case 'PATCH':
                httpRequest = this.httpClient.patch(data.requestUrl, requestData, {headers, responseType, observe: 'response'});
                break;
            case 'DELETE':
                httpRequest = this.httpClient.delete(data.requestUrl, {headers, responseType, observe: 'response'});
                break;
            case 'HEAD':
            case 'OPTIONS':
            case 'PURGE':
                httpRequest = this.httpClient.request(data.requestMethod, data.requestUrl, {headers, responseType, observe: 'response'});
                break;
            default:
                httpRequest = this.httpClient.get(data.requestUrl, {headers, responseType, observe: 'response'});
        }

        return httpRequest;
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
}
