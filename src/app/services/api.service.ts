import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiItem } from '../apis/models/api-item.interface';

@Injectable()
export class ApiService {

    constructor(
        public httpClient: HttpClient
    ) {

    }

    apiRequest(data: ApiItem): Observable<HttpResponse<any>> {
        // Get headers
        let responseTypeValue = 'json';
        const headersData: {[header: string]: string} = {};
        data.headers.forEach((item) => {
            if (item.name && item.value) {
                headersData[item.name] = item.value;
                if (item.name.toLowerCase() === 'accept' && item.value.includes('/')) {
                    responseTypeValue = item.value.split('/')[1];
                }
            }
        });
        const headers = new HttpHeaders(headersData);
        const responseType = 'blob';

        // Get request body
        let body: any = data.bodyDataSource === 'raw' ? (data.bodyJson || '') : {};
        if (data.bodyDataSource === 'fields') {
            body = {};
            data.bodyFields.forEach((item) => {
                if (item.name && item.value) {
                    body[item.name] = item.value;
                }
            });
        }

        let httpRequest;
        switch (data.requestMethod) {
            case 'POST':
                httpRequest = this.httpClient.post(data.requestUrl, {body}, {headers, responseType, observe: 'response'});
                break;
            default:
                httpRequest = this.httpClient.get(data.requestUrl, {headers, responseType, observe: 'response'});
        }

        return httpRequest;
    }
}
