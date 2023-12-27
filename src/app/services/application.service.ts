import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { environment } from '../../environments/environment';

import * as moment from 'moment';

import { ApplicationItem } from '../apps/models/application-item.interface';
import { DataService } from './data.service.abstract';
import { AppBlockElement, AppBlockElementType, AppOptions } from '../apps/models/app-block.interface';

const BASE_URL = environment.apiUrl;

@Injectable()
export class ApplicationService extends DataService<ApplicationItem> {

    static createElementOptionsFields(type: AppBlockElementType, options?: any): AppBlockElement[] {
        if (!options) {
            options = {} as any;
        }
        const output = [] as AppBlockElement[];
        switch (type) {
            case 'text-header':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'value',
                    label: $localize `Value`,
                    type: 'input-textarea',
                    value: options?.value
                });
                break;
            case 'text':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'value',
                    label: $localize `Value`,
                    type: 'input-textarea',
                    value: options?.value
                });
                output.push({
                    name: 'prefixText',
                    label: $localize `Prefix Text`,
                    type: 'input-text',
                    value: options?.prefixText
                });
                output.push({
                    name: 'suffixText',
                    label: $localize `Suffix Text`,
                    type: 'input-text',
                    value: options?.suffixText
                });
                output.push({
                    name: 'color',
                    label: $localize `Color`,
                    type: 'input-select',
                    value: options?.color,
                    choices: ['Black', 'Gray', 'Green', 'Blue', 'Red']
                });
                output.push({
                    name: 'whiteSpacePre',
                    label: $localize `Use line break`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.whiteSpacePre
                });
                break;
            case 'button':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'value',
                    label: $localize `Text`,
                    type: 'input-text',
                    value: options?.value
                });
                output.push({
                    name: 'color',
                    label: $localize `Color`,
                    type: 'input-select',
                    value: options?.color,
                    choices: ['Green', 'Blue', 'Red']
                });
                break;
            case 'input-text':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'placeholder',
                    label: $localize `Placeholder`,
                    type: 'input-text',
                    value: options?.placeholder
                });
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-text',
                    value: options?.value
                });
                break;
            case 'input-number':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'min',
                    label: $localize `Minimum Value`,
                    type: 'input-number',
                    value: options?.min
                });
                output.push({
                    name: 'max',
                    label: $localize `Maximum Value`,
                    type: 'input-number',
                    value: options?.max
                });
                break;
            case 'input-textarea':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'placeholder',
                    label: $localize `Placeholder`,
                    type: 'input-text',
                    value: options?.placeholder
                });
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-textarea',
                    value: options?.value
                });
                break;
            case 'input-switch':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'value',
                    label: $localize `Value`,
                    type: 'input-text',
                    value: options?.value
                });
                output.push({
                    name: 'enabled',
                    label: $localize `Enabled By Default?`,
                    type: 'input-switch',
                    value: options?.value || '1',
                    enabled: options?.enabled
                });
                break;
            case 'input-select':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'itemFieldNameForTitle',
                    label: $localize `Field name in the array - title`,
                    type: 'input-text',
                    value: options?.itemFieldNameForTitle
                });
                output.push({
                    name: 'itemFieldNameForValue',
                    label: $localize `Field name in the array - value`,
                    type: 'input-text',
                    value: options?.itemFieldNameForValue
                });
                output.push({
                    name: 'choices',
                    label: $localize `Choices`,
                    type: 'input-tags',
                    value: options?.choices || [],
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-text',
                    value: options?.value
                });
                break;
            case 'input-tags':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-tags',
                    value: options?.value || [],
                    choices: []
                });
                break;
            case 'input-radio':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'choices',
                    label: $localize `Choices`,
                    type: 'input-tags',
                    value: options?.choices || [],
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-text',
                    value: options?.value
                });
                break;
            case 'input-date':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'format',
                    label: $localize `Date Format`,
                    type: 'input-text',
                    value: options?.format
                });
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-text',
                    value: options?.value
                });
                output.push({
                    name: 'offset',
                    label: $localize `Default Days Offset`,
                    type: 'input-number',
                    value: options?.offset
                });
                output.push({
                    name: 'useDefault',
                    label: $localize `Use Default Value`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.useDefault
                });
                break;
            case 'input-file':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'placeholder',
                    label: $localize `Placeholder`,
                    type: 'input-text',
                    value: options?.placeholder
                });
                output.push({
                    name: 'accept',
                    label: $localize `Accept file types`,
                    type: 'input-text',
                    value: options?.accept
                });
                output.push({
                    name: 'multiple',
                    label: $localize `Multiple`,
                    type: 'input-switch',
                    enabled: options?.multiple
                });
                break;
            case 'audio':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                break;
            case 'image':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'itemFieldName',
                    label: $localize `Field name in the array`,
                    type: 'input-text',
                    value: options?.itemFieldName
                });
                output.push({
                    name: 'itemThumbnailFieldName',
                    label: $localize `Name of the thumbnail field in the array`,
                    type: 'input-text',
                    value: options?.itemThumbnailFieldName
                });
                break;
            case 'chart-line':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: $localize `Order Index`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'fieldNameAxisX',
                    label: $localize `Field name for X axis`,
                    type: 'input-text',
                    value: options?.fieldNameAxisX
                });
                output.push({
                    name: 'fieldNameAxisY',
                    label: $localize `Field name for Y axis`,
                    type: 'input-text',
                    value: options?.fieldNameAxisY
                });
                output.push({
                    name: 'isYAxisDate',
                    label: $localize `Y axis is date`,
                    type: 'input-switch',
                    enabled: options?.isYAxisDate
                });
                output.push({
                    name: 'format',
                    label: $localize `Date Format`,
                    type: 'input-text',
                    value: options?.format
                });
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'itemTitle',
                    label: $localize `Item Title`,
                    type: 'input-text',
                    value: options?.itemTitle
                });
                break;
        }
        return output;
    }

    static getBlockElementDefault(type: AppBlockElementType): AppBlockElement {
        const output = {type} as AppBlockElement;
        switch (type) {
            case 'text-header':
                Object.assign(output, {
                    name: 'header',
                    value: $localize `Header Example Text`
                });
                break;
            case 'text':
                Object.assign(output, {
                    name: 'text',
                    value: $localize `Example Text`,
                    prefixText: '',
                    suffixText: '',
                    color: 'Black',
                    whiteSpacePre: false
                });
                break;
            case 'button':
                Object.assign(output, {
                    name: 'submit',
                    value: $localize `Submit`,
                    color: 'Green'
                });
                break;
            case 'input-text':
                Object.assign(output, {
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    placeholder: $localize `Enter your name`,
                    value: ''
                });
                break;
            case 'input-number':
                Object.assign(output, {
                    name: 'number',
                    label: $localize `Number`,
                    type: 'input-number',
                    min: 0,
                    max: 10,
                    value: 1
                });
                break;
            case 'input-textarea':
                Object.assign(output, {
                    name: 'content',
                    label: $localize `Content`,
                    type: 'input-textarea',
                    placeholder: $localize `Enter your message here`,
                    value: ''
                });
                break;
            case 'input-switch':
                Object.assign(output, {
                    name: 'enabled',
                    label: $localize `Enabled`,
                    type: 'input-switch',
                    value: '1',
                    enabled: true
                });
                break;
            case 'input-select':
                Object.assign(output, {
                    name: 'select',
                    label: $localize `Example Select`,
                    type: 'input-select',
                    value: 'Value1',
                    placeholder: $localize `Please Select`,
                    choices: ['Value1', 'Value2', 'Value3']
                });
                break;
            case 'input-tags':
                Object.assign(output, {
                    name: 'tags',
                    label: $localize `Tags`,
                    type: 'input-select',
                    value: ['Value1', 'Value2', 'Value3'],
                    placeholder: $localize `Please Add Tags`,
                    choices: []
                });
                break;
            case 'input-radio':
                Object.assign(output, {
                    name: 'radio',
                    label: $localize `Example Radio Buttons`,
                    value: 'Value1',
                    choices: ['Value1', 'Value2', 'Value3']
                });
                break;
            case 'input-date':
                Object.assign(output, {
                    name: 'date',
                    label: $localize `Date`,
                    format: 'YYYY-MM-DD HH:mm',
                    value: '',
                    offset: 0,
                    enabled: false
                });
                break;
            case 'input-file':
                Object.assign(output, {
                    name: 'file',
                    label: $localize `File`,
                    value: [],
                    multiple: false,
                    accept: 'image/*',
                    placeholder: $localize `Upload File`
                });
                break;
            case 'image':
                Object.assign(output, {
                    name: 'image',
                    itemFieldName: '',
                    itemThumbnailFieldName: ''
                });
                break;
            case 'audio':
                Object.assign(output, {
                    name: 'audio'
                });
                break;
            case 'chart-line':
                Object.assign(output, {
                    name: 'chart',
                    label: $localize `Line Chart`,
                    itemTitle: $localize `Item Title`,
                    fieldNameAxisXL: '',
                    fieldNameAxisY: '',
                    isYAxisDate: false,
                    format: 'MMM DD, HH:mm'
                });
                break;
        }
        return output;
    }

    static createBlockOptionsFields(options?: any, index = 0): AppBlockElement[] {
        const output = [] as AppBlockElement[];
        const defaultValues = {
            gridColumnSpan: 1,
            orderIndex: 0
        };
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
            value: options?.gridColumnSpan || defaultValues.gridColumnSpan
        });
        return output;
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

    static getElementValue(element: AppBlockElement): string|string[]|number|boolean|File[] {
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

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        httpClient: HttpClient
    ) {
        super(httpClient);
        this.requestUrl = `${BASE_URL}${this.locale}/api/v1/applications`;
    }

    static getDefault(): ApplicationItem {
        return {
            id: 0,
            name: '',
            uuid: '',
            shared: false,
            hidden: false,
            gridColumns: 3,
            blocks: [{elements: []}, {elements: []}, {elements: []}]
        };
    }
}
