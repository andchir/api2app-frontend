import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { BASE_URL } from '../../environments/environment';

import * as moment from 'moment';

import { ApplicationItem } from '../apps/models/application-item.interface';
import { DataService } from './data.service.abstract';
import { AppBlock, AppBlockElement, AppBlockElementType, AppOptions } from '../apps/models/app-block.interface';

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
                    name: 'text',
                    label: $localize `Text`,
                    type: 'input-text',
                    value: options?.text
                });
                output.push({
                    name: 'color',
                    label: $localize `Color`,
                    type: 'input-select',
                    value: options?.color,
                    choices: ['Green', 'Blue', 'Red']
                });
                output.push({
                    name: 'hiddenByDefault',
                    label: $localize `Hidden by default`,
                    type: 'input-switch',
                    enabled: options?.hiddenByDefault || false
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
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-text',
                    value: options?.value
                });
                output.push({
                    name: 'readOnly',
                    label: $localize `Read only`,
                    type: 'input-switch',
                    enabled: options?.readOnly || false
                });
                output.push({
                    name: 'required',
                    label: $localize `Required`,
                    type: 'input-switch',
                    enabled: options?.required || false
                });
                output.push({
                    name: 'hiddenByDefault',
                    label: $localize `Hidden by default`,
                    type: 'input-switch',
                    enabled: options?.hiddenByDefault || false
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
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-text',
                    value: options?.value
                });
                break;
            case 'input-slider':
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
                output.push({
                    name: 'step',
                    label: $localize `Step`,
                    type: 'input-number',
                    value: options?.step,
                    min: 0,
                    max: 100
                });
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-number',
                    value: options?.value,
                    min: 0
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
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-textarea',
                    value: options?.value
                });
                output.push({
                    name: 'readOnly',
                    label: $localize `Read only`,
                    type: 'input-switch',
                    enabled: options?.readOnly || false
                });
                output.push({
                    name: 'required',
                    label: $localize `Required`,
                    type: 'input-switch',
                    enabled: options?.required || false
                });
                break;
            case 'input-hidden':
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
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-text',
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
                output.push({
                    name: 'clearable',
                    label: $localize `Clearable`,
                    type: 'input-switch',
                    enabled: options?.clearable || false
                });
                output.push({
                    name: 'addTag',
                    label: $localize `Allow adding value`,
                    type: 'input-switch',
                    enabled: options?.addTag || false
                });
                output.push({
                    name: 'selectDefaultFirst',
                    label: $localize `Use first value as default`,
                    type: 'input-switch',
                    enabled: options?.selectDefaultFirst || false
                });
                output.push({
                    name: 'required',
                    label: $localize `Required`,
                    type: 'input-switch',
                    enabled: options?.required || false
                });
                output.push({
                    name: 'hiddenByDefault',
                    label: $localize `Hidden by default`,
                    type: 'input-switch',
                    enabled: options?.hiddenByDefault || false
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
                output.push({
                    name: 'required',
                    label: $localize `Required`,
                    type: 'input-switch',
                    enabled: options?.required || false
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
                output.push({
                    name: 'required',
                    label: $localize `Required`,
                    type: 'input-switch',
                    enabled: options?.required || false
                });
                break;
            case 'input-color':
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
                    type: 'input-text',
                    value: options?.value
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
                output.push({
                    name: 'required',
                    label: $localize `Required`,
                    type: 'input-switch',
                    enabled: options?.required || false
                });
                break;
            case 'audio':
            case 'video':
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
            case 'input-chart-line':
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
                    name: 'isXAxisDate',
                    label: $localize `X axis is date`,
                    type: 'input-switch',
                    enabled: options?.isXAxisDate
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
                output.push({
                    name: 'itemFieldName',
                    label: $localize `Field name in the array`,
                    type: 'input-text',
                    value: options?.itemFieldName
                });
                break;
            case 'input-pagination':
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
                    name: 'perPage',
                    label: $localize `Items per page`,
                    type: 'input-number',
                    min: 0,
                    max: 100,
                    value: options?.perPage
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
                    whiteSpacePre: false,
                    hiddenByDefault: false
                });
                break;
            case 'button':
                Object.assign(output, {
                    name: 'submit',
                    text: $localize `Submit`,
                    color: 'Green',
                    hiddenByDefault: false
                });
                break;
            case 'input-text':
                Object.assign(output, {
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    placeholder: $localize `Enter your name`,
                    prefixText: '',
                    suffixText: '',
                    readOnly: false,
                    required: true,
                    hiddenByDefault: false,
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
            case 'input-slider':
                Object.assign(output, {
                    name: 'range',
                    label: $localize `Range`,
                    type: 'input-slider',
                    min: 0,
                    max: 100,
                    step: 1,
                    value: 0
                });
                break;
            case 'input-textarea':
                Object.assign(output, {
                    name: 'content',
                    label: $localize `Content`,
                    type: 'input-textarea',
                    placeholder: $localize `Enter your message here`,
                    prefixText: '',
                    suffixText: '',
                    readOnly: false,
                    required: true,
                    value: ''
                });
                break;
            case 'input-hidden':
                Object.assign(output, {
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    prefixText: '',
                    suffixText: '',
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
                    placeholder: $localize `Please Select`,
                    itemFieldNameForTitle: '',
                    itemFieldNameForValue: '',
                    choices: ['Value1', 'Value2', 'Value3'],
                    required: true,
                    clearable: true,
                    addTag: false,
                    selectDefaultFirst: true,
                    hiddenByDefault: false,
                    value: 'Value1'
                });
                break;
            case 'input-tags':
                Object.assign(output, {
                    name: 'tags',
                    label: $localize `Tags`,
                    type: 'input-select',
                    placeholder: $localize `Please Add Tags`,
                    required: true,
                    hiddenByDefault: false,
                    choices: [],
                    value: ['Value1', 'Value2', 'Value3']
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
                    offset: 0,
                    useDefault: false,
                    required: true,
                    value: ''
                });
                break;
            case 'input-color':
                Object.assign(output, {
                    name: 'color',
                    label: $localize `Color`,
                    type: 'input-color',
                    value: ''
                });
                break;
            case 'input-file':
                Object.assign(output, {
                    name: 'file',
                    label: $localize `File`,
                    multiple: false,
                    accept: 'image/*',
                    placeholder: $localize `Upload File`,
                    required: true,
                    value: []
                });
                break;
            case 'image':
                Object.assign(output, {
                    name: 'image',
                    itemFieldName: '',
                    itemThumbnailFieldName: '',
                    hiddenByDefault: false
                });
                break;
            case 'audio':
            case 'video':
                Object.assign(output, {
                    name: type,
                    hiddenByDefault: false
                });
                break;
            case 'input-chart-line':
                Object.assign(output, {
                    name: 'chart',
                    label: $localize `Line Chart`,
                    itemTitle: $localize `Item Title`,
                    fieldNameAxisXL: '',
                    fieldNameAxisY: '',
                    itemFieldName: 'id',
                    isXAxisDate: false,
                    format: 'MMM DD, HH:mm',
                    hiddenByDefault: false
                });
                break;
            case 'input-pagination':
                Object.assign(output, {
                    name: 'pages',
                    perPage: 20,
                    value: 1
                });
                break;
        }
        return output;
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
            language: '',
            blocks: [{elements: []}, {elements: []}, {elements: []}]
        };
    }
}
