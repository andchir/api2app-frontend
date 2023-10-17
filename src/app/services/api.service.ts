import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';

import { catchError, Observable, throwError } from 'rxjs';

import { ApiItem } from '../apis/models/api-item.interface';
import { RequestDataField } from "../apis/models/request-data-field.interface";

@Injectable()
export class ApiService {

    readonly BASE_URL = environment.apiUrl;

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
        if (data.sendAsFormData && !headersData['enctype']) {
            headersData['enctype'] = 'multipart/form-data';
        }

        // Get request body
        const formData = new FormData();
        let body: any = data.bodyDataSource === 'raw' ? JSON.parse(data.bodyJson || '{}') : {};
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

    getList(): Observable<{count: number, results: ApiItem[]}> {
        const url = `${this.BASE_URL}apiitem/`;
        const authToken = btoa(`${environment.apiUser}:${environment.apiPassword}`);
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${authToken}`
        });
        return this.httpClient.get<{count: number, results: ApiItem[]}>(url, {headers})
            .pipe(
                catchError(this.handleError)
            );
    }

    updateApiRecord(apiItem: ApiItem): Observable<ApiItem> {
        const url = `${this.BASE_URL}apiitem/`;
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
        const authToken = btoa(`${environment.apiUser}:${environment.apiPassword}`);
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${authToken}`
        });
        return this.httpClient.post<ApiItem>(url, apiItem, {headers})
            .pipe(
                catchError(this.handleError)
            );
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
            if (contentType === 'image') {
                fileReader.readAsDataURL(blob);
            } else {
                fileReader.readAsText(blob);
            }
        });
    }

    handleError<T>(error: HttpErrorResponse): Observable<any> {
        // if (error.status && [401, 403].indexOf(error.status) > -1) {
        //     window.location.href = '/login';
        // }
        if (error.message) {
            return throwError(() => error.message);
        }
        return throwError(error.error);
    }
}
