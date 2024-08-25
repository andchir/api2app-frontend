import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

import {firstValueFrom, retry, Subject, takeUntil} from 'rxjs';
import * as moment from 'moment';
moment.locale('ru');

import { ApplicationService } from '../../services/application.service';
import { AppErrors, ApplicationItem } from '../models/application-item.interface';
import { AppBlock, AppBlockElement } from '../models/app-block.interface';
import { ApiService } from '../../services/api.service';
import { ApiItem } from '../../apis/models/api-item.interface';
import { ModalService } from '../../services/modal.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { environment } from '../../../environments/environment';
import { RouterEventsService } from '../../services/router-events.service';

const APP_NAME = environment.appName;
declare const vkBridge: any;

@Component({
    selector: 'app-item-shared',
    templateUrl: './app-shared.component.html',
    providers: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationSharedComponent implements OnInit, OnDestroy {

    errors: AppErrors = {};
    message: string = '';
    messageType: 'error'|'success' = 'error';
    isLoggedIn = false;
    isShared = true;
    loading = false;
    submitted = false;
    previewMode = true;
    needBackButton = false;
    maintenanceModalActive = false;
    timerAutoStart: any;
    appsAutoStarted: string[] = [];
    appsAutoStartPending: string[] = [];
    apiItems: {input: ApiItem[], output: ApiItem[]} = {input: [], output: []};
    apiUuidsList: {input: string[], output: string[]} = {input: [], output: []};
    itemUuid: string;
    adsShownAt = 0;
    adsShowIntervalSeconds = 3 * 60; // 3 minutes
    data: ApplicationItem = ApplicationService.getDefault();
    tabIndex: number = 0;
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected cdr: ChangeDetectorRef,
        protected titleService: Title,
        protected sanitizer: DomSanitizer,
        protected route: ActivatedRoute,
        protected router: Router,
        protected tokenStorageService: TokenStorageService,
        protected dataService: ApplicationService,
        protected apiService: ApiService,
        protected modalService: ModalService,
        protected routerEventsService: RouterEventsService
    ) {}

    ngOnInit(): void {
        this.isLoggedIn = !!this.tokenStorageService.getToken();
        this.itemUuid = this.route.snapshot.paramMap.get('uuid');
        this.needBackButton = !!this.routerEventsService.getPreviousUrl();

        if (this.itemUuid) {
            this.getData();
        }
    }

    getData(): void {
        this.errors[this.itemUuid] = {};
        this.loading = true;
        this.dataService.getItemByUuidShared(this.itemUuid)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.titleService.setTitle(`${this.data.name} - ${APP_NAME}`);
                    this.loading = false;
                    if (this.data.maintenance) {
                        this.maintenanceModalToggle();
                    } else {
                        this.createAppOptions();
                    }
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.data.name = $localize `Page not found`;
                    this.errors[this.itemUuid] = err;
                    this.loading = false;
                }
            });
    }

    createAppOptions(): void {
        if (!this.data) {
            return;
        }
        const buttons = [];
        this.data.blocks.forEach((block) => {
            block.elements.forEach((element) => {
                if (element.options?.inputApiUuid && !this.apiUuidsList.input.includes(element.options.inputApiUuid)) {
                    this.apiUuidsList.input.push(element.options.inputApiUuid);
                }
                if (element.options?.outputApiUuid && !this.apiUuidsList.output.includes(element.options.outputApiUuid)) {
                    this.apiUuidsList.output.push(element.options.outputApiUuid);
                }
                if (element.type === 'button') {
                    if (element.options?.inputApiUuid) {
                        buttons.push(element.options?.inputApiUuid);
                    }
                    // if (element.options?.outputApiUuid) {
                    //     buttons.push(element.options?.outputApiUuid);
                    // }
                }
                if (element.type === 'input-select') {
                    element.value = element.value || null;
                }
                ApplicationService.applyLocalStoredValue(element);
            });
        });
        // API auto submit
        this.getApiList('output').then((items) => {
            this.apiItems['output'] = items;
            this.apiUuidsList.output.forEach((apiUuid) => {
                if (!buttons.includes(apiUuid)) {
                    this.appAutoStart(apiUuid);
                }
            });
        });
        if ((!this.data.tabs || this.data.tabs.length === 0) && !this.previewMode) {
            this.addTab();
        }
    }

    appAutoStart(apiUuid: string): void {
        if (!this.appsAutoStarted.includes(apiUuid)) {
            this.appsAutoStarted.push(apiUuid);
        }
        this.appSubmit(apiUuid, 'output', null, false);
    }

    getApiList(actionType: 'input'|'output' = 'output'): Promise<any> {
        const promises = [];
        this.apiUuidsList[actionType].forEach((uuid) => {
            if (!this.isShared && this.isLoggedIn) {
                promises.push(firstValueFrom(this.apiService.getItemByUuid(uuid)));
            } else {
                promises.push(firstValueFrom(this.apiService.getItemByUuidShared(uuid)));
            }
        });
        return Promise.all(promises);
    }

    appSubmit(apiUuid?: string, actionType: 'input'|'output' = 'input', currentElement?: AppBlockElement, createErrorMessages = true): void {
        if (!apiUuid || !this.previewMode) {
            return;
        }
        this.message = '';
        this.loading = true;
        this.submitted = true;
        this.cdr.detectChanges();
        if (this.apiItems[actionType].length === 0 && this.apiUuidsList[actionType].length > 0) {
            this.apiItems[actionType] = [];
            this.getApiList(actionType).then((items) => {
                this.apiItems[actionType] = items;
                this.appSubmit(apiUuid, actionType, currentElement, createErrorMessages);
            });
            return;
        }
        const blocks = this.findCurrentBlocks(apiUuid, actionType, currentElement, true);

        if (!this.getIsValid(apiUuid, actionType, blocks)) {
            if (this.appsAutoStarted.includes(apiUuid) && !this.appsAutoStartPending.includes(apiUuid)) {
                this.appsAutoStartPending.push(apiUuid);
            } else if (createErrorMessages) {
                this.message = $localize `Please correct errors in filling out the form.`;
                this.messageType = 'error';
            }
            this.cdr.detectChanges();
            return;
        }
        const currentApi = this.apiItems[actionType].find((apiItem) => {
            return apiItem.uuid === apiUuid;
        });
        if (!currentApi) {
            this.loading = false;
            this.submitted = false;
            return;
        }
        if (currentElement?.type !== 'input-pagination') {
            this.clearPagination(apiUuid);
        }
        const apiItem = this.prepareApiItem(currentApi, actionType, blocks);

        this.stateLoadingUpdate(blocks, true);

        this.apiService.apiRequest(apiItem, false)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    if (this.appsAutoStarted.includes(apiUuid)) {
                        this.afterAutoStarted(apiUuid);
                    }
                    this.loading = false;
                    this.submitted = false;

                    const blocks_out = this.findCurrentBlocks(apiUuid, 'output', currentElement, false);
                    this.createAppResponse(currentApi, res, blocks_out);
                    this.stateLoadingUpdate(blocks, false, this.appsAutoStarted.length === 0);
                },
                error: (err) => {
                    // console.log(err);
                    this.loading = false;
                    this.submitted = false;
                    if (err?.error instanceof Blob) {
                        this.createErrorMessage(currentApi, err.error);
                    } else {
                        this.messageType = 'error';
                        this.message = err.message || 'Error.';
                    }
                    this.onError(apiUuid);
                    this.stateLoadingUpdate(blocks, false, false);
                }
            });
    }

    afterAutoStarted(apiUuid: string): void {
        if (this.appsAutoStarted.includes(apiUuid)) {
            const index = this.appsAutoStarted.findIndex((val) => {
                return val === apiUuid;
            });
            if (index > -1) {
                this.appsAutoStarted.splice(index, 1);
            }
        }
        clearTimeout(this.timerAutoStart);
        this.timerAutoStart = setTimeout(() => {
            // Re-launch the application if the fields did not pass validation the last time.
            this.appsAutoStartPending.forEach((uuid) => {
                this.appAutoStart(uuid);
            });
            this.appsAutoStarted = [];
        }, 500);
    }

    getAllElements(): AppBlockElement[] {
        if (!this.data?.blocks) {
            return [];
        }
        return this.data.blocks.reduce(
            (accumulator, currentBlock) => {
                accumulator.push(...currentBlock.elements);
                return accumulator;
            }, []
        );
    }

    getBlocksElements(blocks: AppBlock[]): AppBlockElement [] {
        return blocks.reduce(
            (accumulator, currentBlock) => {
                accumulator.push(...currentBlock.elements);
                return accumulator;
            }, []
        );
    }

    findBlock(element: AppBlockElement): AppBlock {
        return this.data.blocks.find((block) => {
            const elem = block.elements.find((el) => {
                return el === element;
            });
            return !!elem;
        });
    }

    filterBlocks(blocks: AppBlock[], targetApiUuid: string, actionType?: string): AppBlock[] {
        return blocks.filter((item) => {
            const elements = item.elements.filter((el) => {
                if (actionType) {
                    if (['button'].includes(el.type)) {
                        return false;
                    }
                    return (actionType === 'input' && el?.options?.inputApiUuid == targetApiUuid)
                        || (actionType === 'output' && el?.options?.outputApiUuid == targetApiUuid);
                }
                return el?.options?.inputApiUuid == targetApiUuid || el?.options?.outputApiUuid == targetApiUuid;
            });
            return elements.length > 0;
        });
    }

    findCurrentBlocks(targetApiUuid: string, actionType: 'input'|'output', currentElement?: AppBlockElement, includeCurrent = true): AppBlock[] {
        const currentBlock = currentElement ? this.findBlock(currentElement) : null;
        let blocks = [];
        if (currentBlock) {
            blocks = this.filterBlocks([currentBlock], targetApiUuid, actionType);
        }
        if (blocks.length === 0) {
            blocks = this.filterBlocks(this.data.blocks, targetApiUuid, actionType);
        }
        if (includeCurrent && currentBlock) {
            blocks.push(currentBlock);
        }
        return blocks;
    }

    getIsValid(targetApiUuid: string, actionType: 'input'|'output', blocks: AppBlock[], createErrorMessages = true): boolean {
        let elements = this.getBlocksElements(blocks);
        this.errors[targetApiUuid] = {};
        const errors = {};
        elements.forEach((element) => {
            const {apiUuid, fieldName, fieldType} = this.getElementOptions(element, 'input');
            if (apiUuid !== targetApiUuid || !element.required || ['input-chart-line'].includes(element.type)) {
                return;
            }
            if (!element.value || (Array.isArray(element.value) && element.value.length === 0)) {
                errors[element.name] = $localize `This field is required.`;
            }
        });
        if (createErrorMessages) {
            this.errors[targetApiUuid] = errors;
        }
        return Object.keys(errors).length === 0;
    }

    stateLoadingUpdate(blocks: AppBlock[], loading: boolean, isSuccess = true): void {
        blocks.forEach((block) => {
            if (!loading && isSuccess) {
                if (block.options?.messageSuccess) {
                    this.message = block.options.messageSuccess;
                    this.messageType = 'success';
                }
                if (block.options?.autoClear) {
                    this.clearElementsValues(block);
                }
            }
            block.loading = loading;
        });
        this.cdr.detectChanges();
    }

    onError(apiUuid: string): void {
        // console.log('onError', apiUuid);
        const currentApiUuid = apiUuid;
        const blocks = this.data.blocks.filter((item) => {
            const elements = item.elements.filter((el) => {
                return el?.options?.outputApiUuid == apiUuid;
            });
            return elements.length > 0;
        });
        blocks.forEach((block) => {
            block.elements.filter((el) => {
                return el.type === 'status';
            }).forEach((element) => {
                if (element?.options?.outputApiUuid !== currentApiUuid) {
                    element.value = null;
                    return;
                }
                element.value = element?.statusError;
            });
        });
    }

    clearElementsValues(block: AppBlock): void {
        block.elements.forEach((element) => {
            const inputApiUuid = element.options?.inputApiUuid;
            const outputApiUuid = element.options?.outputApiUuid;
            if (!inputApiUuid && !outputApiUuid) {
                return;
            }
            if (['input-file'].includes(element.type)) {
                element.value = [];
            } else if (['input-text', 'input-textarea', 'image', 'video', 'audio', 'button'].includes(element.type)) {
                element.value = null;
                element.valueArr = null;
                element.valueObj = null;
            }
        });
    }

    prepareApiItem(inputApiItem: ApiItem, actionType: 'input'|'output' = 'input', blocks: AppBlock[]): ApiItem {
        const apiItem = Object.assign({}, inputApiItem);
        const currentElements = this.getBlocksElements(blocks);

        // Body data
        if (apiItem.requestContentType === 'json' && apiItem.bodyFields) {
            if (!apiItem.bodyFields) {
                apiItem.bodyFields = [];
            }
            const bodyFields = apiItem.bodyFields.map(field => {
                return {...field};
            });
            bodyFields.forEach((bodyField) => {
                const element = currentElements.find((item) => {
                    const {apiUuid, fieldName, fieldType} = this.getElementOptions(item, actionType);
                    return apiUuid === apiItem.uuid
                        && fieldName === bodyField.name
                        && fieldType === 'input';
                });
                if (!element) {
                    return;
                }
                ApplicationService.localStoreValue(element);
                bodyField.value = ApplicationService.getElementValue(element);
                if (element.type === 'input-switch') {
                    if (bodyField.value) {
                        bodyField.hidden = !element?.enabled;
                    } else {
                        bodyField.value = element?.enabled;
                        bodyField.hidden = false;
                    }
                }
            });
            apiItem.bodyFields = bodyFields;
        }
        const rawFields = this.apiService.getRawDataFields(apiItem);

        // Raw value
        if (apiItem.bodyDataSource === 'raw' || rawFields.length > 0) {
            const element = currentElements.find((item) => {
                const {apiUuid, fieldName, fieldType} = this.getElementOptions(item, actionType);
                return apiUuid === apiItem.uuid
                    && fieldName === 'value'
                    && fieldType === 'input';
            });
            if (element) {
                apiItem.bodyContent = ApplicationService.getElementValue(element) as string;
            } else if (apiItem.bodyContent) {
                const inputData = JSON.parse(apiItem.bodyContent);
                const outputData = this.flattenObj(inputData);

                Object.keys(outputData).forEach((key: string) => {
                    const element = currentElements.find((item) => {
                        const {apiUuid, fieldName, fieldType} = this.getElementOptions(item, actionType);
                        return apiUuid === apiItem.uuid
                            && fieldName === key
                            && fieldType === 'input';
                    });
                    if (!element) {
                        return;
                    }
                    ApplicationService.localStoreValue(element);
                    const value = element.value ? ApplicationService.getElementValue(element) as string : '';
                    const enabled = element.type !== 'input-switch' || element?.enabled;
                    if (value && !enabled) {
                        delete inputData[key];
                        return;
                    }
                    outputData[key] = value || enabled;
                });

                apiItem.bodyContent = JSON.stringify(this.unFlattenObject(outputData));
            }
        }

        // Query params
        if (!apiItem.queryParams) {
            apiItem.queryParams = [];
        }
        const queryParams = apiItem.queryParams.map(field => {
            return {...field};
        });
        queryParams.forEach((param) => {
            const element = currentElements.find((element) => {
                const {apiUuid, fieldName, fieldType} = this.getElementOptions(element, actionType);
                return apiUuid === apiItem.uuid
                    && fieldName === param.name
                    && fieldType === 'params';
            });
            if (!element) {
                return;
            }
            ApplicationService.localStoreValue(element);
            param.value = element.value
                ? ApplicationService.getElementValue(element) as string
                : null;
            if (element.type === 'input-switch') {
                param.hidden = !element?.enabled;
            }
        });
        apiItem.queryParams = queryParams;

        // Headers
        if (!apiItem.headers) {
            apiItem.headers = [];
        }
        const headers = apiItem.headers.map(field => {
            return {...field};
        });
        headers.forEach((header) => {
            const element = currentElements.find((element) => {
                const {apiUuid, fieldName, fieldType} = this.getElementOptions(element, actionType);
                return apiUuid === apiItem.uuid
                    && fieldName === header.name
                    && fieldType === 'headers';
            });
            if (!element) {
                return;
            }
            header.value = ApplicationService.getElementValue(element) as string;
        });
        apiItem.headers = headers;

        // Api URL
        const elements = currentElements.filter((item) => {
            const {apiUuid, fieldName, fieldType} = this.getElementOptions(item, actionType);
            return apiUuid === apiItem.uuid && fieldType === 'url';
        });
        apiItem.urlPartIndex = 0;
        apiItem.urlPartValue = null;
        elements.forEach((el) => {
            if (el.value && el.options?.inputApiFieldName) {
                apiItem.urlPartIndex = Number(el.options?.inputApiFieldName);
                apiItem.urlPartValue = String(el.value);
                this.apiRequestUrlUpdate(apiItem, Number(el.options?.inputApiFieldName), String(el.value));
            }
        });

        return apiItem;
    }

    apiRequestUrlUpdate(apiItem: ApiItem, urlPartIndex: number, urlPartValue: string): void {
        const requestUrl = apiItem.requestUrl;
        if (!requestUrl) {
            return;
        }
        let urlParts = [];
        const tmp = requestUrl.split('/');
        urlParts.push(`${tmp[0]}//${tmp[2]}`);
        tmp.splice(0, 3);
        urlParts = [...urlParts, ...tmp];
        if (urlParts.length < urlPartIndex + 2) {
            return;
        }
        urlParts[urlPartIndex + 1] = urlPartValue;
        apiItem.requestUrl = urlParts.join('/');
    }

    getElementOptions(element: AppBlockElement, actionType: 'input'|'output' = 'output'): {apiUuid: string, fieldName: string|number, fieldType: string} {
        return actionType === 'input'
            ? {
                apiUuid: element.options?.inputApiUuid,
                fieldName: element.options?.inputApiFieldName,
                fieldType: element.options?.inputApiFieldType
            }
            : {
                apiUuid: element.options?.outputApiUuid,
                fieldName: element.options?.outputApiFieldName,
                fieldType: element.options?.outputApiFieldType
            };
    }

    createAppResponse(apiItem: ApiItem, response: HttpResponse<any>, blocks: AppBlock[]): void {
        if (response.body) {
            const currentApiUuid = apiItem.uuid;
            const responseContentType = response.headers.has('Content-type')
                ? response.headers.get('Content-type')
                : apiItem.responseContentType;
            this.apiService.getDataFromBlob(response.body, responseContentType)
                .then((data) => {
                    const valuesData = ApiService.getPropertiesRecursively(data, '', [], []);
                    const valuesObj = ApiService.getPropertiesKeyValueObject(valuesData.outputKeys, valuesData.values);

                    blocks.forEach((block) => {
                        block.elements.forEach((element) => {
                            const {apiUuid, fieldType} = this.getElementOptions(element, 'output');
                            if (apiUuid !== currentApiUuid && apiUuid) {
                                if (['image', 'audio', 'video', 'status'].includes(element.type)) {
                                    element.value = null;
                                    element.valueArr = null;
                                    element.valueObj = null;
                                }
                                return;
                            }
                            if (element.type === 'input-chart-line') {
                                this.chartElementValueApply(element, data);
                            } else if (element.type === 'input-pagination') {
                                this.paginationValueApply(element, valuesObj, data);
                            } else {
                                this.blockElementValueApply(element, valuesObj, data);
                            }
                        });
                    });
                    this.showAds();
                    this.cdr.detectChanges();
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    showAds(): void {
        const now = Date.now();
        if (this.adsShownAt && now - this.adsShownAt < this.adsShowIntervalSeconds * 1000) {
            // console.log(now - this.adsShownAt);
            return;
        }
        // if (typeof vkBridge !== 'undefined' && window['isVKApp']) {
        //     // Advertising by VK
        //     vkBridge.send('interstitial', { ad_format: 'reward' })
        //         .then((data: any) => {
        //             console.log(data);
        //             if (data.result) {
        //                 this.adsShownAt = Date.now();
        //                 console.log('Advertisement shown');
        //             }
        //         })
        //         .catch((error: any) => {
        //             console.log(error);
        //         });
        // }
    }

    createErrorMessage(apiItem: ApiItem, blob: Blob): void {
        this.apiService.getDataFromBlob(blob)
            .then((data) => {
                let errorMessage = data.detail || data.message || $localize `Error.`;
                this.errors[apiItem.uuid] = {};
                if (typeof data === 'object' && !Array.isArray(data)) {
                    const errorsObj = {};
                    for (let key in data) {
                        errorsObj[key] = Array.isArray(data[key]) ? data[key].join(' ') : data[key];
                    }
                    this.errors[apiItem.uuid] = errorsObj;
                    if (data.detail) {
                        errorMessage = data.detail;
                    }
                }
                const allElements = this.getAllElements();
                const elements = allElements.filter((element) => {
                    return element.options?.outputApiUuid === apiItem.uuid && element.options?.outputApiFieldType === 'output';
                });
                const valuesData = ApiService.getPropertiesRecursively(data, '', [], []);
                const valuesObj = ApiService.getPropertiesKeyValueObject(valuesData.outputKeys, valuesData.values);
                elements.forEach((element) => {
                    if (['input-textarea', 'text'].includes(element.type)) {
                        this.blockElementValueApply(element, valuesObj, data);
                    }
                });
                this.message = this.localizeServerMessages(errorMessage);
                this.messageType = 'error';
                this.cdr.detectChanges();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    localizeServerMessages(errorMessage: string): string {
        if (errorMessage === 'Daily usage limit exceeded.') {
            errorMessage = $localize `Daily usage limit exceeded.`;
        }
        if (errorMessage === 'File not found.') {
            errorMessage = $localize `File not found.`;
        }
        if (errorMessage === 'Unable to determine file type.') {
            errorMessage = $localize `Unable to determine file type.`;
        }
        if (errorMessage === 'Unsupported image file type.') {
            errorMessage = $localize `Unsupported image file type.`;
        }
        if (errorMessage === 'Unsupported video file type.') {
            errorMessage = $localize `Unsupported video file type.`;
        }
        if (errorMessage === 'The file is too large.') {
            errorMessage = $localize `The file is too large.`;
        }
        if (errorMessage === 'Please upload image file.') {
            errorMessage = $localize `Please upload image file.`;
        }
        if (errorMessage === 'Processing error. Please try again later.') {
            errorMessage = $localize `Processing error. Please try again later.`;
        }
        if (errorMessage === 'Task not found.') {
            errorMessage = $localize `Task not found.`;
        }
        return errorMessage;
    }

    chartElementValueApply(element: AppBlockElement, data: any): void {
        const fieldNameAxisX = element.fieldNameAxisX;
        const fieldNameAxisY = element.fieldNameAxisY;
        const dataKey = element.options?.outputApiFieldName;
        if (!fieldNameAxisX || !fieldNameAxisY || (!data[dataKey] && !data)) {
            return;
        }
        const dateFormat = element?.format;
        const outData = data[dataKey] || data;
        const yAxisData = outData.map((item) => {
            return parseFloat(item[fieldNameAxisY]);
        });
        const xAxisData = outData.map((item) => {
            const value = item[fieldNameAxisX] || '';
            if (element.isXAxisDate && dateFormat && value) {
                const date = moment(String(value));
                return date.format(dateFormat);
            }
            return value;
        });
        element.valueObj = {xAxisData, yAxisData, data: outData};
    }

    paginationValueApply(element: AppBlockElement, data: any, rawData: any): void {
        const dataKey = String(element.options?.outputApiFieldName || '');
        const endlessMode = dataKey.toLowerCase().includes('current') || dataKey.toLowerCase().includes('page');
        const value = parseInt(element.value as string);
        const currentPage = element.useAsOffset
            ? (value ? (value / element.perPage) + 1 : 1)
            : value;
        const totalItems = endlessMode ? 9999 : (data[dataKey] || 0);
        element.valueObj = {
            id: element.name,
            totalItems,
            itemsPerPage: element.perPage,
            currentPage
        }
    }

    clearPagination(apiUuid: string): void {
        const allElements = this.getAllElements();
        const elements = allElements.filter((el) => {
            return el.type === 'input-pagination' && el.options?.inputApiUuid === apiUuid;
        });
        elements.forEach((elements) => {
            elements.value = elements.useAsOffset ? 0 : 1;
            if (elements.valueObj) {
                elements.valueObj.currentPage = 1;
            }
        });
    }

    blockElementValueApply(element: AppBlockElement, valuesObj: any, rawData: any): void {
        const fieldName = element.options?.outputApiFieldName;
        if (!fieldName) {
            return;
        }
        let value = fieldName === 'value' && !valuesObj[fieldName] ? rawData : (valuesObj[fieldName] || '');
        if (!value) {
            element.value = '';
            this.cdr.detectChanges();
            return;
        }
        if (['image', 'audio'].includes(element.type) && typeof value === 'string') {
            element.value = this.sanitizer.bypassSecurityTrustResourceUrl((element.prefixText || '') + value);
            this.cdr.detectChanges();
            return;
        }
        if (this.isJson(value)) {
            value = JSON.parse(value);
        }
        if (Array.isArray(value)) {
            element.valueArr = this.flattenObjInArray(value);
            if (element?.itemFieldName) { // Filter array values
                element.valueArr = this.filterArrayValues(element.valueArr, element.itemFieldName);
            }
            if (element.valueArr.length > 0 && element.selectDefaultFirst) {// !['image', 'audio'].includes(element.type)) {
                element.value = element?.itemFieldNameForValue
                    ? element.valueArr[0][element?.itemFieldNameForValue]
                    : element.valueArr[0];
            } else {
                // element.value = null;
            }
        } else if (['input-switch', 'input-number', 'input-slider', 'status'].includes(element.type)) {
            element.value = value;
        } else {
            element.value = (element.prefixText || '')
                + (typeof value === 'object' ? JSON.stringify(value, null, 2) : value)
                + (element.suffixText || '');
        }
        ApplicationService.localStoreValue(element);
    }

    onElementClick(element: AppBlockElement): void {
        if (!this.previewMode) {
            return;
        }
        if (element.type === 'button') {
            if (element.options?.inputApiUuid && element.options?.inputApiFieldName === 'submit') {
                this.appSubmit(element.options.inputApiUuid, 'input', element);
            } else if (element.value && String(element.value).match(/https?:\/\//)) {
                window.open(String(element.value), '_blank').focus();
            }
        }
    }

    onElementValueChanged(element: AppBlockElement): void {
        if (!this.previewMode) {
            return;
        }
        const apiUuid = element.options?.inputApiUuid;
        if (!apiUuid) {
            return;
        }
        const allElements = this.getAllElements();
        const buttonElement = allElements.find((el) => {
            return el.type === 'button' && el.options?.inputApiUuid === apiUuid;
        });
        if (!buttonElement || ['input-pagination'].includes(element.type)) {
            this.appSubmit(apiUuid, 'input', element);
        }
    }

    onItemSelected(element: AppBlockElement, index: number): void {
        if (!this.previewMode) {
            return;
        }
        const apiUuid = element.options?.inputApiUuid;
        if (!apiUuid) {
            return;
        }
        this.appSubmit(apiUuid, 'input', element);
    }

    switchTab(tabIndex: number): void {
        this.tabIndex = tabIndex;
    }

    addTab(): void {
        if (!this.data.tabs) {
            this.data.tabs = [];
        }
        this.data.tabs.push(($localize `Tab`) + ' ' + (this.data.tabs.length + 1));
    }

    isJson(str: string): boolean {
        if (typeof str !== 'string' || !str.match(/^[\[{]/)) {
            return false;
        }
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    flattenObjInArray(inputArr: any[]): any[] {
        return inputArr.map((item) => {
            return this.flattenObj(item);
        });
    }

    filterArrayValues(valueArr: any[], itemFieldName: string): any[] {
        if (!itemFieldName) {
            return valueArr;
        }
        valueArr = valueArr.filter((item) => {
            const value = item[itemFieldName] || '';
            return !!value && !this.isJson(value);
        });
        return valueArr;
    }

    flattenObj(obj: any, parent: string = '', res: any = {}): any {
        if (typeof obj !== 'object') {
            return obj;
        }
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                let propName = parent ? parent + '.' + index : String(index);
                if (typeof item === 'object') {
                    this.flattenObj(item, propName, res);
                } else {
                    res[propName] = item;
                }
            });
            return res;
        }
        for (let key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            let propName = parent ? parent + '.' + key : key;
            if (typeof obj[key] === 'object') {
                this.flattenObj(obj[key], propName, res);
            } else {
                res[propName] = obj[key];
            }
        }
        return res;
    }

    unFlattenObject(obj: any): any {
        const result = {};
        for (const i in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, i)) {
                const keys = i.match(/(?:^\.+)?(?:\.{2,}|[^.])+(?:\.+$)?/g);
                keys.reduce((r, e, j) => {
                    return r[e] || (r[e] = isNaN(Number(keys[j + 1])) ? (keys.length - 1 === j ? obj[i] : {}) : []);
                }, result);
            }
        }
        return result;
    }

    maintenanceModalToggle(): void {
        this.maintenanceModalActive = !this.maintenanceModalActive;
    }

    onMessage(msg: string[]) {
        this.message = msg[0];
        this.messageType = msg[1] as 'error'|'success';
    }

    navigateBack(event?: MouseEvent) {
        if (event) {
            event.preventDefault();
        }
        this.router.navigate([this.routerEventsService.getPreviousUrl()]);
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
