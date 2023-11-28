import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { ApplicationItem } from '../apps/models/application-item.interface';
import { DataService } from './data.service.abstract';
import { AppBlockElement, AppBlockElementType, AppOptions } from "../apps/models/app-block.interface";

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
                    value: options?.name || 'header1'
                });
                output.push({
                    name: 'value',
                    label: 'Value',
                    type: 'input-textarea',
                    value: options?.value || 'Header Text'
                });
                break;
            case 'text':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'text1'
                });
                output.push({
                    name: 'value',
                    label: 'Value',
                    type: 'input-textarea',
                    value: options?.value || 'Example Text'
                });
                break;
            case 'button':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'submit'
                });
                output.push({
                    name: 'value',
                    label: 'Text',
                    type: 'input-text',
                    value: options?.text || 'Submit'
                });
                break;
            case 'input-text':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'name'
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Text Field'
                });
                output.push({
                    name: 'placeholder',
                    label: 'Placeholder',
                    type: 'input-text',
                    value: options?.placeholder || 'Enter your name'
                });
                output.push({
                    name: 'value',
                    label: 'Default Value',
                    type: 'input-text',
                    value: options?.value || ''
                });
                break;
            case 'input-textarea':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'content'
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Content'
                });
                output.push({
                    name: 'placeholder',
                    label: 'Placeholder',
                    type: 'input-text',
                    value: options?.placeholder || 'Enter your message here'
                });
                output.push({
                    name: 'value',
                    label: 'Default Value',
                    type: 'input-textarea',
                    value: options?.value || ''
                });
                break;
            case 'input-switch':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'enabled'
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Enabled'
                });
                output.push({
                    name: 'value',
                    label: 'Default Value',
                    type: 'input-switch',
                    value: options?.value !== null,
                    choices: []
                });
                break;
            case 'input-select':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'select'
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Example Select'
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
                    value: options?.name || 'tags'
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Tags'
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
                    name: 'radio',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'radio'
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Example Radio Buttons'
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
                    value: 'Example Text'
                });
                break;
            case 'button':
                Object.assign(output, {
                    name: 'submit',
                    value: 'Submit'
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
                    value: true
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
        }
        return output;
    }

    static fieldsToOptionsObject(fields: AppBlockElement[]): any {
        const output = {} as AppOptions;
        fields.forEach((item) => {
            output[item.name] = item.value;
        });
        return output;
    }

    constructor(
        httpClient: HttpClient
    ) {
        super(httpClient);
        this.requestUrl = `${BASE_URL}apps_items`;
    }

    static getDefault(): ApplicationItem {
        return {
            id: 0,
            name: '',
            uuid: '',
            shared: false,
            gridColumns: 3
        };
    }
}
