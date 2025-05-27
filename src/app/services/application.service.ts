import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { BASE_URL } from '../../environments/environment';

import { catchError, Observable } from 'rxjs';
import * as moment from 'moment';

import { ApplicationItem } from '../apps/models/application-item.interface';
import { DataService } from './data.service.abstract';
import { AppBlock, AppBlockElement, AppBlockElementType, AppOptions } from '../apps/models/app-block.interface';

declare const vkBridge: any;

@Injectable()
export class ApplicationService extends DataService<ApplicationItem> {

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        httpClient: HttpClient
    ) {
        super(httpClient);
        this.requestUrl = `${BASE_URL}${this.locale}/api/v1/applications`;
    }

    importItem(inputString: string, inputLink: string = ''): Observable<{success: boolean}> {
        const url = `${BASE_URL}${this.locale}/api/v1/application_import_from_json`;
        return this.httpClient.post<{success: boolean}>(url, {inputString, inputLink}, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    cloneItem(uuid: string): Observable<{success: boolean}> {
        const url = `${this.requestUrl}/${uuid}/clone`
        return this.httpClient.post<{success: boolean}>(url, {}, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    static createBlockOptionsFields(options?: any, index = 0, tabIndex = 0): AppBlockElement[] {
        const output = [] as AppBlockElement[];
        output.push({
            name: 'tabIndex',
            label: $localize `Tab Index`,
            type: 'input-number',
            min: 0,
            max: 30,
            value: tabIndex
        });
        output.push({
            name: 'orderIndex',
            label: $localize `Order Index`,
            type: 'input-number',
            min: 0,
            max: 100,
            value: index
        });
        output.push({
            name: 'gridColumnSpan',
            label: $localize `Grid Columns Span`,
            type: 'input-number',
            min: 1,
            max: 3,
            value: options?.gridColumnSpan || 1
        });
        output.push({
            name: 'messageSuccess',
            label: $localize `Success message`,
            type: 'input-textarea',
            value: options?.messageSuccess || ''
        });
        output.push({
            name: 'autoClear',
            label: $localize `Clear after sending`,
            type: 'input-switch',
            enabled: options?.autoClear || false
        });
        output.push({
            name: 'showLoading',
            label: $localize `Show loading`,
            type: 'input-switch',
            enabled: options?.showLoading
        });
        return output;
    }

    static getBlockDefaults(): AppBlock {
        return {
            elements: [],
            loading: false,
            options: {
                orderIndex: 0,
                gridColumnSpan: 1,
                messageSuccess: $localize `The form has been submitted successfully.`,
                autoClear: false,
                showLoading: true
            }
        };
    }

    static fieldsToOptionsObject(fields: AppBlockElement[]): any {
        const output = {} as AppOptions;
        fields.forEach((item) => {
            if (item.type === 'input-switch') {
                output['enabled'] = !!item.enabled;
                output[item.name] = !!item.enabled;
            } else if (item.type === 'table') {
                output[item.name] = item.valueArr;
            } else {
                output[item.name] = item.value;
            }
        });
        return output;
    }

    static getElementValue(element: AppBlockElement): string|string[]|number|boolean|File|File[]|null {
        switch (element.type) {
            case 'input-tags':
                return Array.isArray(element?.value) ? element?.value : [];
            case 'input-date':
                const dateFormat = element?.format;
                const date = moment(String(element?.value));
                return date.format(dateFormat);
            case 'audio':
                if (element.value && element.value['changingThisBreaksApplicationSecurity']) {
                    const value = element.value['changingThisBreaksApplicationSecurity'];
                    if (value.includes('data:audio')) {
                        return ApplicationService.dataURItoFile(value);
                    }
                    return String(value);
                }
                return String(element.value);
            case 'input-file':
            case 'image':
                if (Array.isArray(element.value) && (element.value as File[]).length === 0) {
                    return null;
                }
                return element.multiple || !Array.isArray(element.value) ? element.value : element.value[0];
            case 'input-number':
            case 'input-slider':
                return parseInt(String(element.value));
        }
        return element.value ? String(element.value) : null;
    }

    static localStoreValueClear(element: AppBlockElement): void {
        const apiUuid = element.options?.inputApiUuid || element.options?.outputApiUuid;
        if (!apiUuid) {
            return;
        }
        const key = `${element.type}-${element.name}`;
        const obj = JSON.parse(window.localStorage.getItem(apiUuid) || '{}');
        delete obj[key];
        if (Object.keys(obj).length === 0) {
            window.localStorage.removeItem(apiUuid);
        } else {
            window.localStorage.setItem(apiUuid, JSON.stringify(obj));
        }
    }

    static localStoreValue(element: AppBlockElement): void {
        if (!element['storeValue']) {
            return;
        }
        const value = ApplicationService.getElementValue(element);
        const apiUuid = element.options?.inputApiUuid || element.options?.outputApiUuid;
        if (!apiUuid) {
            return;
        }
        const key = `${element.type}-${element.name}`;
        // if (typeof vkBridge !== 'undefined' && window['isVKApp']) {
        //     vkBridge.send('VKWebAppStorageSet', {key: `${apiUuid}-${key}`, value: value || ''})
        //         .then((data) => {
        //             // console.log('VKWebAppStorageSet', data);
        //         })
        //         .catch((error) => {
        //             console.log(error);
        //         });
        // } else {
            const obj = JSON.parse(window.localStorage.getItem(apiUuid) || '{}');
            obj[key] = value;
            window.localStorage.setItem(apiUuid, JSON.stringify(obj));
        // }
    }

    static applyLocalStoredValue(element: AppBlockElement): Promise<void> {
        if (!element['storeValue']) {
            return Promise.resolve();
        }
        const apiUuid = element.options?.inputApiUuid || element.options?.outputApiUuid;
        if (!apiUuid) {
            return Promise.resolve();
        }
        const key = `${element.type}-${element.name}`;
        // if (typeof vkBridge !== 'undefined' && window['isVKApp']) {
        //     return vkBridge.send('VKWebAppStorageGet', {keys: [key]})
        //         .then((data) => {
        //             if (data.keys && data.keys.length > 0) {
        //                 element.value = data.keys[0].value;
        //             }
        //         })
        //         .catch((error) => {
        //             console.log(error);
        //         });
        // } else {
            const obj = JSON.parse(window.localStorage.getItem(apiUuid) || '{}');
            if (obj[key]) {
                element.value = obj[key];
            }
            return Promise.resolve();
        // }
    }

    static dataURItoFile(dataURI: string): File {
        const blob = ApplicationService.dataUriToBlob(dataURI);
        const mimeType = blob.type;
        const ext = mimeType.split('/')[1];
        return ApplicationService.dataBlobToFile(blob, `file.${ext}`);
    }

    static dataBlobToFile(blob: Blob, fileName: string = ''): File {
        return new File(
            [blob],
            fileName,
            {
                lastModified: new Date().getTime(),
                type: blob.type
            });
    }

    static dataUriToBlob(dataUri: string): Blob {
        const binary = atob(dataUri.split(',')[1]);
        const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];
        const arr = [];
        for (let i = 0; i < binary.length; i++) {
            arr.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(arr)], { type: mimeString });
    };

    static getDefault(): ApplicationItem {
        return {
            id: 0,
            name: '',
            uuid: '',
            shared: false,
            hidden: false,
            advertising: true,
            adultsOnly: false,
            gridColumns: 3,
            language: '',
            image: '',
            blocks: [{tabIndex: -1, elements: []}, {tabIndex: -1, elements: []}, {tabIndex: -1, elements: []}]
        };
    }
}
