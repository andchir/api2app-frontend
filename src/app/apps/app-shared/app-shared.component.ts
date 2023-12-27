import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';
moment.locale('ru');

import { ApplicationService } from '../../services/application.service';
import { ApplicationItem } from '../models/application-item.interface';
import { AppBlockElement } from '../models/app-block.interface';
import { ApiService } from '../../services/api.service';
import { ApiItem } from '../../apis/models/api-item.interface';

@Component({
    selector: 'app-item-shared',
    templateUrl: './app-shared.component.html',
    providers: []
})
export class ApplicationSharedComponent implements OnInit, OnDestroy {

    errors: {[name: string]: string[]} = {};
    message: string = '';
    messageType: 'error'|'success' = 'error';
    loading = false;
    submitted = false;

    apiItems: {input: ApiItem[], output: ApiItem[]} = {input: [], output: []};
    apiUuidsList: {input: string[], output: string[]} = {input: [], output: []};
    itemUuid: string;
    data: ApplicationItem;
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected dataService: ApplicationService,
        protected apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.itemUuid = this.route.snapshot.paramMap.get('uuid');
        if (this.itemUuid) {
            this.getData();
        }
    }

    getData(): void {
        this.loading = true;
        this.dataService.getItemByUuidShared(this.itemUuid)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.loading = false;
                    this.createAppOptions();
                },
                error: (err) => {
                    this.errors = err;
                    this.loading = false;
                }
            });
    }

    createAppOptions(): void {
        if (!this.data) {
            return;
        }
        const buttons = {};
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
                        buttons[element.options?.inputApiUuid] = true;
                    }
                    if (element.options?.outputApiUuid) {
                        buttons[element.options?.outputApiUuid] = true;
                    }
                }
            });
        });
        // API auto submit
        this.apiUuidsList.output.forEach((apiUuid) => {
            if (!buttons[apiUuid]) {
                this.appSubmit(apiUuid, 'output');
            }
        });
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

    deleteErrorMessages(name: string) {
        if (this.errors[name]) {
            delete this.errors[name];
        }
    }

    onElementClick(element: AppBlockElement): void {
        if (element.type === 'button') {
            this.appSubmit(element.options?.outputApiUuid, 'output');
        }
    }

    getApiList(actionType: 'input'|'output' = 'output'): Promise<any> {
        const promises = [];
        this.apiUuidsList[actionType].forEach((uuid) => {
            promises.push(firstValueFrom(this.apiService.getItemByUuidShared(uuid)));
        });
        return Promise.all(promises);
    }

    appSubmit(apiUuid?: string, actionType: 'input'|'output' = 'output'): void {
        if (!apiUuid) {
            return;
        }
        this.message = '';
        this.loading = true;
        this.submitted = true;
        if (this.apiItems[actionType].length === 0 && this.apiUuidsList[actionType].length > 0) {
            this.apiItems[actionType] = [];
            this.getApiList(actionType).then((items) => {
                this.apiItems[actionType] = items;
                this.appSubmit(apiUuid, actionType);
            });
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
        this.stateLoadingUpdate(apiUuid, true);
        const apiItem = this.prepareApiItem(currentApi);
        this.apiService.apiRequest(apiItem)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.createAppResponse(currentApi, res);
                    this.loading = false;
                    this.submitted = false;
                    this.stateLoadingUpdate(apiUuid, false);
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
                    this.stateLoadingUpdate(apiUuid, false);
                }
            });
    }

    stateLoadingUpdate(apiUuid: string, loading: boolean): void {
        const blocks = this.data.blocks.filter((item) => {
            const elements = item.elements.filter((el) => {
                return el?.options?.inputApiUuid == apiUuid || el?.options?.outputApiUuid == apiUuid;
            });
            return elements.length > 0;
        });
        blocks.forEach((block) => {
            block.loading = loading;
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
                bodyField.value = ApplicationService.getElementValue(element) as string;
                if (element.type === 'input-switch') {
                    bodyField.hidden = !element?.enabled;
                }
            });
            apiItem.bodyFields = bodyFields;
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
            param.value = ApplicationService.getElementValue(element) as string;
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
        return apiItem;
    }

    getElementOptions(element: AppBlockElement, actionType: 'input'|'output' = 'output'): {apiUuid: string, fieldName: string, fieldType: string} {
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
            this.apiService.getDataFromBlob(response.body, apiItem.responseContentType)
                .then((data) => {
                    const valuesData = ApiService.getPropertiesRecursively(data, '', [], []);
                    const valuesObj = ApiService.getPropertiesKeyValueObject(valuesData.outputKeys, valuesData.values);
                    elements.forEach((element) => {
                        if (['chart-line'].includes(element.type)) {
                            this.chartElementValueApply(element, data);
                        } else {
                            this.blockElementValueApply(element, valuesObj, data);
                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    createErrorMessage(apiItem: ApiItem, blob: Blob): void {
        this.apiService.getDataFromBlob(blob)
            .then((data) => {
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
            if (element.isYAxisDate && dateFormat && value) {
                const date = moment(String(value));
                return date.format(dateFormat);
            }
            return value;
        });
        element.valueObj = {xAxisData, yAxisData};
    }

    blockElementValueApply(element: AppBlockElement, valuesObj: any, rawData: any): void {
        const fieldName = element.options?.outputApiFieldName;
        if (!fieldName) {
            return;
        }
        let value = fieldName === 'value' && !valuesObj[fieldName] ? rawData : (valuesObj[fieldName] || '');
        if (!value) {
            element.value = '';
            return;
        }
        if (this.isJson(value)) {
            value = JSON.parse(value);
        }
        if (Array.isArray(value)) {
            element.valueArr = value;
            if (element?.itemFieldNameForValue && element.valueArr.length > 0) {
                element.value = element.valueArr[0][element?.itemFieldNameForValue];
            }
        } else {
            element.value = (element.prefixText || '')
                + (typeof value === 'object' ? JSON.stringify(value, null, 2) : value)
                + (element.suffixText || '');
        }
    }

    isJson(str: string): boolean {
        if (typeof str !== 'string' || !str.match(/^[\[\{]/)) {
            return false;
        }
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
