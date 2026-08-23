import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { BASE_URL } from '../../environments/environment';
import { environment } from '../../environments/environment';

import {catchError, Observable} from 'rxjs';
import moment from 'moment';

import {
    ApplicationItem,
    ApplicationShareData,
    ApplicationShareRequestParams
} from '../apps/models/application-item.interface';
import { DataService } from './data.service.abstract';
import {
    AppBlock,
    AppBlockElement,
    AppBlockOptions,
    AppOptions
} from '../apps/models/app-block.interface';
import { VkAppOptions } from "../apps/models/vk-app-options.interface";

declare const vkBridge: any;

@Injectable()
export class ApplicationService extends DataService<ApplicationItem> {

    private static localStorageUpdateQueues = new Map<string, Promise<void>>();
    private static vkStorageUpdateQueues = new Map<string, Promise<void>>();

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        httpClient: HttpClient
    ) {
        super(httpClient);
        this.requestUrl = `assets/app_`;
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

    userBalance(appUuid: string): Observable<{success: boolean, balance?: number}> {
        const url = `${BASE_URL}user_balance/${appUuid}`;
        return this.httpClient.get<{success: boolean, balance?: number}>(url, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    userBalanceVkApp(appUuid: string, vkAppOptions: VkAppOptions): Observable<{success: boolean, balance?: number}> {
        const url = `${BASE_URL}user_balance_vk/${appUuid}`;
        const data = {
            'vk_app_launch_params': vkAppOptions?.appLaunchParamsJson
        };
        return this.httpClient.post<{success: boolean, balance?: number}>(url, data, this.httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    createShareAppData(params: ApplicationShareRequestParams): Observable<ApplicationShareData> {
        const url = `${this.requestUrl}/${params.appUuid}/create_share_link`
        return this.httpClient.post<ApplicationShareData>(url, params, this.httpOptions)
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
            name: 'maxHeight',
            label: $localize `Maximum container height`,
            type: 'input-number',
            min: 0,
            max: 1000,
            value: options?.maxHeight || 0
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
        output.push({
            name: 'isStickyPosition',
            label: $localize `Sticky position`,
            type: 'input-switch',
            enabled: options?.isStickyPosition || false
        });
        return output;
    }

    static getBlockDefaults(): AppBlock {
        return {
            elements: [],
            loading: false,
            options: ApplicationService.getBlockOptionsDefaults()
        };
    }

    static getBlockOptionsDefaults(): AppBlockOptions {
        return {
            orderIndex: 0,
            gridColumnSpan: 1,
            messageSuccess: $localize `The form has been submitted successfully.`,
            autoClear: false,
            showLoading: true,
            isStickyPosition: false
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

    static getElementValue(element: AppBlockElement): string|any[]|number|boolean|File|File[]|null
    {
        if (!element) {
            return null;
        }
        if (!element.value && !element.valueArr && !element.valueObj) {
            return ApplicationService.getFieldDefaultValue(element.type);
        }
        let fieldValue = element.valueOutput || element.value || null;
        if (typeof fieldValue === 'string') {
            fieldValue = fieldValue.trim();
        }
        const fieldValueArr = element.valueArr || null;
        switch (element.type) {
            case 'input-tags':
                return Array.isArray(fieldValue) ? fieldValue : [];
            case 'input-date':
                const value = String(fieldValue);
                const dateRangeValues = value.split(/\s+-\s+/);
                if (dateRangeValues.length === 2 && dateRangeValues.every((dateValue) => dateValue.trim())) {
                    return value;
                }
                const dateFormat = element?.format;
                const date = moment(value);
                return date.format(dateFormat);
            case 'audio':
                if (fieldValue && fieldValue['changingThisBreaksApplicationSecurity']) {
                    const value = fieldValue['changingThisBreaksApplicationSecurity'];
                    if (value.includes('data:audio')) {
                        return ApplicationService.dataURItoFile(value);
                    }
                    return String(value);
                }
                return String(fieldValue);
            case 'input-file':
            case 'image':
                if (Array.isArray(fieldValue)) {
                    return !element.multiple && (fieldValue as File[]).length > 0
                        ? fieldValue[0]
                        : fieldValue;
                }
                return fieldValue instanceof File ? fieldValue : null;
            case 'input-number':
            case 'input-slider':
                return typeof fieldValue === 'string'
                    ? parseFloat(String(fieldValue).replace(',', '.'))
                    : fieldValue as number;
            case 'messages':
                const OUTGOING_PREFIX = '\u200B__out__';
                const raw = String(fieldValue);
                return raw.startsWith(OUTGOING_PREFIX) ? raw.slice(OUTGOING_PREFIX.length) : raw;
            case 'table':
                return fieldValueArr;
        }
        return fieldValue ? String(fieldValue) : null;
    }

    private static parseLocalStorageData(value: string | null): Record<string, any> | null {
        if (value === null) {
            return null;
        }
        try {
            const data = JSON.parse(value);
            return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    private static getLocalStorageData(dataKey: string): Promise<Record<string, any>> {
        const cachedData = ApplicationService.parseLocalStorageData(window.localStorage.getItem(dataKey));
        if (cachedData !== null) {
            return Promise.resolve(cachedData);
        }
        if (typeof vkBridge === 'undefined' || !window['isVKApp']) {
            return Promise.resolve({});
        }
        return vkBridge.send('VKWebAppStorageGet', {keys: [dataKey]})
            .then((data) => {
                const dataStr = data.keys?.[0]?.value;
                const dataObj = ApplicationService.parseLocalStorageData(dataStr || null) || {};
                window.localStorage.setItem(dataKey, JSON.stringify(dataObj));
                return dataObj;
            })
            .catch((error) => {
                console.log(error);
                return {};
            });
    }

    private static updateLocalStorageData(
        dataKey: string,
        update: (data: Record<string, any>) => void
    ): void {
        const previousUpdate = ApplicationService.localStorageUpdateQueues.get(dataKey) || Promise.resolve();
        const currentUpdate = previousUpdate
            .catch(() => undefined)
            .then(async () => {
                const dataObj = await ApplicationService.getLocalStorageData(dataKey);
                update(dataObj);

                const dataStr = JSON.stringify(dataObj);
                if (Object.keys(dataObj).length === 0) {
                    window.localStorage.removeItem(dataKey);
                } else {
                    window.localStorage.setItem(dataKey, dataStr);
                }

                ApplicationService.updateVkStorageData(dataKey, dataStr);
            });

        ApplicationService.localStorageUpdateQueues.set(dataKey, currentUpdate);
        currentUpdate
            .catch((error) => console.log(error))
            .finally(() => {
                if (ApplicationService.localStorageUpdateQueues.get(dataKey) === currentUpdate) {
                    ApplicationService.localStorageUpdateQueues.delete(dataKey);
                }
            });
    }

    private static updateVkStorageData(dataKey: string, dataStr: string): void {
        if (typeof vkBridge === 'undefined' || !window['isVKApp']) {
            return;
        }

        const previousUpdate = ApplicationService.vkStorageUpdateQueues.get(dataKey) || Promise.resolve();
        const currentUpdate = previousUpdate
            .catch(() => undefined)
            .then(() => vkBridge.send('VKWebAppStorageSet', {key: dataKey, value: dataStr}));

        ApplicationService.vkStorageUpdateQueues.set(dataKey, currentUpdate);
        currentUpdate
            .catch((error) => console.log(error))
            .finally(() => {
                if (ApplicationService.vkStorageUpdateQueues.get(dataKey) === currentUpdate) {
                    ApplicationService.vkStorageUpdateQueues.delete(dataKey);
                }
            });
    }

    static localStoreValueClear(appUuid: string, element: AppBlockElement): void {
        const apiUuid = element.options?.inputApiUuid || element.options?.outputApiUuid;
        if (!apiUuid) {
            return;
        }
        const dataKey = `${appUuid}-${apiUuid}`;
        const key = `${element.type}-${element.name}`;
        ApplicationService.updateLocalStorageData(dataKey, (dataObj) => {
            delete dataObj[key];
        });
    }

    static localStoreValue(appUuid: string, element: AppBlockElement): void {
        if (!element['storeValue']) {
            return;
        }
        const value = ApplicationService.getElementValue(element);
        const apiUuid = element.options?.inputApiUuid || element.options?.outputApiUuid;
        if (!apiUuid) {
            return;
        }
        const dataKey = `${appUuid}-${apiUuid}`;
        const key = `${element.type}-${element.name}`;
        ApplicationService.updateLocalStorageData(dataKey, (dataObj) => {
            dataObj[key] = value;
        });
    }

    static getLocalStorageValue(appUuid: string, element: AppBlockElement): Promise<any> {
        if (!element['storeValue']) {
            return Promise.resolve(null);
        }
        const apiUuid = element.options?.inputApiUuid || element.options?.outputApiUuid;
        if (!apiUuid) {
            return Promise.resolve(null);
        }
        const dataKey = `${appUuid}-${apiUuid}`;
        const key = `${element.type}-${element.name}`;
        return ApplicationService.getLocalStorageData(dataKey).then((dataObj) => {
            return Object.prototype.hasOwnProperty.call(dataObj, key) ? dataObj[key] : undefined;
        });
    }

    static applyLocalStoredValue(appUuid: string, element: AppBlockElement): Promise<void> {
        if (!element['storeValue']) {
            return Promise.resolve();
        }
        const apiUuid = element.options?.inputApiUuid || element.options?.outputApiUuid;
        if (!apiUuid) {
            return Promise.resolve();
        }
        return ApplicationService.getLocalStorageValue(appUuid, element)
            .then((value) => {
                if (typeof value !== 'undefined') {
                    element.value = value;
                }
            });
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

    static getFieldDefaultValue(fieldType: string): string|number|boolean|null {
        let value: string|number|boolean|null = '';
        switch (fieldType) {
            case 'input-number':
            case 'input-slider':
                value = 0;
                break;
            case 'input-file':
            case 'image':
                value = null;
                break;
        }
        return value;
    }

    static createInputStringValue(element: AppBlockElement, value: any, skipTags: boolean = false): string {
        // Use the prefix and suffix only when the value is finally used
        const usePrefixSuffix = !['input-text', 'input-textarea', 'input-switch', 'input-select'].includes(element.type);
        return ApplicationService.createStringValue(element, value, skipTags, true, usePrefixSuffix);
    }

    static createStringValue(element: AppBlockElement, value: any, skipTags: boolean = false, trim: boolean = true, usePrefixSuffix: boolean = true): string {
        const prefixText = usePrefixSuffix ? (element.prefixText || '') : '';
        const suffixText = usePrefixSuffix ? (element.suffixText || '') : '';
        if (typeof value === 'object' && Array.isArray(value)) {
            value = value.map(item => {
                if (typeof item === 'object' && item !== null) {
                    return JSON.stringify(item);
                }
                return String(item);
            }).join('');
        } else if (typeof value === 'object') {
            value = JSON.stringify(value, null, 2);
        } else if (typeof value === 'number') {
            value = String(value);
        }
        if (prefixText && prefixText.match(/https?:\/\//) && prefixText.endsWith('=')) {
            value = prefixText + encodeURIComponent(value);
        } else if (prefixText && (!/[{}]/.test(prefixText) || !skipTags)) {
            value = prefixText + value;
        }
        if (suffixText && (!/[{}]/.test(suffixText) || !skipTags)) {
            value += suffixText;
        }
        if (trim && value) {
            return value.trim();
        }
        return value;
    }

    static async downloadFile(source: string | Blob, filename: string = ''): Promise<boolean> {
        /*if (typeof source === 'string'
            && /^https?:\/\//.test(source)
            && typeof vkBridge !== 'undefined'
            && window['isVKApp']
        ) {
            try {
                const vkFilename = filename || ApplicationService.getDownloadFilename(source, new Blob());
                const result = await vkBridge.send('VKWebAppDownloadFile', {
                    url: source,
                    filename: vkFilename
                });
                if (result?.result) {
                    return true;
                }
            } catch (error) {
                console.warn('VK file download failed, falling back to browser download:', error);
            }
        }*/

        try {
            let blob: Blob;
            if (source instanceof Blob) {
                blob = source;
            } else if (source.startsWith('data:')) {
                blob = ApplicationService.dataUriToBlob(source);
            } else {
                const response = await fetch(source, {
                    mode: 'cors',
                    cache: 'no-cache'
                });
                if (!response.ok) {
                    throw new Error(`Loading error: ${response.status}`);
                }
                blob = await response.blob();
                filename = filename || ApplicationService.getResponseFilename(response);
            }

            filename = filename || ApplicationService.getDownloadFilename(source, blob);
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            }, 60_000);

            return true;
        } catch (error) {
            console.log(error);
            if (typeof source === 'string' && !source.startsWith('data:')) {
                window.open(source, '_blank')?.focus();
            }
            return false;
        }
    }

    private static getResponseFilename(response: Response): string {
        const disposition = response.headers.get('content-disposition') || '';
        const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
        const regularMatch = disposition.match(/filename="?([^";]+)"?/i);
        const value = utf8Match?.[1] || regularMatch?.[1] || '';
        try {
            return decodeURIComponent(value);
        } catch {
            return value;
        }
    }

    private static getDownloadFilename(source: string | Blob, blob: Blob): string {
        if (typeof source === 'string' && !source.startsWith('data:')) {
            const value = source.split('/').pop()?.split('?')[0].split('#')[0] || '';
            if (value) {
                try {
                    return decodeURIComponent(value);
                } catch {
                    return value;
                }
            }
        }
        const extension = blob.type.split(';')[0].split('/')[1] || 'bin';
        return `file.${extension}`;
    }

    static downloadDataURI(dataURI: string, filename: string = 'file'): void {
        void ApplicationService.downloadFile(dataURI, filename);
    }

    static getFileExtension(url: string): string {
        const base = url.split('?')[0].split('#')[0];
        const extension = base.split('.').pop();
        if (!extension || extension.length > 6 || extension === base) {
            return '';
        }
        return extension.toLowerCase();
    }

    static getDefault(): ApplicationItem {
        return {
            id: 0,
            name: '',
            uuid: '',
            shared: false,
            hidden: false,
            advertising: true,
            adultsOnly: false,
            gridColumns: 2,
            language: '',
            image: '',
            blocks: [
                {tabIndex: -1, elements: [], options: ApplicationService.getBlockOptionsDefaults()},
                {tabIndex: -1, elements: [], options: ApplicationService.getBlockOptionsDefaults()}
            ],
            user_id: 0
        };
    }

    static getLanguagesList(addAllItem: boolean = false): {name: string, title: string}[] {
        let languagesList = [
            {
                name: 'en',
                title: 'English'
            },
            {
                name: 'ru',
                title: 'Русский'
            },
            {
                name: 'fr',
                title: 'Français'
            },
            {
                name: 'de',
                title: 'Deutsch'
            },
            {
                name: 'es',
                title: 'Español'
            }
        ].filter((item) => {
            return environment.languages.includes(item.name);
        });
        if (addAllItem) {
            languagesList.unshift({
                name: 'all',
                title: $localize `All languages`
            });
        }
        return languagesList;
    }

    static findBlockElementByName(elementName: string, blocks: AppBlock[]): AppBlockElement {
        if (!elementName) {
            return null;
        }
        let resultElement = null;
        for (const block of blocks) {
            if (resultElement) {
                break;
            }
            resultElement = block.elements.find((element) => {
                return element.name === elementName;
            });
        }
        return resultElement;
    }

    static processStringTags(inputString: string, blocks: AppBlock[]): string {
        const tags = ApplicationService.findStringTags(inputString, true);
        if (tags.length === 0) {
            return inputString;
        }
        tags.forEach((tagName) => {
            const element = ApplicationService.findBlockElementByName(tagName, blocks);
            if (!element) {
                return;
            }
            const elementValue = String(element.value || '');
            inputString = inputString.replace(`{${tagName}}`, elementValue);
        });
        return inputString;
    }

    static findStringTags(content: string, skipSpace = false): string [] {
        const tags = [];
        const regex = /\{([^}]+)\}/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            if (match[1] && match[1].trim() !== '' && (!skipSpace || !/\s/.test(match[1]))) {
                tags.push(match[1]);
            }
        }
        return tags;
    }

    static deleteBlockElementsByIndexArr(block: AppBlock, indexes: number[]): void {
        block.elements = block.elements.filter((_, index) => !indexes.includes(index));
    }

    trimSubstring(str: string, substringStart: string, substringEnd: string): string {
        let result = str;
        while (result.startsWith(substringStart)) {
            result = result.slice(substringStart.length);
        }
        while (result.endsWith(substringEnd)) {
            result = result.slice(0, -substringEnd.length);
        }
        return result;
    }

    flattenObjInArray(inputArr: any[], includeParents: boolean = false): any[] {
        return inputArr.map((item) => {
            return this.flattenObj(item, includeParents);
        });
    }

    isJson(str: any): boolean {
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

    filterArrayValues(valueArr: any[], itemFieldName: string): any[] {
        if (!itemFieldName || !valueArr) {
            return valueArr;
        }
        valueArr = valueArr.filter((item) => {
            const value = item[itemFieldName] || '';
            return !!value && !this.isJson(value);
        });
        return valueArr;
    }

    flattenObj(
        obj: any,
        includeParents: boolean = false,
        parent: string = '',
        res: Record<string, any> = {},
        seen: WeakSet<object> = new WeakSet()
    ): Record<string, any> {
        // Handle null and primitive values
        if (obj === null || typeof obj !== 'object') {
            if (parent !== '') {
                res[parent] = obj; // Store primitive with its full path
            } else {
                // If no parent key, store under an empty string key
                res[''] = obj;
            }
            return res;
        }

        // Detect and handle circular references
        if (seen.has(obj)) {
            res[parent] = '[Circular]'; // Mark circular reference instead of recursing infinitely
            return res;
        }
        seen.add(obj); // Mark this object as visited

        // Handle arrays
        if (Array.isArray(obj)) {
            if (obj.length === 0) {
                // Empty array: store it as an empty array if there's a parent key
                if (parent !== '') {
                    res[parent] = [];
                }
                return res;
            }

            if (includeParents && parent !== '') {
                res[parent] = obj;
            }

            obj.forEach((item, index) => {
                const propName = parent ? `${parent}.${index}` : String(index);
                this.flattenObj(item, includeParents, propName, res, seen);
            });
            return res;
        }

        // Handle plain objects
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            // Empty object: store it as an empty object if there's a parent key
            if (parent !== '') {
                res[parent] = {};
            }
            return res;
        }

        if (includeParents && parent !== '') {
            res[parent] = obj;
        }

        for (const key of keys) {
            const propName = parent ? `${parent}.${key}` : key;
            this.flattenObj(obj[key], includeParents, propName, res, seen);
        }

        return res;
    }

    getNodeTypes(flatObj: any): Record<string, 'array' | 'object'> {
        const types: Record<string, 'array' | 'object'> = {};

        for (const key in flatObj) {
            if (!Object.prototype.hasOwnProperty.call(flatObj, key)) continue;

            const segments = key.split('.');
            // For every parent path (prefix) we check the next segment
            for (let i = 0; i < segments.length - 1; i++) {
                const prefix = segments.slice(0, i + 1).join('.');
                const nextSegment = segments[i + 1];
                const isNextNumeric = /^\d+$/.test(nextSegment);

                if (isNextNumeric) {
                    // This prefix must be an array because it has a numeric child
                    types[prefix] = 'array';
                } else if (types[prefix] !== 'array') {
                    // If not forced to be array, it's an object (default)
                    types[prefix] = 'object';
                }
            }
        }
        return types;
    }

    unFlattenObject(flatObj: any): any {
        const nodeTypes = this.getNodeTypes(flatObj);
        const result: any = {};

        for (const key in flatObj) {
            if (!Object.prototype.hasOwnProperty.call(flatObj, key)) continue;

            const segments = key.split('.');
            let current = result;

            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                const isLast = i === segments.length - 1;
                const parentPath = segments.slice(0, i + 1).join('.');

                if (!isLast) {
                    const shouldBeArray = nodeTypes[parentPath] === 'array';

                    if (shouldBeArray) {
                        // Ensure we have an array at this level
                        if (!current[segment]) {
                            current[segment] = [];
                        } else if (!Array.isArray(current[segment])) {
                            // Convert existing object to array (preserve string keys)
                            const obj = current[segment];
                            current[segment] = [];
                            for (const prop in obj) {
                                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                                    current[segment][prop] = obj[prop];
                                }
                            }
                        }
                    } else {
                        // Object case
                        if (!current[segment] || Array.isArray(current[segment])) {
                            // If it's an array but should be object, convert (rare)
                            current[segment] = {};
                        }
                    }
                    current = current[segment];
                } else {
                    // Assign the leaf value
                    current[segment] = flatObj[key];
                }
            }
        }
        return result;
    }

    isButtonAutoStartIgnore(outputElements: AppBlockElement[], inputElements: AppBlockElement[] = []): boolean {
        if (outputElements.length === 1 && ['table'].includes(outputElements[0].type)) {
            return true;
        }
        const requiredInputElements = inputElements.filter(element => {
            return element.required && !element.hidden;
        });
        if (requiredInputElements.length === 0) {
            return true;
        }
        return false;
    }

    isElementRequired(element: AppBlockElement): boolean {
        if (!element.required) {
            return false;
        }
        return !element.hidden && element.required;
    }
}
