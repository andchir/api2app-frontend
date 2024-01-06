import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import * as moment from 'moment';

import { AppBlockElementType } from '../../models/app-block.interface';
import { ChartOptions } from '../../models/chart-options.interface';

@Component({
    selector: 'app-block-element',
    templateUrl: './app-block-element.component.html',
    styleUrls: [],
    providers: []
})
export class AppBlockElementComponent implements OnInit, OnChanges {

    @Input() index: number = 0;
    @Input() parentIndex: number = 0;
    @Input() editorMode = false;
    @Input() type: AppBlockElementType;
    @Input() options: any;
    @Input() valueObj: any;
    @Input() valueArr: any[];
    @Output() typeChange: EventEmitter<AppBlockElementType> = new EventEmitter<AppBlockElementType>();
    @Output() showOptions: EventEmitter<void> = new EventEmitter<void>();
    @Output() selectAction: EventEmitter<'input'|'output'> = new EventEmitter<'input'|'output'>();
    @Output() delete: EventEmitter<void> = new EventEmitter<void>();
    @Output() elementClick: EventEmitter<void> = new EventEmitter<void>();
    @Output() elementValueChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() itemSelected: EventEmitter<number> = new EventEmitter<number>();

    inputTypes: {name: AppBlockElementType, title: string}[] = [
        {name: 'text-header', title: $localize `Text Header`},
        {name: 'text', title: $localize `Text`},
        {name: 'button', title: $localize `Button`},
        {name: 'input-text', title: $localize `Text Field`},
        {name: 'input-number', title: $localize `Number Field`},
        {name: 'input-slider', title: $localize `Range Slider`},
        {name: 'input-textarea', title: $localize `Text Area`},
        {name: 'input-hidden', title: $localize `Hidden text field`},
        {name: 'input-switch', title: $localize `Switch`},
        {name: 'input-select', title: $localize `Select`},
        {name: 'input-tags', title: $localize `Tags`},
        {name: 'input-radio', title: $localize `Radio Buttons`},
        {name: 'input-date', title: $localize `Calendar`},
        {name: 'input-file', title: $localize `Upload File`},
        {name: 'image', title: $localize `Image`},
        {name: 'audio', title: $localize `Audio`},
        {name: 'input-chart-line', title: $localize `Line Chart`}
    ];

    public chartOptions: ChartOptions;
    timerSelectItem: any;

    constructor() {}

    ngOnInit(): void {
        this.createChartOptions();
        if (!this.editorMode) {
            this.updateStateByOptions();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        // console.log('ngOnChanges', this.options?.type, changes);
        if (this.options.type === 'input-chart-line' && changes['valueObj']) {
            if (this.chartOptions) {
                this.chartOptionsUpdate();
            }
        }
        if (changes['editorMode'] && !changes['editorMode'].currentValue) {
            this.updateStateByOptions();
        }
    }

    updateItemType(): void {
        this.typeChange.emit(this.type);
    }

    elementOptionsInit(event?: MouseEvent) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.showOptions.emit();
    }

    elementActionSelect(actionType: 'input'|'output', event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.selectAction.emit(actionType);
    }

    elementDeleteInit(): void {
        this.delete.emit();
    }

    numberIncrease(keyName = 'value', max?: number): void {
        this.options[keyName] = Number(this.options[keyName] || 0);
        if (typeof max === 'number' && this.options[keyName] >= max) {
            return;
        }
        this.options[keyName]++;
    }

    numberDecrease(keyName = 'value', min?: number): void {
        this.options[keyName] = Number(this.options[keyName] || 0);
        if (typeof min === 'number' && this.options[keyName] <= min) {
            return;
        }
        this.options[keyName]--;
    }

    chartOptionsUpdate(): void {
        if (!this.chartOptions || !this.valueObj || !this.valueObj?.xAxisData || !this.valueObj?.yAxisData) {
            return;
        }
        this.chartOptions.series = [
            {
                name: this.options?.itemTitle || 'Item',
                data: this.valueObj?.yAxisData.map((value) => {
                    return Number((value || 0).toFixed(2));
                })
            }
        ];
        this.chartOptions.xaxis = {
            categories: this.options?.valueObj?.xAxisData
        };
        this.chartOptions.chart.type = this.valueObj?.yAxisData.length > 400 || this.valueObj?.yAxisData.length < 10 ? 'bar' : 'area';
    }

    updateStateByOptions(): void {
        switch (this.options.type) {
            case 'input-date':
                if (!this.options.value && this.options.useDefault) {
                    const offsetDays = this.options?.offset || 0;
                    const now = moment();
                    // now.set({hour: 0, minutes: 0, seconds: 0});
                    now.add(offsetDays, 'days');
                    this.options.value = now.format('YYYY-MM-DD HH:mm');
                }
                break;
        }
    }

    onClick(): void {
        this.elementClick.emit();
    }

    onFieldValueChanged(): void {
        this.elementValueChange.emit(this.options);
    }

    onChange(optionName: string, isChecked: boolean) {
        this.options[optionName] = !isChecked;
    }

    createChartOptions(): void {
        this.chartOptions = {
            series: [
                {
                    name: this.options?.itemTitle || 'Item',
                    data: this.editorMode ? [10, 41, 35, 51, 49, 62, 69, 91, 148] : []
                }
            ],
            xaxis: {
                categories: this.editorMode ? ['Jan', 'Feb',  'Mar',  'Apr',  'May',  'Jun',  'Jul',  'Aug', 'Sep'] : []
            },
            chart: {
                height: 450,
                type: 'area',
                events: {
                    markerClick: (event, chartContext, config) => {
                        this.onItemSelected(config.dataPointIndex);
                    },
                    dataPointSelection: (event, chartContext, config) => {
                        this.onItemSelected(config.dataPointIndex);
                    }
                }
            },
            colors: ['#00BAEC'],
            markers: {
                size: 3,
                colors: ['#fff'],
                strokeColors: ['#00BAEC'],
                strokeWidth: 2
            },
            fill: {
                colors: ['#00BAEC'],
                gradient: {
                    opacityFrom: 1,
                    opacityTo: 0
                }
            }
        };
    }

    onItemSelected(index: number): void {
        clearTimeout(this.timerSelectItem);
        this.timerSelectItem = setTimeout(() => {
            if (this.options.valueObj?.data && this.options.valueObj.data[index] && this.options.itemFieldName) {
                this.options.value = this.options.valueObj.data[index][this.options.itemFieldName] || '';
            }
            this.itemSelected.emit(index);
        }, 100);
    }

    isArray(obj: any ): boolean {
        return Array.isArray(obj);
    }
}
