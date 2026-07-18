import { SafeResourceUrl } from '@angular/platform-browser';
import { PaginationInstance } from 'ngx-pagination';

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

export type AppBlockElementValue = string | number | boolean | string[] | File | File[] | SafeResourceUrl | null;
export type AppBlockElementRecord = Record<string, unknown>;
export type AppBlockElementArrayValue = Array<string | File | AppBlockElementRecord>;

export interface ChartValue extends AppBlockElementRecord {
    xAxisData: unknown[];
    yAxisData: unknown[];
    data?: AppBlockElementRecord[];
}

export interface PaginationValue extends PaginationInstance, AppBlockElementRecord {
    currentPage: number;
}

export type AppBlockElementObjectValue = string | SafeResourceUrl | AppBlockElementRecord | ChartValue | PaginationValue;

export interface AppBlockElement {
    type: AppBlockElementType;
    name?: string;
    label?: string;
    placeholder?: string;
    text?: string;
    orderIndex?: number;
    choices?: string[];
    color?: string;
    min?: number;
    max?: number;
    step?: number;
    prefixText?: string;
    suffixText?: string;
    format?: string;
    enabled?: boolean;
    required?: boolean;
    readOnly?: boolean;
    clearable?: boolean;
    searchable?: boolean;
    addTag?: boolean;
    multiple?: boolean;
    fieldNameAxisX?: string;
    fieldNameAxisY?: string;
    fieldNameCategory?: string;
    fieldNameValue?: string;
    isXAxisDate?: boolean;
    selectDefaultFirst?: boolean;
    useDefault?: boolean;
    offset?: number;
    includeTime?: boolean;
    perPage?: number,
    statusCompleted?: string;
    statusError?: string;
    statusPending?: string;
    statusProcessing?: string;
    statusProcessingText?: string;
    statusErrorText?: string;
    statusFieldName?: string;
    queueNumberFieldName?: string;
    operationDurationSeconds?: number;
    itemFieldNameForTitle?: string;
    itemFieldNameForValue?: string;
    options?: AppBlockElementOptions;
    value?: AppBlockElementValue;
    valueArr?: AppBlockElementArrayValue | null;
    valueObj?: AppBlockElementObjectValue | null;
    markdown?: boolean;
    whiteSpacePre?: boolean;
    border?: boolean;
    borderShadow?: boolean;
    fullWidth?: boolean;
    showHeader?: boolean;
    alignCenter?: boolean;
    editable?: boolean,
    icon?: string;
    useAsOffset?: boolean;
    isHTML?: boolean;
    itemFieldName?: string;
    itemTitle?: string;
    itemThumbnailFieldName?: string;
    blockIndex?: number;
    hidden?: boolean;
    hiddenByField?: string;
    hiddenByDefault?: boolean;
    showOnlyInVK?: boolean;
    statusCompletedText?: string;
    statusCompletedTextForVK?: string;
    confirmationText?: string,
    keys?: string[];
    headers?: string[];
    subscriptionId?: string;
    rows?: number;
    loadValueInto?: string;
    note?: string;
    noteOutput?: string;
    storeValue?: boolean;
    useCropper?: boolean;
    roundedCorners?: boolean;
    useLightbox?: boolean;
    useLink?: boolean;
    vkUseSendToFiles?: boolean;
    cropperAspectRatioString?: string;
    posterUrl?: string;
    isClearForm?: boolean;
    isDownloadMode?: boolean;
    isStickyPosition?: boolean;
    fontSize?: string;
    maxHeight?: number;
    maxSize?: number;
    autoHide?: boolean;
    taskIdFieldName?: string;
    valueFrom?: string;
    autoHeight?: boolean;
    accept?: string;
    compactView?: boolean;
    rangeMode?: boolean;
    busyDates?: string[];
    busyDatesFieldName?: string;
    speechRecognitionEnabled?: boolean;
    speechSynthesisEnabled?: boolean;
    copyToClipboardEnabled?: boolean;
    vertical?: boolean;
    showTitle?: boolean;
    data?: unknown;
    valueFirst?: string;
    valueSecond?: string;
    htmlContent?: string;
    useResizer?: boolean;
    useRefreshButton?: boolean;
    useFullscreenButton?: boolean;
    height?: number;
    isBooleanValue?: boolean;
    linkedField?: string;
    allowAutoSubmit?: boolean;
}

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
