import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subject, takeUntil } from 'rxjs';

import { ApiItem } from '../models/api-item.interface';

@Component({
  selector: 'app-api-create',
  templateUrl: './api-create.component.html',
  styleUrls: ['./api-create.component.css']
})
export class ApiCreateComponent implements OnInit, OnDestroy {

    data: ApiItem = {
        name: '',
        requestMethod: 'GET',
        requestUrl: 'http://httpbin.org/json',
        basicAuth: false,
        responseJson: '',
        bodyDataSource: 'fields',
        bodyFields: [
            {name: '', value: ''}
        ],
        headers: [
            {name: 'Content-Type', value: 'application/json', active: true},
            {name: 'Accept', value: 'application/json', active: true},
            {name: '', value: '', active: true}
        ],
        bodyJson: ''
    };
    requestMethods = [
        'GET', 'POST', 'PUT', 'HEAD', 'DELETE', 'PATCH', 'PURGE', 'OPTIONS'
    ];
    isResponseError = false;
    timer: any;
    loading = false;
    submitted = false;
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected httpClient: HttpClient
    ) {}

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    saveData(): void {
        console.log('saveData', this.data);
    }

    findDataEmptyIndex(optionName: 'headers'|'bodyFields'): number {
        return this.data[optionName].findLastIndex((item) => {
            return !item.name && !item.value;
        });
    }

    deleteOption(optionName: 'headers'|'bodyFields', index: number): void {
        this.data[optionName][index].name = '';
        this.data[optionName][index].value = '';
        if (this.data[optionName].length === 1) {
            return;
        }
        this.onOptionsListChange(optionName, index, 0);
    }

    onOptionsListChange(optionName: 'headers'|'bodyFields', index: number, delay = 200): void {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            const lastEmptyIndex = this.findDataEmptyIndex(optionName);
            if (lastEmptyIndex === -1) {
                this.data[optionName].push({name: '', value: '', active: true});
                return;
            }
            if (!this.data[optionName][index].name && !this.data[optionName][index].value && index !== lastEmptyIndex) {
                this.data[optionName].splice(index, 1);
            }
        }, delay);
    }

    apiSendRequest(): void {
        if (!this.data.requestUrl) {
            return;
        }

        // Get headers
        let responseTypeValue = 'json';
        const headersData: {[header: string]: string} = {};
        this.data.headers.forEach((item) => {
            if (item.name && item.value) {
                headersData[item.name] = item.value;
                if (item.name.toLowerCase() === 'accept' && item.value.includes('/')) {
                    responseTypeValue = item.value.split('/')[1];
                }
            }
        });
        const headers = new HttpHeaders(headersData);
        const responseType = 'text';

        // Get request body
        let body: any = this.data.bodyDataSource === 'raw' ? (this.data.bodyJson || '') : {};
        if (this.data.bodyDataSource === 'fields') {
            body = {};
            this.data.bodyFields.forEach((item) => {
                if (item.name && item.value) {
                    body[item.name] = item.value;
                }
            });
        }

        let httpRequest;
        switch (this.data.requestMethod) {
            case 'POST':
                httpRequest = this.httpClient.post(this.data.requestUrl, {body}, {headers, responseType});
                break;
            default:
                httpRequest = this.httpClient.get(this.data.requestUrl, {headers, responseType});
        }

        this.loading = true;
        this.submitted = true;

        httpRequest
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.isResponseError = false;
                    this.data.responseJson = typeof res === 'object'
                        ? JSON.stringify(res, null, 4)
                        : res.trim();
                    this.loading = false;
                    this.submitted = false;
                },
                error: (err) => {
                    const errorMessage = err.error?.error?.message;
                    this.isResponseError = true;
                    this.data.responseJson = '{"error": "' + (err?.message || '') + (errorMessage ? ` - ${errorMessage}` : '') + '"}';
                    this.loading = false;
                    this.submitted = false;
                }
            });
    }

    requestMethodUpdate(method: string): void {
        this.data.requestMethod = method;
    }
}
