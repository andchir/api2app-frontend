import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { AppBlockElementType } from '../../models/app-block.interface';

import {
    ChartComponent,
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexTitleSubtitle, ApexStroke, ApexMarkers, ApexGrid, ApexDataLabels, ApexFill
} from "ng-apexcharts";

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    title: ApexTitleSubtitle;
    colors: string[];
    stroke: ApexStroke;
    markers: ApexMarkers;
    dataLabels: ApexDataLabels;
    fill: ApexFill;
};

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

    public chartOptions: Partial<ChartOptions>;

    constructor() {
        this.chartOptions = {
            series: [
                {
                    name: "My-series",
                    data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
                }
            ],
            chart: {
                height: 350,
                type: "area",
                toolbar: {
                    autoSelected: "pan",
                    show: false
                }
            },
            colors: ["#00BAEC"],
            stroke: {
                width: 3
            },
            title: {
                text: "My First Angular Chart"
            },
            xaxis: {
                categories: ["Jan", "Feb",  "Mar",  "Apr",  "May",  "Jun",  "Jul",  "Aug", "Sep"]
            },
            markers: {
                size: 5,
                colors: ["#fff"],
                strokeColors: ["#00BAEC"],
                strokeWidth: 3
            },
            dataLabels: {
                enabled: false
            },
            fill: {
                gradient: {
                    opacityFrom: 0.55,
                    opacityTo: 0
                }
            }
        };
    }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges) {

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

    onClick(): void {
        this.elementClick.emit();
    }
}
