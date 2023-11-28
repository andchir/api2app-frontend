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
                    value: options?.name || 'header1',
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: 'Value',
                    type: 'input-textarea',
                    value: options?.value || 'Header Text',
                    choices: []
                });
                break;
            case 'text':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'text1',
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: 'Value',
                    type: 'input-textarea',
                    value: options?.value || 'Example Text',
                    choices: []
                });
                break;
            case 'button':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'submit',
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: 'Text',
                    type: 'input-text',
                    value: options?.text || 'Submit',
                    choices: []
                });
                break;
            case 'input-text':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'name',
                    choices: []
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Text Field',
                    choices: []
                });
                output.push({
                    name: 'placeholder',
                    label: 'Placeholder',
                    type: 'input-text',
                    value: options?.placeholder || 'Enter your name',
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: 'Default Value',
                    type: 'input-text',
                    value: options?.value || '',
                    choices: []
                });
                break;
            case 'input-textarea':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'content',
                    choices: []
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Content',
                    choices: []
                });
                output.push({
                    name: 'placeholder',
                    label: 'Placeholder',
                    type: 'input-text',
                    value: options?.placeholder || 'Enter your message here',
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: 'Default Value',
                    type: 'input-textarea',
                    value: options?.value || '',
                    choices: []
                });
                break;
            case 'input-switch':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'enabled',
                    choices: []
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Enabled',
                    choices: []
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
                    value: options?.name || 'select',
                    choices: []
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Example Select',
                    choices: []
                });
                output.push({
                    name: 'choices',
                    label: 'Choices',
                    type: 'input-tags',
                    value: ['Value1', 'Value2', 'Value3'],
                    choices: []
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
