import { ApiItem } from '../models/api-item.interface';
import { RequestDataField } from '../models/request-data-field.interface';

const BODY_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export function apiItemToCurl(apiItem: ApiItem): string {
    const method = (apiItem.requestMethod || 'GET').toUpperCase();
    const exportAsFormData = shouldExportAsFormData(apiItem);
    const headers = getHeaders(apiItem, exportAsFormData);
    const body = getBody(apiItem, exportAsFormData);
    const lines = [
        `curl -X ${method} ${shellQuote(getUrlWithQueryParams(apiItem))}`
    ];

    if (apiItem.basicAuth && apiItem.authLogin && apiItem.authPassword) {
        lines.push(`  -u ${shellQuote(`${apiItem.authLogin}:${apiItem.authPassword}`)}`);
    }

    Object.keys(headers).forEach((name) => {
        lines.push(`  -H ${shellQuote(`${name}: ${headers[name]}`)}`);
    });

    if (exportAsFormData) {
        body.formFields.forEach((field) => {
            lines.push(`  -F ${shellQuote(`${field.name}=${field.value}`)}`);
        });
    } else if (BODY_METHODS.includes(method) && body.rawBody !== null) {
        lines.push(`  --data-raw ${shellQuote(body.rawBody)}`);
    }

    return lines.join(' \\\n');
}

function shouldExportAsFormData(apiItem: ApiItem): boolean {
    if (apiItem.bodyDataSource !== 'fields') {
        return false;
    }
    return apiItem.sendAsFormData || hasActiveFileFields(apiItem.bodyFields);
}

function getUrlWithQueryParams(apiItem: ApiItem): string {
    const requestUrl = apiItem.requestUrl || '';
    const queryParams = getActiveFields(apiItem.queryParams);
    if (queryParams.length === 0) {
        return requestUrl;
    }

    try {
        const url = new URL(requestUrl);
        queryParams.forEach((item) => {
            url.searchParams.append(item.name, String(item.value));
        });
        return url.toString();
    } catch (e) {
        const search = queryParams
            .map((item) => `${encodeURIComponent(item.name)}=${encodeURIComponent(String(item.value))}`)
            .join('&');
        return `${requestUrl}${requestUrl.includes('?') ? '&' : '?'}${search}`;
    }
}

function getHeaders(apiItem: ApiItem, sendAsFormData: boolean): {[key: string]: string} {
    const headers: {[key: string]: string} = {};
    getActiveFields(apiItem.headers).forEach((item) => {
        headers[item.name] = String(item.value);
    });
    if (sendAsFormData) {
        delete headers['Content-Type'];
        delete headers['content-type'];
    }
    return headers;
}

function getBody(apiItem: ApiItem, sendAsFormData: boolean): {rawBody: string | null; formFields: {name: string; value: string}[]} {
    if (apiItem.bodyDataSource === 'raw') {
        return {
            rawBody: apiItem.bodyContent || null,
            formFields: []
        };
    }

    if (sendAsFormData) {
        return {
            rawBody: null,
            formFields: getActiveFields(apiItem.bodyFields, true)
                .filter((item) => item.name !== 'opt_vk_data')
                .flatMap((item) => getFormDataCurlFields(item))
        };
    }

    const body = {};
    getActiveFields(apiItem.bodyFields)
        .filter((item) => item.name !== 'opt_vk_data')
        .forEach((item) => {
            body[item.name] = normalizeFieldValue(item.value);
        });

    return {
        rawBody: Object.keys(body).length > 0 ? JSON.stringify(body, null, 2) : null,
        formFields: []
    };
}

function getActiveFields(fields: RequestDataField[], includeFiles = false): RequestDataField[] {
    return (fields || []).filter((item) => {
        if (!item.name || item.hidden) {
            return false;
        }
        if (includeFiles && item.isFile) {
            return true;
        }
        return item.value !== null && typeof item.value !== 'undefined' && item.value !== '';
    });
}

function hasActiveFileFields(fields: RequestDataField[]): boolean {
    return (fields || []).some((item) => {
        return !!item.name && !item.hidden && !!item.isFile;
    });
}

function getFormDataCurlFields(item: RequestDataField): {name: string; value: string}[] {
    if (item.isFile) {
        if (item.files?.length) {
            return item.files.map((file) => ({
                name: item.name,
                value: `@${file.name}`
            }));
        }
        return [{
            name: item.name,
            value: item.value ? `@${String(item.value)}` : '@file'
        }];
    }
    return [{
        name: item.name,
        value: String(item.value)
    }];
}

function normalizeFieldValue(value: RequestDataField['value']): any {
    if (value === '[]') {
        return [];
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return value;
}

function shellQuote(value: string): string {
    return `'${String(value).replace(/'/g, `'\\''`)}'`;
}
