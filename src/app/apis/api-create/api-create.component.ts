import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subject, takeUntil } from 'rxjs';
import { Buffer } from 'buffer/';

import { ApiItem } from '../models/api-item.interface';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-api-create',
    templateUrl: './api-create.component.html',
    styleUrls: ['./api-create.component.css'],
    providers: [ApiService]
})
export class ApiCreateComponent implements OnInit, OnDestroy {

    data: ApiItem = {
        name: '',
        requestMethod: 'GET',
        requestUrl: 'http://httpbin.org/json',
        basicAuth: false,
        responseBody: '',
        responseHeaders: [],
        responseContentType: 'json',
        bodyDataSource: 'fields',
        bodyFields: [
            {name: '', value: ''}
        ],
        headers: [
            {name: 'Content-Type', value: 'application/json'},
            {name: 'Accept', value: 'application/json'},
            {name: 'Access-Control-Allow-Origin', value: '*'},
            {name: '', value: ''}
        ],
        bodyJson: ''
    };
    requestMethods = [
        'GET', 'POST', 'PUT', 'HEAD', 'DELETE', 'PATCH', 'PURGE', 'OPTIONS'
    ];
    responseContentTypes = [
        'json', 'xml', 'html', 'text', 'image'
    ];
    previewSate: 'data'|'headers' = 'data';
    isResponseError = false;
    timer: any;
    loading = false;
    submitted = false;
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected apiService: ApiService
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
                this.data[optionName].push({name: '', value: ''});
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
        this.loading = true;
        this.submitted = true;

        this.apiService.apiRequest(this.data)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data.responseHeaders = [];
                    res.headers.keys().forEach((headerName) => {
                        this.data.responseHeaders.push({
                            name: headerName,
                            value: String(res.headers.get(headerName))
                        });
                    });
                    this.isResponseError = false;
                    const fileReader = new FileReader();
                    fileReader.onload = (fileLoadedEvent) => {
                        this.data.responseBody = fileLoadedEvent.target?.result as string;
                    }
                    if (this.data.responseContentType === 'image') {
                        fileReader.readAsDataURL(res.body);
                    } else {
                        fileReader.readAsText(res.body);
                    }
                    this.loading = false;
                    this.submitted = false;
                },
                error: (err) => {
                    const errorMessage = err.error?.error?.message;
                    this.isResponseError = true;
                    this.data.responseBody = '{"error": "' + (err?.message || '') + (errorMessage ? ` - ${errorMessage}` : '') + '"}';
                    this.loading = false;
                    this.submitted = false;
                }
            });
    }

    requestMethodUpdate(method: string): void {
        this.data.requestMethod = method;
    }
}
