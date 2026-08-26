import { SafeResourceUrl } from '@angular/platform-browser';

export type AppBlockElementType = null|'text-header'|'text'|'button'|'input-text'|'input-textarea'|'input-switch'
    |'input-select'|'input-radio'|'input-tags'|'input-number'|'input-hidden'|'input-date'|'input-file'|'image'
    |'audio'|'video'|'input-chart-line'|'input-chart-pie'|'input-slider'|'input-color'|'input-pagination'|'status'|'progress'|'table'
    |'input-select-image'|'user-subscription'|'image-comparison'|'iframe'|'messages' |'input-rating';

export interface AppOptions {
    [key: string]: string | number | boolean | string[] | SafeResourceUrl | File[];
}

export interface AppBlockElementOptions {
    inputApiUuid?: string;
    inputApiFieldName?: string|number;
    inputApiFieldType?: string;
    outputApiUuid?: string;
    outputApiFieldName?: string|number;
    outputApiFieldType?: string;
    queryParameterName?: string;
}

export interface AppBlockElementBase {
    type: AppBlockElementType;
    name?: string;
    label?: string;
    placeholder?: string;
    validationMessage?: string;
    orderIndex?: number;
    blockIndex?: number;
    options?: AppBlockElementOptions;
}

export interface AppBlockElementValue {
    choices?: string[];
    min?: number;
    max?: number;
    format?: string;
    value?: string | number | boolean | string[] | File | File[] | SafeResourceUrl | null;
    valueArr?: string[] | {label: string, value: string}[] | File[] | null;
    valueObj?: any | null;
    valueOutput?: string;
    keys?: string[];
    headers?: string[];
    rows?: number;
    note?: string;
    noteOutput?: string;
    allowAdd?: boolean;
    valueAsString?: boolean;
}

export interface AppBlockElementDataMapping {
    fieldNameAxisX?: string;
    fieldNameAxisY?: string;
    fieldNameCategory?: string;
    fieldNameValue?: string;
    isXAxisDate?: boolean;
    perPage?: number,
    statusCompleted?: string;
    statusError?: string;
    itemFieldNameForTitle?: string;
    itemFieldNameForValue?: string;
    itemFieldName?: string;
    itemThumbnailFieldName?: string;
    loadValueInto?: string;
    valueFrom?: string;
    linkedField?: string;
}

export interface AppBlockElementPresentation {
    color?: string;
    prefixText?: string;
    suffixText?: string;
    markdown?: boolean;
    icon?: string;
    isHTML?: boolean;
    showOnlyInVK?: boolean;
    statusCompletedText?: string;
    statusCompletedTextForVK?: string;
    confirmationText?: string,
    fontSize?: string;
    autoHeight?: boolean;
}

export interface AppBlockElementBehavior {
    enabled?: boolean;
    required?: boolean;
    readOnly?: boolean;
    clearable?: boolean;
    multiple?: boolean;
    selectDefaultFirst?: boolean;
    useDefault?: boolean;
    editable?: boolean,
    useAsOffset?: boolean;
    hidden?: boolean;
    hiddenByField?: string;
    hiddenByDefault?: boolean;
    subscriptionId?: string;
    storeValue?: boolean;
    useCropper?: boolean;
    isClearForm?: boolean;
    isDownloadMode?: boolean;
    isStickyPosition?: boolean;
    isBooleanValue?: boolean;
    allowAutoSubmit?: boolean;
}

export interface AppBlockElement extends AppBlockElementBase, AppBlockElementValue,
    AppBlockElementDataMapping, AppBlockElementPresentation, AppBlockElementBehavior {}

export interface AppBlockOptions {
    gridColumnSpan?: number;
    orderIndex?: number;
    tabIndex?: number;
    autoClear?: boolean;
    showLoading?: boolean;
    messageSuccess?: string;
    isStickyPosition?: boolean;
    maxHeight?: number;
}

export interface AppBlock {
    elements: AppBlockElement[];
    options?: AppBlockOptions;
    loading?: boolean;
    tabIndex?: number;
}
