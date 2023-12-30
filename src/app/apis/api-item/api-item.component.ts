import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import { Subject, takeUntil } from 'rxjs';
import * as ace from 'ace-builds';

import { ApiService } from '../../services/api.service';
import { ApiItem } from '../models/api-item.interface';

@Component({
    selector: 'app-api-item',
    templateUrl: './api-item.component.html',
    styleUrls: ['./api-item.component.css'],
    providers: []
})
export class ApiItemComponent implements OnInit, AfterViewInit, OnChanges {

    @Input() apiItem: ApiItem;
    @Input() authorized = true;
    @ViewChild('editorRequest') editorRequest!: ElementRef<HTMLElement>;
    @ViewChild('editorResponse') editorResponse!: ElementRef<HTMLElement>;

    requestContentTypes = [
        'text', 'json', 'xml'
    ];
    requestMethods = [
        'GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'DELETE', 'PURGE', 'OPTIONS'
    ];
    responseContentTypes = [
        'json',
        'xml',
        'html',
        'text',
        'image',
        'audio'
    ];
    previewSate: 'data'|'headers' = 'data';
    isResponseError = false;
    timer: any;
    loading = false;
    submitted = false;
    aceEditor: any;
    aceEditorRequest: any;
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected apiService: ApiService
    ) {
        if (!this.apiItem) {
            this.apiItem = ApiService.getDefault();
        }
    }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {
        this.aceEditorInit();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['apiItem'] && this.aceEditor) {
            if (!['audio', 'image'].includes(this.apiItem.responseContentType)) {
                this.aceEditor.session.setMode(`ace/mode/${this.apiItem.responseContentType}`);
            }
            if (!['audio', 'image'].includes(this.apiItem.requestContentType)) {
                this.aceEditorRequest.session.setMode(`ace/mode/${this.apiItem.requestContentType}`);
            }
            this.aceEditor.session.setValue(this.apiItem.responseBody);
            this.aceEditorRequest.session.setValue(this.apiItem.bodyContent);
        }
    }

    aceEditorInit(): void {
        ace.config.set('fontSize', '16px');
        ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
        this.aceEditor = ace.edit(this.editorResponse.nativeElement);
        this.aceEditor.setTheme('ace/theme/textmate');
        if (!['audio', 'image'].includes(this.apiItem.responseContentType)) {
            this.aceEditor.session.setMode(`ace/mode/${this.apiItem.responseContentType}`);
        }

        this.aceEditor.on('change', () => {
            this.apiItem.responseBody = this.aceEditor.getValue();
            // console.log(this.apiItem.responseBody);
        });

        this.aceEditorRequest = ace.edit(this.editorRequest.nativeElement);
        this.aceEditorRequest.setTheme('ace/theme/textmate');
        if (!['audio', 'image'].includes(this.apiItem.requestContentType)) {
            this.aceEditorRequest.session.setMode(`ace/mode/${this.apiItem.requestContentType}`);
        }

        this.aceEditorRequest.on('change', () => {
            this.apiItem.bodyContent = this.aceEditorRequest.getValue();
        });
    }

    findDataEmptyIndex(optionName: 'headers'|'bodyFields'|'queryParams'): number {
        return this.apiItem[optionName].findLastIndex((item) => {
            return !item.name && !item.value;
        });
    }

    deleteOption(optionName: 'headers'|'bodyFields'|'queryParams', index: number): void {
        this.apiItem[optionName][index].name = '';
        this.apiItem[optionName][index].value = '';
        if (this.apiItem[optionName].length === 1) {
            return;
        }
        this.onOptionsListChange(optionName, index, 0);
    }

    onOptionsListChange(optionName: 'headers'|'bodyFields'|'queryParams', index: number, delay = 200): void {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            const lastEmptyIndex = this.findDataEmptyIndex(optionName);
            if (lastEmptyIndex === -1) {
                this.apiItem[optionName].push({name: '', value: ''});
                return;
            }
            if (!this.apiItem[optionName][index].name && !this.apiItem[optionName][index].value && index !== lastEmptyIndex) {
                this.apiItem[optionName].splice(index, 1);
            }
        }, delay);
    }

    apiSendRequest(): void {
        if (!this.apiItem.requestUrl) {
            return;
        }
        this.loading = true;
        this.submitted = true;

        this.apiService.apiRequest(this.apiItem)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.apiItem.responseBody = '';
                    this.apiItem.responseHeaders = [];
                    this.isResponseError = false;
                    if (res.headers) {
                        res.headers.keys().forEach((headerName) => {
                            this.apiItem.responseHeaders.push({
                                name: headerName,
                                value: String(res.headers.get(headerName))
                            });
                        });
                        if ((res.headers.get('content-type') || '').indexOf('image/') === 0) {
                            this.apiItem.responseContentType = 'image';
                        }
                    }
                    if (res.body) {
                        this.apiService.getDataFromBlob(res.body, this.apiItem.responseContentType)
                            .then((data) => {
                                if (typeof data === 'object') {
                                    this.apiItem.responseBody = JSON.stringify(data, null, 2);
                                } else {
                                    this.apiItem.responseBody = data;
                                }
                                if (!['image', 'audio'].includes(this.apiItem.responseContentType)) {
                                    this.aceEditor.session.setValue(this.apiItem.responseBody);
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }

                    this.loading = false;
                    this.submitted = false;
                },
                error: (err) => {
                    console.log(err);
                    if (err.error instanceof Blob) {
                        this.apiService.getDataFromBlob(err.error)
                            .then((errorData) => {
                                console.log(errorData);
                                if (typeof errorData === 'object') {
                                    this.apiItem.responseBody = JSON.stringify(errorData, null, 4);
                                    this.aceEditor.session.setValue(this.apiItem.responseBody);
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }

                    const errorMessage = err?.message || 'Error.';
                    this.apiItem.responseContentType = 'json';
                    this.apiItem.responseBody = '{"error": "' + errorMessage + '"}';
                    this.aceEditor.session.setValue(this.apiItem.responseBody);

                    this.isResponseError = true;
                    this.loading = false;
                    this.submitted = false;
                }
            });
    }

    requestMethodUpdate(method: string): void {
        this.apiItem.requestMethod = method;
    }

    responseContentTypeUpdate(contentType: string) {
        this.apiItem.responseContentType = contentType;
        const responseContentTypes = this.responseContentTypes.filter((item) => {
            return !['image', 'audio'].includes(item);
        });
        if (responseContentTypes.includes(contentType)) {
            this.aceEditor.session.setMode(`ace/mode/${this.apiItem.responseContentType}`);
        }
        if (this.apiItem.responseContentType === 'image' && !this.apiItem.responseBody.includes('data:image/')) {
            this.apiItem.responseBody = '';
        }
    }

    requestContentTypeUpdate(contentType: string): void {
        this.apiItem.requestContentType = contentType;
        this.aceEditorRequest.session.setMode(`ace/mode/${this.apiItem.requestContentType}`);
    }

    onFileChanged(event: Event, optionName: 'headers'|'bodyFields', index: number): void {
        const inputEl = event.target as HTMLInputElement;
        const files = inputEl.files || [];
        this.apiItem[optionName][index].files = files.length > 0 ? Array.from(files) : undefined;
    }
}
