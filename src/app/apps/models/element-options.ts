import { AppBlockElement, AppBlockElementType } from './app-block.interface';

export class ElementOptions {

    static createElementOptionsFields(type: AppBlockElementType, options?: any): AppBlockElement[] {
        if (!options) {
            options = {} as any;
        }
        const output = [
            {
                name: 'name',
                label: $localize `Name`,
                type: 'input-text',
                value: options?.name
            },
            {
                name: 'blockIndex',
                label: $localize `Block Index`,
                type: 'input-number',
                min: 0,
                max: 100,
                value: options?.blockIndex || 0
            },
            {
                name: 'orderIndex',
                label: $localize `Order Index`,
                type: 'input-number',
                min: 0,
                max: 100,
                value: options?.orderIndex || 0
            }
        ] as AppBlockElement[];
        switch (type) {
            case 'text-header':
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
                    rows: 6,
                    autoHeight: true,
                    value: options?.value
                });
                output.push({
                    name: 'alignCenter',
                    label: $localize `Align to center`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.alignCenter || false
                });
                output.push({
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                break;
            case 'text':
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'maxHeight',
                    label: $localize `Maximum container height`,
                    type: 'input-number',
                    value: options?.maxHeight || 0
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
                    name: 'itemFieldName',
                    label: $localize `Field name in the array`,
                    type: 'input-text',
                    value: options?.itemFieldName || ''
                });
                output.push({
                    name: 'keys',
                    label: $localize `Value keys`,
                    type: 'input-tags',
                    value: options?.keys || [],
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: $localize `Value`,
                    type: 'input-textarea',
                    rows: 6,
                    autoHeight: true,
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
                    itemFieldNameForTitle: 'label',
                    itemFieldNameForValue: 'value',
                    valueArr: [
                        {label: $localize `Black`, value: 'Black'},
                        {label: $localize `Gray`, value: 'Gray'},
                        {label: $localize `Green`, value: 'Green'},
                        {label: $localize `Blue`, value: 'Blue'},
                        {label: $localize `Cyan`, value: 'Cyan'},
                        {label: $localize `Violet`, value: 'Violet'},
                        {label: $localize `Red`, value: 'Red'}
                    ]
                });
                output.push({
                    name: 'fontSize',
                    label: $localize `Font Size`,
                    type: 'input-select',
                    value: options?.fontSize,
                    itemFieldNameForTitle: 'label',
                    itemFieldNameForValue: 'value',
                    valueArr: [
                        {label: $localize `Small`, value: 'Small'},
                        {label: $localize `Medium`, value: 'Medium'},
                        {label: $localize `Large`, value: 'Large'}
                    ]
                });
                output.push({
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                output.push({
                    name: 'alignCenter',
                    label: $localize `Align to center`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.alignCenter || false
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
                    name: 'showHeader',
                    label: $localize `Show title`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.showHeader || false
                });
                output.push({
                    name: 'border',
                    label: $localize `Border`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.border
                });
                output.push({
                    name: 'borderShadow',
                    label: $localize `Shadow`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.borderShadow
                });
                output.push({
                    name: 'fullWidth',
                    label: $localize `Full width`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.fullWidth
                });
                output.push({
                    name: 'showOnlyInVK',
                    label: $localize `Show only in VK app`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.showOnlyInVK
                });
                break;
            case 'button':
                output.push({
                    name: 'text',
                    label: $localize `Text`,
                    type: 'input-text',
                    value: options?.text
                });
                output.push({
                    name: 'prefixText',
                    label: $localize `Prefix for the resulting value`,
                    type: 'input-text',
                    value: options?.prefixText
                });
                output.push({
                    name: 'suffixText',
                    label: $localize `Suffix for the resulting value`,
                    type: 'input-text',
                    value: options?.suffixText
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
                    itemFieldNameForTitle: 'label',
                    itemFieldNameForValue: 'value',
                    valueArr: [
                        {label: $localize `Green`, value: 'Green'},
                        {label: $localize `Blue`, value: 'Blue'},
                        {label: $localize `Cyan`, value: 'Cyan'},
                        {label: $localize `Violet`, value: 'Violet'},
                        {label: $localize `Red`, value: 'Red'},
                        {label: $localize `Gray`, value: 'Gray'}
                    ]
                });
                output.push({
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                output.push({
                    name: 'hiddenByDefault',
                    label: $localize `Hidden by default`,
                    type: 'input-switch',
                    enabled: options?.hiddenByDefault || false
                });
                output.push({
                    name: 'isClearForm',
                    label: $localize `Reset all values`,
                    type: 'input-switch',
                    enabled: options?.isClearForm || false
                });
                output.push({
                    name: 'isDownloadMode',
                    label: $localize `Download`,
                    type: 'input-switch',
                    enabled: options?.isDownloadMode || false
                });
                output.push({
                    name: 'isStickyPosition',
                    label: $localize `Sticky position`,
                    type: 'input-switch',
                    enabled: options?.isStickyPosition || false
                });
                break;
            case 'input-text':
                // output.push({
                //     name: 'max',
                //     label: $localize `Maximum text length`,
                //     type: 'input-number',
                //     rows: 6,
                //     value: options?.max || 0
                // });
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
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
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
                    name: 'max',
                    label: $localize `Maximum text length`,
                    type: 'input-number',
                    rows: 6,
                    value: options?.max || 0
                });
                output.push({
                    name: 'rows',
                    label: $localize `Number of lines`,
                    type: 'input-number',
                    value: options?.rows || 6
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
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-textarea',
                    rows: 6,
                    autoHeight: true,
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
                    name: 'autoHeight',
                    label: $localize `Auto height`,
                    type: 'input-switch',
                    enabled: options?.autoHeight || false
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
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
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
                output.push({
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                break;
            case 'input-hidden':
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
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
                    name: 'valueFrom',
                    label: $localize `Take value from field`,
                    type: 'input-text',
                    value: options?.valueFrom || ''
                });
                output.push({
                    name: 'storeValue',
                    label: $localize `Store field value`,
                    type: 'input-switch',
                    enabled: options?.storeValue || false
                });
                break;
            case 'input-switch':
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
                    name: 'valueArr',
                    label: $localize `Values`,
                    type: 'table',
                    headers: [$localize `Name`, $localize `Value`],
                    keys: ['name', 'value'],
                    editable: true,
                    valueArr: options?.valueArr
                        ? options.valueArr.map((item) => {
                            return Object.assign({}, item)
                        })
                        : null
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
                    name: 'loadValueInto',
                    label: $localize `Load value into field`,
                    type: 'input-text',
                    value: options?.loadValueInto || ''
                });
                output.push({
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
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
                    name: 'searchable',
                    label: $localize `Searchable`,
                    type: 'input-switch',
                    enabled: options?.searchable || false
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
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
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
                output.push({
                    name: 'required',
                    label: $localize `Required`,
                    type: 'input-switch',
                    enabled: options?.required || false
                });
                output.push({
                    name: 'storeValue',
                    label: $localize `Store field value`,
                    type: 'input-switch',
                    enabled: options?.storeValue || false
                });
                break;
            case 'input-date':
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
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
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
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
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
                    name: 'loadValueInto',
                    label: $localize `Load value into field`,
                    type: 'input-text',
                    value: options?.loadValueInto || ''
                });
                output.push({
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
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
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label || ''
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
                output.push({
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                output.push({
                    name: 'required',
                    label: $localize `Required`,
                    type: 'input-switch',
                    enabled: options?.required || false
                });
                break;
            case 'image-comparison':
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label || ''
                });
                output.push({
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                output.push({
                    name: 'valueFirst',
                    label: $localize `First image`,
                    type: 'input-text',
                    value: options?.valueFirst || ''
                });
                output.push({
                    name: 'valueSecond',
                    label: $localize `Second image`,
                    type: 'input-text',
                    value: options?.valueSecond || ''
                });
                break;
            case 'video':
            case 'image':
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label || ''
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
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                if (type === 'video') {
                    output.push({
                        name: 'posterUrl',
                        label: $localize `Poster URL`,
                        type: 'input-text',
                        value: options?.posterUrl || ''
                    });
                } else {
                    output.push({
                        name: 'cropperAspectRatioString',
                        label: ($localize `Aspect ratio when cropping`),
                        type: 'input-text',
                        value: options?.cropperAspectRatioString || ''
                    });
                    output.push({
                        name: 'info',
                        value: '1:1, 4:3, 3:4, 16:9, 9:16',
                        type: 'text',
                        color: 'Gray',
                        icon: 'bi-info-circle',
                        fontSize: 'Small'
                    });
                }
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-text',
                    value: options?.value
                });
                output.push({
                    name: 'useLink',
                    label: $localize `Use link`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.useLink
                });
                output.push({
                    name: 'roundedCorners',
                    label: $localize `Rounded corners`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.roundedCorners
                });
                output.push({
                    name: 'borderShadow',
                    label: $localize `Shadow`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.borderShadow
                });
                output.push({
                    name: 'fullWidth',
                    label: $localize `Full width`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.fullWidth
                });
                output.push({
                    name: 'useLightbox',
                    label: $localize `Use image zoom`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.useLightbox || false
                });
                if (type === 'image') {
                    output.push({
                        name: 'useCropper',
                        label: $localize `Use the crop tool`,
                        type: 'input-switch',
                        value: true,
                        enabled: options?.useCropper
                    });
                }
                break;
            case 'input-chart-line':
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
                output.push({
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                break;
            case 'input-pagination':
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
                    name: 'statusPending',
                    label: $localize `Pending Status Value`,
                    type: 'input-text',
                    value: options?.statusPending || ''
                });
                output.push({
                    name: 'statusProcessing',
                    label: $localize `Processing Status Value`,
                    type: 'input-text',
                    value: options?.statusProcessing || ''
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
                    name: 'statusCompletedTextForVK',
                    label: $localize `Completed Status Text For VK`,
                    type: 'input-text',
                    required: true,
                    value: options?.statusCompletedTextForVK || ''
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
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                output.push({
                    name: 'isBooleanValue',
                    label: $localize `Boolean Value (true/false)`,
                    type: 'input-switch',
                    enabled: options?.isBooleanValue || false
                });
                break;
            case 'progress':
                output.push({
                    name: 'statusPending',
                    label: $localize `Pending Status Value`,
                    type: 'input-text',
                    value: options?.statusPending || ''
                });
                output.push({
                    name: 'statusProcessing',
                    label: $localize `Processing Status Value`,
                    type: 'input-text',
                    value: options?.statusProcessing || ''
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
                    name: 'statusFieldName',
                    label: $localize `Status field`,
                    type: 'input-text',
                    value: options?.statusFieldName || ''
                });
                output.push({
                    name: 'queueNumberFieldName',
                    label: $localize `Queue number field`,
                    type: 'input-text',
                    value: options?.queueNumberFieldName || ''
                });
                output.push({
                    name: 'taskIdFieldName',
                    label: $localize `Queue ID field`,
                    type: 'input-text',
                    value: options?.taskIdFieldName || ''
                });
                output.push({
                    name: 'operationDurationSeconds',
                    label: $localize `Operation execution time (in seconds)`,
                    type: 'input-number',
                    min: 0,
                    value: options?.operationDurationSeconds || 0
                });
                output.push({
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                output.push({
                    name: 'isBooleanValue',
                    label: $localize `Boolean Value (true/false)`,
                    type: 'input-switch',
                    enabled: options?.isBooleanValue || false
                });
                break;
            case 'table':
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label || ''
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
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                output.push({
                    name: 'isHTML',
                    label: $localize `Value as HTML code`,
                    type: 'input-switch',
                    enabled: options?.isHTML || false
                });
                output.push({
                    name: 'hiddenByDefault',
                    label: $localize `Hidden by default`,
                    type: 'input-switch',
                    enabled: options?.hiddenByDefault || false
                });
                // output.push({
                //     name: 'editable',
                //     label: $localize `Editable`,
                //     type: 'input-switch',
                //     enabled: options?.editable || false
                // });
                break;
            case 'input-select-image':
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'data',
                    label: $localize `Values`,
                    type: 'table',
                    headers: [$localize `Name`, $localize `Image URL`],
                    keys: ['name', 'imageUrl'],
                    editable: true,
                    valueArr: options?.data
                        ? options.data.map((item) => {
                            return Object.assign({}, item)
                        })
                        : []
                });
                output.push({
                    name: 'maxHeight',
                    label: $localize `Maximum container height`,
                    type: 'input-number',
                    value: options?.maxHeight || 0
                });
                output.push({
                    name: 'hiddenByField',
                    label: $localize `Hide by field`,
                    type: 'input-text',
                    value: options?.hiddenByField || ''
                });
                output.push({
                    name: 'value',
                    label: $localize `Default Value`,
                    type: 'input-text',
                    value: options?.value
                });
                output.push({
                    name: 'showTitle',
                    label: $localize `Show titles`,
                    type: 'input-switch',
                    enabled: options?.showTitle || false
                });
                output.push({
                    name: 'required',
                    label: $localize `Required`,
                    type: 'input-switch',
                    enabled: options?.required || false
                });
                break;
            case 'user-subscription':
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
                    name: 'subscriptionId',
                    label: $localize `Subscription ID`,
                    type: 'input-text',
                    value: options?.subscriptionId || ''
                });
                output.push({
                    name: 'label',
                    label: $localize `Label`,
                    type: 'input-text',
                    value: options?.label
                });
                output.push({
                    name: 'showOnlyInVK',
                    label: $localize `Show only in VK app`,
                    type: 'input-switch',
                    value: true,
                    enabled: options?.showOnlyInVK
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
                    icon: '',
                    hiddenByField: '',
                    alignCenter: false
                });
                break;
            case 'text':
                Object.assign(output, {
                    name: 'text',
                    label: '',
                    value: $localize `Example Text`,
                    prefixText: '',
                    suffixText: '',
                    color: 'Black',
                    fontSize: 'Medium',
                    itemFieldName: '',
                    icon: '',
                    keys: [],
                    maxHeight: 0,
                    hiddenByField: '',
                    whiteSpacePre: false,
                    alignCenter: false,
                    markdown: false,
                    hiddenByDefault: false,
                    showHeader: false,
                    fullWidth: true,
                    border: false,
                    borderShadow: false,
                    showOnlyInVK: false
                });
                break;
            case 'button':
                Object.assign(output, {
                    name: 'submit',
                    text: $localize `Submit`,
                    prefixText: '',
                    suffixText: '',
                    icon: '',
                    color: 'Green',
                    hiddenByField: '',
                    hiddenByDefault: false,
                    isClearForm: false,
                    isDownloadMode: false,
                    isStickyPosition: false
                });
                break;
            case 'input-text':
                Object.assign(output, {
                    name: 'name',
                    max: 0,
                    label: $localize `Name`,
                    type: 'input-text',
                    placeholder: $localize `Enter your name`,
                    icon: '',
                    prefixText: '',
                    suffixText: '',
                    hiddenByField: '',
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
                    rows: 6,
                    max: 0,
                    prefixText: '',
                    suffixText: '',
                    readOnly: false,
                    required: true,
                    hiddenByDefault: false,
                    speechRecognitionEnabled: false,
                    speechSynthesisEnabled: false,
                    copyToClipboardEnabled: false,
                    hiddenByField: '',
                    storeValue: false,
                    autoHeight: true,
                    value: null
                });
                break;
            case 'input-number':
                Object.assign(output, {
                    name: 'number',
                    label: $localize `Number`,
                    type: 'input-number',
                    hiddenByField: '',
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
                    hiddenByField: '',
                    min: 0,
                    max: 100,
                    step: 1,
                    value: 0
                });
                break;
            case 'input-hidden':
                Object.assign(output, {
                    name: 'hidden',
                    label: $localize `Hidden`,
                    type: 'input-text',
                    prefixText: '',
                    suffixText: '',
                    required: true,
                    storeValue: false,
                    valueFrom: '',
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
                    itemFieldNameForTitle: 'name',
                    itemFieldNameForValue: 'value',
                    choices: ['Value1', 'Value2', 'Value3'],
                    loadValueInto: '',
                    hiddenByField: '',
                    required: true,
                    clearable: true,
                    searchable: true,
                    addTag: false,
                    selectDefaultFirst: true,
                    hiddenByDefault: false,
                    value: 'Value1',
                    valueArr: null
                });
                break;
            case 'input-tags':
                Object.assign(output, {
                    name: 'tags',
                    label: $localize `Tags`,
                    type: 'input-select',
                    placeholder: $localize `Please Add Tags`,
                    hiddenByField: '',
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
                    required: true,
                    storeValue: false,
                    choices: ['Value1', 'Value2', 'Value3']
                });
                break;
            case 'input-date':
                Object.assign(output, {
                    name: 'date',
                    label: $localize `Date`,
                    format: 'YYYY-MM-DD HH:mm',
                    hiddenByField: '',
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
                    hiddenByField: '',
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
                    loadValueInto: '',
                    hiddenByField: '',
                    required: true,
                    value: []
                });
                break;
            case 'image-comparison':
                Object.assign(output, {
                    name: 'image-comparison',
                    label: $localize `Image comparison`,
                    hiddenByField: '',
                    valueFirst: '',
                    valueSecond: '',
                    value: ''
                });
                break;
            case 'image':
                Object.assign(output, {
                    name: 'image',
                    label: $localize `Image`,
                    itemFieldName: '',
                    itemThumbnailFieldName: '',
                    hiddenByField: '',
                    prefixText: '',
                    value: '',
                    hiddenByDefault: false,
                    useLink: true,
                    useCropper: false,
                    useLightbox: false,
                    fullWidth: false,
                    borderShadow: false,
                    roundedCorners: false
                });
                break;
            case 'audio':
                Object.assign(output, {
                    name: type,
                    label: '',
                    hiddenByField: '',
                    prefixText: '',
                    value: '',
                    hiddenByDefault: false,
                    required: false
                });
                break;
            case 'video':
                Object.assign(output, {
                    name: type,
                    label: '',
                    itemFieldName: '',
                    itemThumbnailFieldName: '',
                    hiddenByField: '',
                    prefixText: '',
                    value: '',
                    posterUrl: '',
                    hiddenByDefault: false,
                    useLink: true,
                    useLightbox: false,
                    fullWidth: false,
                    borderShadow: false,
                    roundedCorners: false
                });
                break;
            case 'input-chart-line':
                Object.assign(output, {
                    name: 'chart',
                    label: $localize `Line Chart`,
                    itemTitle: $localize `Item Title`,
                    fieldNameAxisX: '',
                    fieldNameAxisY: '',
                    hiddenByField: '',
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
                    statusProcessing: 'processing',
                    statusPending: 'pending',
                    hiddenByField: '',
                    statusCompletedText: $localize `Completed`,
                    statusCompletedTextForVK: $localize `Completed`,
                    statusProcessingText: $localize `Performing an operation...`,
                    statusErrorText: $localize `Error`,
                    isBooleanValue: false,
                    value: null
                });
                break;
            case 'progress':
                Object.assign(output, {
                    name: 'progress',
                    note: $localize `Please select an object that contains data about the queue number and the operation status.`,
                    statusCompleted: 'completed',
                    statusError: 'error',
                    statusProcessing: 'processing',
                    statusPending: 'pending',
                    statusFieldName: 'status',
                    taskIdFieldName: 'uuid',
                    queueNumberFieldName: 'number',
                    operationDurationSeconds: 20,
                    hiddenByField: '',
                    isBooleanValue: false,
                    valueObj: null,
                    value: null
                });
                break;
            case 'table':
                Object.assign(output, {
                    name: 'table',
                    label: '',
                    headers: ['Column1', 'Column2', 'Column3'],
                    keys: ['key1', 'key2', 'key3'],
                    hiddenByField: '',
                    isHTML: false,
                    hiddenByDefault: false,
                    editable: false
                });
                break;
            case 'input-select-image':
                Object.assign(output, {
                    name: 'select-image',
                    label: $localize `Select image`,
                    data: [],
                    maxHeight: 0,
                    hiddenByField: '',
                    showTitle: true,
                    required: false,
                    value: null
                });
                break;
            case 'user-subscription':
                Object.assign(output, {
                    icon: '',
                    name: 'user-subscription',
                    label: $localize `My subscription`,
                    subscriptionId: '',
                    hiddenByField: '',
                    showOnlyInVK: true,
                    value: null
                });
                break;
        }
        return output;
    }

    constructor() {
    }
}
