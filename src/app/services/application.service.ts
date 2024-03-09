import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { BASE_URL } from '../../environments/environment';

import * as moment from 'moment';

import { ApplicationItem } from '../apps/models/application-item.interface';
import { DataService } from './data.service.abstract';
import { AppBlock, AppBlockElement, AppBlockElementType, AppOptions } from '../apps/models/app-block.interface';

@Injectable()
export class ApplicationService extends DataService<ApplicationItem> {

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
        }
        return String(element.value);
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
            blocks: [{elements: []}, {elements: []}, {elements: []}]
        };
    }

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        httpClient: HttpClient
    ) {
        super(httpClient);
        this.requestUrl = `${BASE_URL}${this.locale}/api/v1/applications`;
    }
}
