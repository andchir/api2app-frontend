import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Subject, takeUntil } from 'rxjs';

import { ApiItem } from '../models/api-item.interface';
import { ApiService } from '../../services/api.service';

import * as ace from 'ace-builds';

@Component({
    selector: 'app-api-create',
    templateUrl: './api-create.component.html',
    styleUrls: ['./api-create.component.css'],
    providers: [ApiService]
})
export class ApiCreateComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('editor') editor!: ElementRef<HTMLElement>;

    data: ApiItem = {
        name: '',
        requestMethod: 'GET',
        requestUrl: 'http://httpbin.org/json',
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
            {name: 'Access-Control-Allow-Origin', value: '*'},
            {name: '', value: ''}
        ],
        bodyJson: ''
    };
    requestMethods = [
        'GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'DELETE', 'PURGE', 'OPTIONS'
    ];
    responseContentTypes = [
        'json', 'xml', 'html', 'text', 'image'
    ];
    previewSate: 'data'|'headers' = 'data';
    isResponseError = false;
    timer: any;
    loading = false;
    submitted = false;
    aceEditor: any;
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected apiService: ApiService
    ) {}

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {
        this.aceEditorInit();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    aceEditorInit(): void {
        ace.config.set('fontSize', '16px');
        ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
        this.aceEditor = ace.edit(this.editor.nativeElement);
        this.aceEditor.setTheme('ace/theme/textmate');
        this.aceEditor.session.setMode('ace/mode/json');

        this.aceEditor.on('change', () => {
            this.data.responseBody = this.aceEditor.getValue();
            // console.log(this.data.responseBody);
        });
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
                    this.data.responseBody = '';
                    this.data.responseHeaders = [];
                    res.headers.keys().forEach((headerName) => {
                        this.data.responseHeaders.push({
                            name: headerName,
                            value: String(res.headers.get(headerName))
                        });
                    });
                    this.isResponseError = false;
                    if ((res.headers.get('content-type') || '').indexOf('image/') === 0) {
                        this.data.responseContentType = 'image';
                    }

                    this.apiService.getDataFromBlob(res.body, this.data.responseContentType)
                        .then((data) => {
                            if (typeof data === 'object') {
                                this.data.responseBody = JSON.stringify(data, null, 2);
                            } else {
                                this.data.responseBody = data;
                            }
                            if (this.data.responseContentType !== 'image') {
                                this.aceEditor.session.setValue(this.data.responseBody);
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                        });

                    this.loading = false;
                    this.submitted = false;
                },
                error: (err) => {
                    if (err.error instanceof Blob) {
                        this.apiService.getDataFromBlob(err.error)
                            .then((errorData) => {
                                if (typeof errorData === 'object') {
                                    this.data.responseBody = JSON.stringify(errorData, null, 4);
                                    this.aceEditor.session.setValue(this.data.responseBody);
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }

                    const errorMessage = err?.message || 'Error.';
                    this.data.responseContentType = 'json';
                    this.data.responseBody = '{"error": "' + errorMessage + '"}';
                    this.aceEditor.session.setValue(this.data.responseBody);

                    this.isResponseError = true;
                    this.loading = false;
                    this.submitted = false;
                }
            });
    }

    requestMethodUpdate(method: string): void {
        this.data.requestMethod = method;
    }

    responseContentTypeUpdate(contentType: string) {
        this.data.responseContentType = contentType;
        const responseContentTypes = this.responseContentTypes.filter((item) => {
            return item !== 'image';
        });
        if (responseContentTypes.includes(contentType)) {
            this.aceEditor.session.setMode(`ace/mode/${this.data.responseContentType}`);
        }
        if (this.data.responseContentType === 'image' && !this.data.responseBody.includes('data:image/')) {
            this.data.responseBody = '';
        }
    }
}
