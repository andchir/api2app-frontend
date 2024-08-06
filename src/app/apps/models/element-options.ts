import { AppBlockElement, AppBlockElementType } from './app-block.interface';

export class ElementOptions {

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
                    name: 'icon',
                    label: $localize `Icon`,
                    type: 'input-text',
                    placeholder: ($localize `Example`) + ': bi-info-circle',
                    value: options?.icon || ''
                });
                output.push({
                    name: 'info',
                    type: 'text',
                    markdown: true,
                    color: 'Blue',
                    icon: 'bi-box-arrow-up-right',
                    value: '[Bootstrap Icons](https://icons.getbootstrap.com/)',
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
                    name: 'icon',
                    label: $localize `Icon`,
                    type: 'input-text',
                    placeholder: ($localize `Example`) + ': bi-info-circle',
                    value: options?.icon || ''
                });
                output.push({
                    name: 'info',
                    type: 'text',
                    markdown: true,
                    color: 'Blue',
                    icon: 'bi-box-arrow-up-right',
                    value: '[Bootstrap Icons](https://icons.getbootstrap.com/)',
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
                output.push({
                    name: 'markdown',
                    label: 'Markdown',
                    type: 'input-switch',
                    value: true,
                    enabled: options?.markdown
                });
                output.push({
                    name: 'border',
                    label: $localize `Border`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.border
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
                    name: 'icon',
                    label: $localize `Icon`,
                    type: 'input-text',
                    placeholder: ($localize `Example`) + ': bi-info-circle',
                    value: options?.icon || ''
                });
                output.push({
                    name: 'info',
                    type: 'text',
                    markdown: true,
                    color: 'Blue',
                    icon: 'bi-box-arrow-up-right',
                    value: '[Bootstrap Icons](https://icons.getbootstrap.com/)',
                });
                output.push({
                    name: 'color',
                    label: $localize `Color`,
                    type: 'input-select',
                    value: options?.color,
                    choices: ['Green', 'Blue', 'Cyan', 'Violet', 'Red', 'Gray']
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
                    name: 'icon',
                    label: $localize `Icon`,
                    type: 'input-text',
                    placeholder: ($localize `Example`) + ': bi-info-circle',
                    value: options?.icon || ''
                });
                output.push({
                    name: 'info',
                    type: 'text',
                    markdown: true,
                    color: 'Blue',
                    icon: 'bi-box-arrow-up-right',
                    value: '[Bootstrap Icons](https://icons.getbootstrap.com/)',
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
                output.push({
                    name: 'speechRecognitionEnabled',
                    label: $localize `Voice typing`,
                    type: 'input-switch',
                    enabled: options?.speechRecognitionEnabled || false
                });
                output.push({
                    name: 'speechSynthesisEnabled',
                    label: $localize `Voice the text`,
                    type: 'input-switch',
                    enabled: options?.speechSynthesisEnabled || false
                });
                output.push({
                    name: 'copyToClipboardEnabled',
                    label: $localize `Copy to clipboard`,
                    type: 'input-switch',
                    enabled: options?.copyToClipboardEnabled || false
                });
                output.push({
                    name: 'storeValue',
                    label: $localize `Store field value`,
                    type: 'input-switch',
                    enabled: options?.storeValue || false
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
                output.push({
                    name: 'hiddenByDefault',
                    label: $localize `Hidden by default`,
                    type: 'input-switch',
                    enabled: options?.hiddenByDefault || false
                });
                output.push({
                    name: 'speechRecognitionEnabled',
                    label: $localize `Voice typing`,
                    type: 'input-switch',
                    enabled: options?.speechRecognitionEnabled || false
                });
                output.push({
                    name: 'speechSynthesisEnabled',
                    label: $localize `Voice the text`,
                    type: 'input-switch',
                    enabled: options?.speechSynthesisEnabled || false
                });
                output.push({
                    name: 'copyToClipboardEnabled',
                    label: $localize `Copy to clipboard`,
                    type: 'input-switch',
                    enabled: options?.copyToClipboardEnabled || false
                });
                output.push({
                    name: 'storeValue',
                    label: $localize `Store field value`,
                    type: 'input-switch',
                    enabled: options?.storeValue || false
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
                output.push({
                    name: 'prefixText',
                    label: $localize `Prefix Text`,
                    type: 'input-text',
                    value: options?.prefixText || ''
                });
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-text',
                    value: options?.value
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
                output.push({
                    name: 'prefixText',
                    label: $localize `Prefix Text`,
                    type: 'input-text',
                    value: options?.prefixText || ''
                });
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-text',
                    value: options?.value
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
                    value: options?.fieldNameAxisX || ''
                });
                output.push({
                    name: 'fieldNameAxisY',
                    label: $localize `Field name for Y axis`,
                    type: 'input-text',
                    value: options?.fieldNameAxisY || ''
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
                output.push({
                    name: 'maxSize',
                    label: $localize `Maximum number of page links`,
                    type: 'input-number',
                    min: 0,
                    max: 20,
                    value: options?.maxSize
                });
                output.push({
                    name: 'autoHide',
                    label: $localize `Auto hide`,
                    type: 'input-switch',
                    enabled: options?.autoHide || false
                });
                output.push({
                    name: 'useAsOffset',
                    label: $localize `Use as offset`,
                    type: 'input-switch',
                    enabled: options?.useAsOffset || false
                });
                break;
            case 'status':
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
                    name: 'statusCompleted',
                    label: $localize `Completed Status Value`,
                    type: 'input-text',
                    value: options?.statusCompleted || ''
                });
                output.push({
                    name: 'statusError',
                    label: $localize `Error Status Value`,
                    type: 'input-text',
                    value: options?.statusError || ''
                });
                output.push({
                    name: 'statusCompletedText',
                    label: $localize `Completed Status Text`,
                    type: 'input-text',
                    required: true,
                    value: options?.statusCompletedText || ''
                });
                output.push({
                    name: 'statusProcessingText',
                    label: $localize `Processing Status Text`,
                    type: 'input-text',
                    required: true,
                    value: options?.statusProcessingText || ''
                });
                output.push({
                    name: 'statusErrorText',
                    label: $localize `Error Status Text`,
                    type: 'input-text',
                    required: true,
                    value: options?.statusErrorText || ''
                });
                output.push({
                    name: 'isBoolean',
                    label: $localize `Boolean Value (true/false)`,
                    type: 'input-switch',
                    enabled: options?.isBoolean || false
                });
                break;
            case 'table':
                output.push({
                    name: 'name',
                    label: $localize `Name`,
                    type: 'input-text',
                    value: options?.name || ''
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
                    name: 'headers',
                    label: $localize `Columns headers`,
                    type: 'input-tags',
                    value: options?.headers || [],
                    choices: []
                });
                output.push({
                    name: 'keys',
                    label: $localize `Columns values keys`,
                    type: 'input-tags',
                    value: options?.keys || [],
                    choices: []
                });
                output.push({
                    name: 'isHTML',
                    label: $localize `Value as HTML code`,
                    type: 'input-switch',
                    enabled: options?.isHTML || false
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
                    value: $localize `Header Example Text`,
                    icon: ''
                });
                break;
            case 'text':
                Object.assign(output, {
                    name: 'text',
                    value: $localize `Example Text`,
                    prefixText: '',
                    suffixText: '',
                    color: 'Black',
                    icon: '',
                    whiteSpacePre: false,
                    markdown: false,
                    hiddenByDefault: false,
                    border: false
                });
                break;
            case 'button':
                Object.assign(output, {
                    name: 'submit',
                    text: $localize `Submit`,
                    icon: '',
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
                    icon: '',
                    prefixText: '',
                    suffixText: '',
                    readOnly: false,
                    required: true,
                    hiddenByDefault: false,
                    speechRecognitionEnabled: false,
                    speechSynthesisEnabled: false,
                    copyToClipboardEnabled: false,
                    storeValue: false,
                    value: ''
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
                    hiddenByDefault: false,
                    speechRecognitionEnabled: false,
                    speechSynthesisEnabled: false,
                    copyToClipboardEnabled: false,
                    storeValue: false,
                    value: null
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
                    prefixText: '',
                    value: '',
                    hiddenByDefault: false
                });
                break;
            case 'audio':
            case 'video':
                Object.assign(output, {
                    name: type,
                    prefixText: '',
                    value: '',
                    hiddenByDefault: false
                });
                break;
            case 'input-chart-line':
                Object.assign(output, {
                    name: 'chart',
                    label: $localize `Line Chart`,
                    itemTitle: $localize `Item Title`,
                    fieldNameAxisX: '',
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
                    maxSize: 9,
                    autoHide: false,
                    useAsOffset: false,
                    value: 1
                });
                break;
            case 'status':
                Object.assign(output, {
                    name: 'status',
                    statusCompleted: 'completed',
                    statusError: 'error',
                    statusCompletedText: $localize `Completed`,
                    statusProcessingText: $localize `Performing an operation...`,
                    statusErrorText: $localize `Error`,
                    isBoolean: false,
                    value: null
                });
                break;
            case 'table':
                Object.assign(output, {
                    name: 'table',
                    headers: ['Column1', 'Column2', 'Column3'],
                    keys: ['key1', 'key2', 'key3'],
                    isHTML: false
                });
                break;
        }
        return output;
    }

    constructor() {
    }
}
