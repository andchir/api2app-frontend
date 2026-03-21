import {
    AfterViewInit,
    Component,
    ElementRef, EventEmitter,
    Input,
    OnChanges, OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { HttpResponse } from '@angular/common/http';

import { Subject, Subscription, filter, map, race, take, takeUntil } from 'rxjs';
import * as ace from 'ace-builds';

import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { SseErrorEvent } from 'ngx-sse-client';
import { ApiItem } from '../models/api-item.interface';

export interface ApiItemMessageEvent {
    text: string;
    type: 'error' | 'success';
}

@Component({
    selector: 'app-api-item',
    templateUrl: './api-item.component.html',
    styleUrls: ['./api-item.component.css'],
    providers: []
})
export class ApiItemComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    @Input() apiItem: ApiItem;
    @Input() authorized = true;
    @Output() senderChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() urlEnter: EventEmitter<string> = new EventEmitter<string>();
    @Output() message = new EventEmitter<ApiItemMessageEvent>();
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
        'audio',
        'video'
    ];
    previewSate: 'data'|'headers' = 'data';
    isResponseError = false;
    timer: any;
    loading = false;
    submitted = false;
    aceEditor: any;
    aceEditorRequest: any;
    bodyInputFullScreen: boolean = false;
    destroyed$: Subject<void> = new Subject();
    private wsTestSubscription?: Subscription;

    constructor(
        protected apiService: ApiService,
        private websocketService: WebsocketService
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
            if (!this.getIsMediaType(this.apiItem.responseContentType)) {
                this.aceEditor.session.setMode(`ace/mode/${this.apiItem.responseContentType}`);
            }
            if (!this.getIsMediaType(this.apiItem.requestContentType)) {
                this.aceEditorRequest.session.setMode(`ace/mode/${this.apiItem.requestContentType}`);
            }
            this.aceEditor.session.setValue(this.apiItem.responseBody);
            this.aceEditorRequest.session.setValue(this.apiItem.bodyContent);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.urlEnter.emit((event.target as HTMLInputElement).value);
        }, 600);
    }

    aceEditorInit(): void {
        // ace.config.set('fontSize', '16px');
        ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
        this.aceEditor = ace.edit(this.editorResponse.nativeElement);
        this.aceEditor.setTheme('ace/theme/textmate');
        this.aceEditor.setFontSize(16);
        if (!this.getIsMediaType(this.apiItem.responseContentType)) {
            this.aceEditor.session.setMode(`ace/mode/${this.apiItem.responseContentType}`);
        }

        this.aceEditor.on('change', () => {
            this.apiItem.responseBody = this.aceEditor.getValue();
            // console.log(this.apiItem.responseBody);
        });

        this.aceEditorRequest = ace.edit(this.editorRequest.nativeElement);
        this.aceEditorRequest.setTheme('ace/theme/textmate');
        this.aceEditorRequest.setFontSize(16);
        if (!this.getIsMediaType(this.apiItem.requestContentType)) {
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

    apiTestRequest(): void {
        if (!this.apiItem.requestUrl) {
            return;
        }
        const url = this.apiItem.requestUrl.trim();
        if (this.isWebSocketUrl(url)) {
            this.apiWebSocketTestRequest(url);
            return;
        }
        this.apiSendRequest();
    }

    private isWebSocketUrl(url: string): boolean {
        const u = url.toLowerCase();
        return u.startsWith('ws://') || u.startsWith('wss://');
    }

    private cancelWebSocketTestSubscriptions(): void {
        this.wsTestSubscription?.unsubscribe();
        this.wsTestSubscription = undefined;
    }

    private apiWebSocketTestRequest(url: string): void {
        if (this.loading || this.submitted) {
            return;
        }
        const method = (this.apiItem.requestMethod || 'GET').toUpperCase();

        this.cancelWebSocketTestSubscriptions();
        this.wsTestSubscription = new Subscription();

        this.isResponseError = false;
        this.apiItem.responseBody = '';
        this.apiItem.responseHeaders = [];

        this.websocketService.disconnect();

        // DEBUG(ws): remove after debugging
        // console.log('[WS debug] api test', {method, url});

        const subscribeInboundStreams = (): void => {
            const messageSub = this.websocketService.message$
                .pipe(filter((m) => m.url === url))
                .subscribe((m) => {
                    // DEBUG(ws): remove after debugging
                    // console.log('[WS debug] inbound (response update)', {url, data: m.data});
                    this.applyWebSocketResponseBody(m.data);
                });

            const errorSub = this.websocketService.error$
                .pipe(filter((e) => e.url === url))
                .subscribe(() => {
                    this.setWebSocketTestError($localize `Не удалось установить соединение с WebSocket сервером`);
                });

            this.wsTestSubscription!.add(messageSub);
            this.wsTestSubscription!.add(errorSub);
        };

        if (method === 'POST') {
            const opened$ = this.websocketService.open$.pipe(
                filter((u) => u === url),
                take(1),
                map(() => 'open' as const)
            );
            const failed$ = this.websocketService.error$.pipe(
                filter((e) => e.url === url),
                take(1),
                map(() => 'error' as const)
            );

            const raceSub = race(opened$, failed$).subscribe({
                next: (outcome) => {
                    if (outcome === 'error') {
                        this.setWebSocketTestError($localize `Не удалось установить соединение с WebSocket сервером`);
                        this.websocketService.disconnect(url);
                        return;
                    }
                    this.emitItemMessage($localize `Соединение с WebSocket сервером установлено`, 'success');
                    subscribeInboundStreams();
                    try {
                        this.websocketService.sendText(url, this.apiService.getWebSocketPostBodyText('test', this.apiItem));
                    } catch (e) {
                        this.setWebSocketTestError(e instanceof Error ? e.message : String(e));
                    }
                }
            });
            this.wsTestSubscription.add(raceSub);
        } else {
            const openSub = this.websocketService.open$
                .pipe(filter((u) => u === url), take(1))
                .subscribe(() => {
                    this.emitItemMessage($localize `Соединение с WebSocket сервером установлено`, 'success');
                });
            this.wsTestSubscription.add(openSub);
            subscribeInboundStreams();
        }

        this.websocketService.connect(url);
    }

    private applyWebSocketResponseBody(data: unknown): void {
        if (typeof data === 'object' && data !== null) {
            this.responseContentTypeUpdate('json');
            this.apiItem.responseBody = JSON.stringify(data, null, 4);
        } else {
            this.responseContentTypeUpdate('text');
            this.apiItem.responseBody = String(data ?? '');
        }
        if (this.aceEditor && !this.getIsMediaType(this.apiItem.responseContentType)) {
            this.aceEditor.session.setValue(this.apiItem.responseBody);
        }
    }

    private emitItemMessage(text: string, type: 'error' | 'success'): void {
        this.message.emit({ text, type });
    }

    private setWebSocketTestError(message: string): void {
        this.emitItemMessage(message, 'error');
        this.isResponseError = true;
        this.responseContentTypeUpdate('json');
        this.apiItem.responseBody = JSON.stringify({ error: message }, null, 2);
        if (this.aceEditor) {
            this.aceEditor.session.setValue(this.apiItem.responseBody);
        }
    }

    apiSendRequest(): void {
        if (this.loading || this.submitted) {
            return;
        }
        this.loading = true;
        this.submitted = true;
        this.isResponseError = false;
        this.apiItem.responseBody = '';
        this.apiItem.responseHeaders = [];

        let timer: any;

        this.apiService.apiRequest('test', this.apiItem)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    if (res instanceof MessageEvent) {
                        if (res.type === 'error') {
                            const event = res as unknown as SseErrorEvent;
                            console.log(`ERROR: ${event.message}, STATUS: ${event.status}, STATUS TEXT: ${event.statusText}`);
                            this.isResponseError = true;
                            this.loading = false;
                            this.submitted = false;
                        } else {
                            const data = (res as MessageEvent).data;
                            if (data === '[DONE]') {
                                this.loading = false;
                                this.submitted = false;
                            } else {
                                let dataObj = JSON.parse(data);
                                this.apiItem.responseBody = JSON.stringify(dataObj, null, 4);
                                if (!this.getIsMediaType(this.apiItem.responseContentType)) {
                                    this.aceEditor.session.setValue(this.apiItem.responseBody);
                                }
                            }
                            clearTimeout(timer);
                            timer = setTimeout(() => {
                                this.loading = false;
                                this.submitted = false;
                            }, 4000);
                        }
                    } else if(res instanceof HttpResponse) {
                        if (res.headers) {
                            res.headers.keys().forEach((headerName) => {
                                this.apiItem.responseHeaders.push({
                                    name: headerName,
                                    value: String(res.headers.get(headerName))
                                });
                            });
                            if ((res.headers.get('content-type') || '').indexOf('image/') === 0) {
                                this.responseContentTypeUpdate('image');
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
                                    if (!this.getIsMediaType(this.apiItem.responseContentType)) {
                                        this.aceEditor.session.setValue(this.apiItem.responseBody);
                                    }
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        }
                        this.loading = false;
                        this.submitted = false;
                    }
                },
                error: (err) => {
                    console.log(err);
                    if (err.error instanceof Blob) {
                        this.apiService.getDataFromBlob(err.error)
                            .then((errorData) => {
                                // console.log(errorData);
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
                    this.responseContentTypeUpdate('json');
                    this.apiItem.responseBody = '{"error": "' + errorMessage + '"}';
                    this.aceEditor.session.setValue(this.apiItem.responseBody);

                    this.isResponseError = true;
                    this.loading = false;
                    this.submitted = false;
                },
                complete: () => {
                    this.loading = false;
                    this.submitted = false;
                }
            });
    }

    getIsMediaType(type: string): boolean {
        return ['audio', 'image', 'video'].includes(type);
    }

    requestMethodUpdate(method: string): void {
        this.apiItem.requestMethod = method;
    }

    responseContentTypeUpdate(contentType: string) {
        this.apiItem.responseContentType = contentType;
        const responseContentTypes = this.responseContentTypes.filter((item) => {
            return !this.getIsMediaType(item);
        });
        if (responseContentTypes.includes(contentType)) {
            this.aceEditor.session.setMode(`ace/mode/${this.apiItem.responseContentType}`);
        }
        if (this.apiItem.responseContentType === 'image' && !this.apiItem.responseBody.includes('data:image/')) {
            this.apiItem.responseBody = '';
        }
        if (this.apiItem.responseContentType === 'audio' && !this.apiItem.responseBody.includes('data:audio/')) {
            this.apiItem.responseBody = '';
        }
        if (this.apiItem.responseContentType === 'video' && !this.apiItem.responseBody.includes('data:video/')) {
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

    senderUpdate(sender: 'browser'|'server'): void {
        this.apiItem.sender = sender;
        this.senderChange.emit(sender);
    }

    bodyInputFullScreenToggle(): void {
        this.bodyInputFullScreen = !this.bodyInputFullScreen;
    }

    ngOnDestroy() {
        this.cancelWebSocketTestSubscriptions();
        this.websocketService.disconnect();
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
