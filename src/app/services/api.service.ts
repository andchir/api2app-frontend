import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiItem } from '../apis/models/api-item.interface';
import {RequestDataField} from "../apis/models/request-data-field.interface";

@Injectable()
export class ApiService {

    constructor(
        public httpClient: HttpClient
    ) {

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
        const headers = new HttpHeaders(headersData);
        const responseType = 'blob';

        // Get request body
        let body: any = data.bodyDataSource === 'raw' ? (data.bodyJson || '') : {};
        if (data.bodyDataSource === 'fields') {
            body = {};
            data.bodyFields.forEach((item) => {
                if (item.name && item.value && !item.hidden) {
                    body[item.name] = item.value;
                }
            });
        }

        let httpRequest;
        switch (data.requestMethod) {
            case 'POST':
                httpRequest = this.httpClient.post(data.requestUrl, {body}, {headers, responseType, observe: 'response'});
                break;
            case 'PUT':
                httpRequest = this.httpClient.put(data.requestUrl, {body}, {headers, responseType, observe: 'response'});
                break;
            case 'PATCH':
                httpRequest = this.httpClient.patch(data.requestUrl, {body}, {headers, responseType, observe: 'response'});
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

    getDataFromBlob(blob: Blob): Promise<any> {
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
            fileReader.readAsText(blob);
        });
    }
}
