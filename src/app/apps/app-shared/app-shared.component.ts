import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

import { firstValueFrom, Subject, takeUntil } from 'rxjs';
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

const APP_NAME = environment.appName;

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
    timerAutoStart: any;
    appsAutoStarted: string[] = [];
    appsAutoStartPending: string[] = [];
    apiItems: {input: ApiItem[], output: ApiItem[]} = {input: [], output: []};
    apiUuidsList: {input: string[], output: string[]} = {input: [], output: []};
    itemUuid: string;
    data: ApplicationItem = ApplicationService.getDefault();
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
        protected modalService: ModalService
    ) {}

    ngOnInit(): void {
        this.isLoggedIn = !!this.tokenStorageService.getToken();
        this.itemUuid = this.route.snapshot.paramMap.get('uuid');
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
                    this.createAppOptions();
                    this.cdr.detectChanges();
                },
                error: (err) => {
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
    }

    appAutoStart(apiUuid: string): void {
        if (!this.appsAutoStarted.includes(apiUuid)) {
            this.appsAutoStarted.push(apiUuid);
        }
        this.appSubmit(apiUuid, 'output', null, false);
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

    appSubmit(apiUuid?: string, actionType: 'input'|'output' = 'output', element?: AppBlockElement, createErrorMessages = true): void {
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
                this.appSubmit(apiUuid, actionType, element, createErrorMessages);
            });
            return;
        }
        if (!this.getIsValid(apiUuid, actionType, createErrorMessages)) {
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
        if (element?.type !== 'input-pagination') {
            this.clearPagination(apiUuid);
        }
        this.stateLoadingUpdate(apiUuid, true);
        const apiItem = this.prepareApiItem(currentApi);
        this.apiService.apiRequest(apiItem)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    if (this.appsAutoStarted.includes(apiUuid)) {
                        this.afterAutoStarted(apiUuid);
                    }
                    this.createAppResponse(currentApi, res);
                    this.loading = false;
                    this.submitted = false;
                    this.stateLoadingUpdate(apiUuid, false, this.appsAutoStarted.length === 0);
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
                    this.stateLoadingUpdate(apiUuid, false, false);
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

    getIsValid(targetApiUuid: string, actionType: 'input'|'output', createErrorMessages = true): boolean {
        const allElements = this.getAllElements();
        this.errors[targetApiUuid] = {};
        const errors = {};
        allElements.forEach((element) => {
            const {apiUuid, fieldName, fieldType} = this.getElementOptions(element, 'input');
            if (apiUuid !== targetApiUuid || (!element.required && element.type !== 'input-chart-line')) {
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

    stateLoadingUpdate(apiUuid: string, loading: boolean, isSuccess = true): void {
        const blocks = this.data.blocks.filter((item) => {
            const elements = item.elements.filter((el) => {
                return el?.options?.outputApiUuid == apiUuid;// el?.options?.inputApiUuid == apiUuid || el?.options?.outputApiUuid == apiUuid;
            });
            return elements.length > 0;
        });
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

    clearElementsValues(block: AppBlock): void {
        block.elements.forEach((element) => {
            if (['input-text', 'input-textarea'].includes(element.type)) {
                element.value = '';
            } else if (['input-file'].includes(element.type)) {
                element.value = [];
            }
        });
    }

    prepareApiItem(inputApiItem: ApiItem, actionType: 'input'|'output' = 'input'): ApiItem {
        const apiItem = Object.assign({}, inputApiItem);
        const allElements = this.getAllElements();
        // Body data
        if (apiItem.requestContentType === 'json' && apiItem.bodyFields) {
            if (!apiItem.bodyFields) {
                apiItem.bodyFields = [];
            }
            const bodyFields = apiItem.bodyFields.map(field => {
                return {...field};
            });
            bodyFields.forEach((bodyField) => {
                const element = allElements.find((item) => {
                    const {apiUuid, fieldName, fieldType} = this.getElementOptions(item, actionType);
                    return apiUuid === apiItem.uuid
                        && fieldName === bodyField.name
                        && fieldType === 'input';
                });
                if (!element) {
                    return;
                }
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

        // Raw value
        if (apiItem.bodyDataSource === 'raw') {
            const element = allElements.find((item) => {
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
                    const element = allElements.find((item) => {
                        const {apiUuid, fieldName, fieldType} = this.getElementOptions(item, actionType);
                        return apiUuid === apiItem.uuid
                            && fieldName === key
                            && fieldType === 'input';
                    });
                    if (!element) {
                        return;
                    }
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
            const element = allElements.find((element) => {
                const {apiUuid, fieldName, fieldType} = this.getElementOptions(element, actionType);
                return apiUuid === apiItem.uuid
                    && fieldName === param.name
                    && fieldType === 'params';
            });
            if (!element) {
                return;
            }
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
            const element = allElements.find((element) => {
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
        const elements = allElements.filter((item) => {
            const {apiUuid, fieldName, fieldType} = this.getElementOptions(item, actionType);
            return apiUuid === apiItem.uuid && fieldType === 'url';
        });
        elements.forEach((el) => {
            if (el.value && el.options?.inputApiFieldName) {
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

    createAppResponse(apiItem: ApiItem, response: HttpResponse<any>): void {
        if (response.body) {
            const allElements = this.getAllElements();
            const elements = allElements.filter((element) => {
                const {apiUuid, fieldType} = this.getElementOptions(element, 'output');
                return apiUuid === apiItem.uuid && fieldType === 'output';
            });
            const responseContentType = response.headers.has('Content-type')
                ? response.headers.get('Content-type')
                : apiItem.responseContentType;
            this.apiService.getDataFromBlob(response.body, responseContentType)
                .then((data) => {
                    const valuesData = ApiService.getPropertiesRecursively(data, '', [], []);
                    const valuesObj = ApiService.getPropertiesKeyValueObject(valuesData.outputKeys, valuesData.values);
                    elements.forEach((element) => {
                        if (element.type === 'input-chart-line') {
                            this.chartElementValueApply(element, data);
                        } else if (element.type === 'input-pagination') {
                            this.paginationValueApply(element, valuesObj, data);
                        } else {
                            this.blockElementValueApply(element, valuesObj, data);
                        }
                    });
                    this.cdr.detectChanges();
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    createErrorMessage(apiItem: ApiItem, blob: Blob): void {
        this.apiService.getDataFromBlob(blob)
            .then((data) => {
                this.errors[apiItem.uuid] = {};
                if (typeof data === 'object' && !Array.isArray(data)) {
                    const errorsObj = {};
                    for (let key in data) {
                        errorsObj[key] = Array.isArray(data[key]) ? data[key].join(' ') : data[key];
                    }
                    this.errors[apiItem.uuid] = errorsObj;
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
                this.message = $localize `Error.`;
                this.messageType = 'error';
                this.cdr.detectChanges();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    chartElementValueApply(element: AppBlockElement, data: any): void {
        const fieldNameAxisX = element.fieldNameAxisX;
        const fieldNameAxisY = element.fieldNameAxisY;
        const dataKey = element.options?.outputApiFieldName;
        if (!fieldNameAxisX || !fieldNameAxisY || !data[dataKey]) {
            return;
        }
        const dateFormat = element?.format;
        const outData = data[dataKey];
        const yAxisData = outData.map((item) => {
            return parseFloat(item[fieldNameAxisY]);
        });
        const xAxisData = outData.map((item) => {
            const value = item[fieldNameAxisX] || null;
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
        element.valueObj = {
            id: element.name,
            totalItems: endlessMode ? 9999 : (data[dataKey] || 0),
            itemsPerPage: element.perPage,
            currentPage: element.value || 1
        }
    }

    clearPagination(apiUuid: string): void {
        const allElements = this.getAllElements();
        const elements = allElements.filter((el) => {
            return el.type === 'input-pagination' && el.options?.inputApiUuid === apiUuid;
        });
        elements.forEach((elements) => {
            elements.value = 1;
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
            element.value = this.sanitizer.bypassSecurityTrustResourceUrl(value);
            this.cdr.detectChanges();
            return;
        }
        if (this.isJson(value)) {
            value = JSON.parse(value);
        }
        if (Array.isArray(value)) {
            element.valueArr = this.flattenObjInArray(value);
            if (element.valueArr.length > 0 && element.selectDefaultFirst) {// !['image', 'audio'].includes(element.type)) {
                element.value = element?.itemFieldNameForValue
                    ? element.valueArr[0][element?.itemFieldNameForValue]
                    : element.valueArr[0];
            } else {
                // element.value = null;
            }
        } else if (['input-switch', 'input-number', 'input-slider'].includes(element.type)) {
            element.value = value;
        } else {
            element.value = (element.prefixText || '')
                + (typeof value === 'object' ? JSON.stringify(value, null, 2) : value)
                + (element.suffixText || '');
        }
    }

    onElementClick(element: AppBlockElement): void {
        if (!this.previewMode) {
            return;
        }
        if (element.type === 'button') {
            if (element.options?.inputApiUuid && element.options?.inputApiFieldName === 'submit') {
                this.appSubmit(element.options.inputApiUuid, 'output', element);
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
            this.appSubmit(apiUuid, 'output', element);
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
        this.appSubmit(apiUuid, 'output', element);
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

    flattenObj(obj: any, parent: string = '', res: any = {}): any {
        if (typeof obj !== 'object' || Array.isArray(obj)) {
            obj.forEach((item, index) => {
                let propName = parent ? parent + '.' + index : index;
                this.flattenObj(item, propName, res);
            });
            return res;
        }
        for (let key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            let propName = parent ? parent + '.' + key : key;
            if (typeof obj[key] == 'object') {
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

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
