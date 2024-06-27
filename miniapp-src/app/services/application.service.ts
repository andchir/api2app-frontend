import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { BASE_URL } from '../../environments/environment';

import * as moment from 'moment';

import { ApplicationItem } from '../apps/models/application-item.interface';
import { DataService } from './data.service.abstract';
import { AppBlock, AppBlockElement, AppBlockElementType, AppOptions } from '../apps/models/app-block.interface';
import {catchError, Observable} from "rxjs";

@Injectable()
export class ApplicationService extends DataService<ApplicationItem> {

    getItemByJsonFile(fileName: string): Observable<ApplicationItem> {
        const url = `assets/${fileName}.json`;
        return this.httpClient.get<ApplicationItem>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    static createBlockOptionsFields(options?: any, index = 0): AppBlockElement[] {
        const output = [] as AppBlockElement[];
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
            value: options?.messageSuccess
        });
        output.push({
            name: 'autoClear',
            label: $localize `Clear after sending`,
            type: 'input-switch',
            enabled: options?.autoClear || false
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
                autoClear: false
            }
        };
    }

    static fieldsToOptionsObject(fields: AppBlockElement[]): any {
        const output = {} as AppOptions;
        fields.forEach((item) => {
            if (item.type === 'input-switch') {
                output['enabled'] = !!item.enabled;
                output[item.name] = !!item.enabled;
            } else {
                output[item.name] = item.value;
            }
        });
        return output;
    }

    static getElementValue(element: AppBlockElement): string|string[]|number|boolean|File[]|null {
        switch (element.type) {
            case 'input-date':
                const dateFormat = element?.format;
                const date = moment(String(element?.value));
                return date.format(dateFormat);
            case 'input-file':
                if ((element.value as File[]).length === 0) {
                    return null;
                }
                return element.multiple ? element.value : element.value[0];
            case 'input-number':
            case 'input-slider':
                return parseInt(String(element.value));
        }
        return String(element.value);
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
        const obj = JSON.parse(window.localStorage.getItem(apiUuid) || '{}');
        obj[key] = value;
        window.localStorage.setItem(apiUuid, JSON.stringify(obj));
    }

    static applyLocalStoredValue(element: AppBlockElement): void {
        if (!element['storeValue']) {
            return;
        }
        const apiUuid = element.options?.inputApiUuid || element.options?.outputApiUuid;
        if (!apiUuid) {
            return;
        }
        const key = `${element.type}-${element.name}`;
        const obj = JSON.parse(window.localStorage.getItem(apiUuid) || '{}');
        if (obj[key]) {
            element.value = obj[key];
        }
    }

    static getDefault(): ApplicationItem {
        return {
            id: 0,
            name: '',
            uuid: '',
            shared: false,
            hidden: false,
            gridColumns: 3,
            language: '',
            image: '',
            blocks: [{elements: []}, {elements: []}, {elements: []}]
        };
    }

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        httpClient: HttpClient
    ) {
        super(httpClient);
        // this.requestUrl = `${BASE_URL}${this.locale}/api/v1/applications`;
        this.requestUrl = 'assets/app_';
    }
}
