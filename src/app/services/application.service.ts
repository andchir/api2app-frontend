import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'value',
                    label: 'Value',
                    type: 'input-textarea',
                    value: options?.value
                });
                break;
            case 'text':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'value',
                    label: 'Value',
                    type: 'input-textarea',
                    value: options?.value
                });
                output.push({
                    name: 'prefixText',
                    label: 'Prefix Text',
                    type: 'input-text',
                    value: options?.prefixText
                });
                output.push({
                    name: 'suffixText',
                    label: 'Suffix Text',
                    type: 'input-text',
                    value: options?.suffixText
                });
                output.push({
                    name: 'color',
                    label: 'Color',
                    type: 'input-select',
                    value: options?.color,
                    choices: ['Black', 'Gray', 'Green', 'Blue', 'Red']
                });
                output.push({
                    name: 'whiteSpacePre',
                    label: 'Use line break',
                    type: 'input-switch',
                    value: true,
                    enabled: options?.whiteSpacePre
                });
                break;
            case 'button':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'value',
                    label: 'Text',
                    type: 'input-text',
                    value: options?.value
                });
                output.push({
                    name: 'color',
                    label: 'Color',
                    type: 'input-select',
                    value: options?.color,
                    choices: ['Green', 'Blue', 'Red']
                });
                break;
            case 'input-text':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'placeholder',
                    label: 'Placeholder',
                    type: 'input-text',
                    value: options?.placeholder
                });
                output.push({
                    name: 'value',
                    label: 'Default Value',
                    type: 'input-text',
                    value: options?.value
                });
                break;
            case 'input-number':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'min',
                    label: 'Minimum Value',
                    type: 'input-number',
                    value: options?.min
                });
                output.push({
                    name: 'max',
                    label: 'Maximum Value',
                    type: 'input-number',
                    value: options?.max
                });
                break;
            case 'input-textarea':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'placeholder',
                    label: 'Placeholder',
                    type: 'input-text',
                    value: options?.placeholder
                });
                output.push({
                    name: 'value',
                    label: 'Default Value',
                    type: 'input-textarea',
                    value: options?.value
                });
                break;
            case 'input-switch':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'value',
                    label: 'Value',
                    type: 'input-text',
                    value: options?.value
                });
                output.push({
                    name: 'enabled',
                    label: 'Enabled By Default?',
                    type: 'input-switch',
                    value: options?.value || '1',
                    enabled: options?.enabled
                });
                break;
            case 'input-select':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'choices',
                    label: 'Choices',
                    type: 'input-tags',
                    value: options?.choices || [],
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: 'Default Value',
                    type: 'input-text',
                    value: options?.value
                });
                break;
            case 'input-tags':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'value',
                    label: 'Default Value',
                    type: 'input-tags',
                    value: options?.value || [],
                    choices: []
                });
                break;
            case 'input-radio':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'choices',
                    label: 'Choices',
                    type: 'input-tags',
                    value: options?.choices || [],
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: 'Default Value',
                    type: 'input-text',
                    value: options?.value
                });
                break;
            case 'input-date':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'format',
                    label: 'Date Format',
                    type: 'input-text',
                    value: options?.format
                });
                output.push({
                    name: 'value',
                    label: 'Default Value',
                    type: 'input-text',
                    value: options?.value
                });
                output.push({
                    name: 'offset',
                    label: 'Default Days Offset',
                    type: 'input-number',
                    value: options?.offset
                });
                output.push({
                    name: 'useDefault',
                    label: 'Use Default Value',
                    type: 'input-switch',
                    value: true,
                    enabled: options?.useDefault
                });
                break;
            case 'input-file':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'placeholder',
                    label: 'Placeholder',
                    type: 'input-text',
                    value: options?.placeholder
                });
                output.push({
                    name: 'accept',
                    label: 'Accept',
                    type: 'input-text',
                    value: options?.accept
                });
                output.push({
                    name: 'multiple',
                    label: 'Multiple',
                    type: 'input-switch',
                    enabled: options?.multiple
                });
                break;
            case 'audio':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                break;
            case 'image':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                break;
            case 'chart-line':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name
                });
                output.push({
                    name: 'fieldNameAxisX',
                    label: 'Field name for X axis',
                    type: 'input-text',
                    value: options?.fieldNameAxisX
                });
                output.push({
                    name: 'fieldNameAxisY',
                    label: 'Field name for Y axis',
                    type: 'input-text',
                    value: options?.fieldNameAxisY
                });
                output.push({
                    name: 'orderIndex',
                    label: 'Order Index',
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.orderIndex || 0
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'itemTitle',
                    label: 'Item Title',
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
                    value: 'Header Example Text'
                });
                break;
            case 'text':
                Object.assign(output, {
                    name: 'text',
                    value: 'Example Text',
                    prefixText: '',
                    suffixText: '',
                    color: 'Black',
                    whiteSpacePre: false
                });
                break;
            case 'button':
                Object.assign(output, {
                    name: 'submit',
                    value: 'Submit',
                    color: 'Green'
                });
                break;
            case 'input-text':
                Object.assign(output, {
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    placeholder: 'Enter your name',
                    value: ''
                });
                break;
            case 'input-number':
                Object.assign(output, {
                    name: 'number',
                    label: 'Number',
                    type: 'input-number',
                    min: 0,
                    max: 10,
                    value: 1
                });
                break;
            case 'input-textarea':
                Object.assign(output, {
                    name: 'content',
                    label: 'Content',
                    type: 'input-textarea',
                    placeholder: 'Enter your message here',
                    value: ''
                });
                break;
            case 'input-switch':
                Object.assign(output, {
                    name: 'enabled',
                    label: 'Enabled',
                    type: 'input-switch',
                    value: '1',
                    enabled: true
                });
                break;
            case 'input-select':
                Object.assign(output, {
                    name: 'select',
                    label: 'Example Select',
                    type: 'input-select',
                    value: 'Value1',
                    placeholder: 'Please Select',
                    choices: ['Value1', 'Value2', 'Value3']
                });
                break;
            case 'input-tags':
                Object.assign(output, {
                    name: 'tags',
                    label: 'Tags',
                    type: 'input-select',
                    value: ['Value1', 'Value2', 'Value3'],
                    placeholder: 'Please Add Tags',
                    choices: []
                });
                break;
            case 'input-radio':
                Object.assign(output, {
                    name: 'radio',
                    label: 'Example Radio Buttons',
                    value: 'Value1',
                    choices: ['Value1', 'Value2', 'Value3']
                });
                break;
            case 'input-date':
                Object.assign(output, {
                    name: 'date',
                    label: 'Date',
                    format: 'YYYY-MM-DD HH:mm',
                    value: '',
                    offset: 0,
                    enabled: false
                });
                break;
            case 'input-file':
                Object.assign(output, {
                    name: 'file',
                    label: 'File',
                    value: [],
                    multiple: false,
                    accept: 'image/*',
                    placeholder: 'Upload File'
                });
                break;
            case 'image':
                Object.assign(output, {
                    name: 'image'
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
                    label: 'Line Chart',
                    itemTitle: 'Item Title'
                });
                break;
        }
        return output;
    }

    static createBlockOptionsFields(options?: any): AppBlockElement[] {
        const output = [] as AppBlockElement[];
        const defaultValues = {
            gridColumnSpan: 1,
            orderIndex: 0
        };
        output.push({
            name: 'orderIndex',
            label: 'Order Index',
            type: 'input-number',
            min: 0,
            max: 100,
            value: options?.orderIndex || defaultValues.orderIndex
        });
        output.push({
            name: 'gridColumnSpan',
            label: 'Grid Columns Span',
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
                return element.value;
        }
        return String(element.value);
    }

    constructor(
        httpClient: HttpClient
    ) {
        super(httpClient);
        this.requestUrl = `${BASE_URL}applications`;
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
