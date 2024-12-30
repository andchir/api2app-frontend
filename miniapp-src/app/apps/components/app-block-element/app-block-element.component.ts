import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import * as moment from 'moment';
import { PaginationInstance } from 'ngx-pagination';

import { AppBlockElement, AppBlockElementType } from '../../models/app-block.interface';
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
    @Input() locale: string;
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
    @Output() message: EventEmitter<string[]> = new EventEmitter<string[]>();
    @Output() progressUpdate: EventEmitter<string> = new EventEmitter<string>();
    @Output() progressCompleted: EventEmitter<string> = new EventEmitter<string>();

    inputTypes: {name: AppBlockElementType, title: string, icon: string}[] = [
        {name: 'text-header', title: $localize `Text Header`, icon: 'bi-type-h1'},
        {name: 'text', title: $localize `Text`, icon: 'bi-fonts'},
        {name: 'button', title: $localize `Button`, icon: 'bi-app'},
        {name: 'input-text', title: $localize `Text Field`, icon: 'bi-input-cursor-text'},
        {name: 'input-hidden', title: $localize `Hidden Text Field`, icon: 'bi-input-cursor'},
        {name: 'input-textarea', title: $localize `Text Area`, icon: 'bi-textarea-resize'},
        {name: 'input-number', title: $localize `Number Field`, icon: 'bi-1-square'},
        {name: 'input-slider', title: $localize `Range Slider`, icon: 'bi-sliders'},
        {name: 'input-switch', title: $localize `Switch`, icon: 'bi-toggle-off'},
        {name: 'input-select', title: $localize `Select`, icon: 'bi-menu-button'},
        {name: 'input-tags', title: $localize `Tags`, icon: 'bi-tag'},
        {name: 'input-radio', title: $localize `Radio Buttons`, icon: 'bi-ui-radios'},
        {name: 'input-color', title: $localize `Color Picker`, icon: 'bi-palette'},
        {name: 'input-date', title: $localize `Calendar`, icon: 'bi-calendar3'},
        {name: 'input-file', title: $localize `Upload File`, icon: 'bi-upload'},
        {name: 'image', title: $localize `Image`, icon: 'bi-image'},
        {name: 'audio', title: $localize `Audio`, icon: 'bi-music-note-beamed'},
        {name: 'video', title: $localize `Video`, icon: 'bi-play-btn'},
        {name: 'input-chart-line', title: $localize `Line Chart`, icon: 'bi-graph-up'},
        {name: 'input-pagination', title: $localize `Pagination`, icon: 'bi-segmented-nav'},
        {name: 'status', title: $localize `Status Indicator`, icon: 'bi-check-circle'},
        {name: 'progress', title: $localize `Progress Indicator`, icon: 'bi-percent'},
        {name: 'table', title: $localize `Table`, icon: 'bi-table'},
        {name: 'input-select-image', title: $localize `Select image`, icon: 'bi-ui-checks-grid'},
        {name: 'user-subscription', title: $localize `User subscription`, icon: 'bi-cart-check'}
        // {name: 'crop-image', title: $localize `Crop image`, icon: 'bi-crop'}
    ];

    chartOptions: ChartOptions;
    pagesOptions: PaginationInstance;
    timerSelectItem: any;

    constructor() {}

    ngOnInit(): void {
        this.createChartOptions();
        if (!this.editorMode) {
            this.updateStateByOptions();
        }
        if (this.options.type === 'input-pagination' && !this.options.valueObj) {
            this.updatePagesOptions();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        // console.log('ngOnChanges', this.options.type, changes);
        if (this.options.type === 'input-chart-line' && changes['valueObj']) {
            if (this.chartOptions) {
                this.chartOptionsUpdate();
            }
        }
        if (this.options.type === 'input-pagination' && changes['type']) {
            if (this.options.type === 'input-pagination' && !this.options.valueObj) {
                this.updatePagesOptions();
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
            case 'input-pagination':
                this.updatePagesOptions();
                break;
        }
    }

    onClick(): void {
        this.elementClick.emit();
    }

    onFieldValueChanged(): void {
        this.elementValueChange.emit(this.options);
    }

    onChange(optionName: string, isChecked: boolean, emitChange = false) {
        this.options[optionName] = !isChecked;
        if (emitChange) {
            this.onFieldValueChanged();
        }
    }

    onImageError(imageContainer: HTMLElement, element: AppBlockElement, index?: number): void {
        if (imageContainer) {
            imageContainer.classList.remove('loading-bg-image');
        }
        if (this.editorMode) {
            return;
        }
        const imageBrokenUrl = 'assets/img/image-broken.png';
        if (typeof index !== 'undefined' && element.valueArr) {
            if (element.itemThumbnailFieldName) {
                element.valueArr[index][element.itemThumbnailFieldName] = imageBrokenUrl;
            } else {
                element.valueArr[index] = imageBrokenUrl;
            }
        } else {
            element.value = imageBrokenUrl;
        }
        this.onFieldValueChanged();
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

    updatePagesOptions(): void {
        this.options.valueObj = {
            id: this.options.name,
            totalItems: this.editorMode ? (this.options.perPage * 5) : 0,
            itemsPerPage: this.options.perPage,
            currentPage: 1
        }
        this.options.value = this.options.useAsOffset ? 0 : 1;
    }

    onPageChanged(pageNumber: number): void {
        if (!this.options.valueObj) {
            this.updatePagesOptions();
        }
        this.options.valueObj.currentPage = pageNumber;
        this.options.value = this.options.useAsOffset
            ? this.options.perPage * (pageNumber - 1)
            : pageNumber;
        this.onFieldValueChanged();
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

    download(url: any, filename = '', preventClick: boolean = false, event?: MouseEvent): void {
        if (event && preventClick) {
            event.preventDefault();
            return;
        }
        if (typeof url === 'object' && url.changingThisBreaksApplicationSecurity) {
            url = url.changingThisBreaksApplicationSecurity;
        }
        if (typeof url === 'string' && (url.match(/^https?:\/\//) || url.includes('blob:') )) {
            return;
        }
        if (event) {
            event.preventDefault();
        }
        if (!filename) {
            const matches = url.match(/data:image\/([^;]+)/);
            filename = (new Date().valueOf()) + '.' + matches[1];
        }
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                link.click();
            })
            .catch(console.error);
    }

    onProgressUpdate(options: any): void {
        const taskIdField = options.taskIdFieldName || 'uuid';
        const taskId = options?.valueObj ? options?.valueObj[taskIdField] : '';
        if (taskId) {
            this.progressUpdate.emit(taskId);
        }
    }

    onProgressCompleted(options: any): void {
        const taskIdField = options.taskIdFieldName || 'uuid';
        const taskId = options?.valueObj ? options?.valueObj[taskIdField] : '';
        if (taskId) {
            this.progressCompleted.emit(taskId);
        }
    }

    onMessage(msg: string[]) {
        this.message.emit(msg);
    }

    isArray(obj: any ): boolean {
        return Array.isArray(obj);
    }
}
