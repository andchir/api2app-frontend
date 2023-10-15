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
            console.log(this.data.responseBody);
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
                        if (this.data.responseContentType !== 'image') {
                            this.aceEditor.session.setValue(this.data.responseBody);
                        }
                    }
                    if ((res.headers.get('content-type') || '').indexOf('image/') === 0) {
                        this.data.responseContentType = 'image';
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
                    const fileReader = new FileReader();
                    fileReader.onload = (fileLoadedEvent) => {
                        console.log(fileLoadedEvent.target?.result);
                    };
                    fileReader.readAsText(err.error);

                    const errorMessage = err?.message || 'Error.';
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
