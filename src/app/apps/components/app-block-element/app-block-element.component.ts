import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

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
    @Output() typeChange: EventEmitter<AppBlockElementType> = new EventEmitter<AppBlockElementType>();
    @Output() showOptions: EventEmitter<void> = new EventEmitter<void>();
    @Output() selectAction: EventEmitter<void> = new EventEmitter<void>();
    @Output() delete: EventEmitter<void> = new EventEmitter<void>();
    @Output() elementClick: EventEmitter<void> = new EventEmitter<void>();

    inputTypes: {name: AppBlockElementType, title: string}[] = [
        {name: 'text-header', title: 'Text Header'},
        {name: 'text', title: 'Text'},
        {name: 'button', title: 'Button'},
        {name: 'input-text', title: 'Text Field'},
        {name: 'input-number', title: 'Number Field'},
        {name: 'input-textarea', title: 'Text Area'},
        {name: 'input-switch', title: 'Switch'},
        {name: 'input-select', title: 'Select'},
        {name: 'input-tags', title: 'Tags'},
        {name: 'input-radio', title: 'Radio Buttons'},
        {name: 'input-date', title: 'Calendar'},
        {name: 'image', title: 'Image'},
        {name: 'audio', title: 'Audio'},
        {name: 'chart-line', title: 'Line Chart'}
    ];

    public chartOptions: ChartOptions;

    constructor() {}

    get chartSeriesItemTitle(): string {
        console.log('chartSeriesItemTitle');
        return this.options?.itemTitle || 'Item';
    }

    ngOnInit(): void {
        this.chartOptions = {
            series: [
                {
                    name: this.chartSeriesItemTitle,
                    data: this.editorMode ? [10, 41, 35, 51, 49, 62, 69, 91, 148] : []
                }
            ],
            xaxis: {
                categories: this.editorMode ? ['Jan', 'Feb',  'Mar',  'Apr',  'May',  'Jun',  'Jul',  'Aug', 'Sep'] : []
            },
            chart: {
                height: 450,
                type: 'area'
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

    ngOnChanges(changes: SimpleChanges) {
        console.log('ngOnChanges', changes);
        if (this.options.type === 'chart-line' && changes['valueObj']) {
            this.chartOptionsUpdate();
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

    elementActionSelect(event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.selectAction.emit();
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
        if (!this.valueObj || !this.valueObj?.xAxisData || !this.valueObj?.yAxisData) {
            return;
        }
        this.chartOptions.series = [
            {
                name: this.chartSeriesItemTitle,
                data: this.valueObj?.yAxisData
            }
        ];
        this.chartOptions.xaxis = {
            categories: this.options?.valueObj?.xAxisData
        };
    }

    onClick(): void {
        this.elementClick.emit();
    }
}
