import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { ChartComponent } from 'ng-apexcharts';
import { PaginationInstance } from 'ngx-pagination';

import {
    AppBlockElement,
    AppBlockElementArrayValue,
    AppBlockElementObjectValue,
    AppBlockElementRecord,
    AppBlockElementType,
    AppBlockElementValue,
    ChartValue,
    PaginationValue
} from '../../models/app-block.interface';
import { MessagesElementComponent } from '../elements/messages-element.component';
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
    @Input() tabIndex: number = 0;
    @Input() tabIndexCurrent: number = 0;
    @Input() editorMode = false;
    @Input() type: AppBlockElementType;
    @Input() locale: string;
    @Input() options: AppBlockElement;
    @Input() value: AppBlockElementValue;
    @Input() valueObj: AppBlockElementObjectValue | null;
    @Input() valueArr: AppBlockElementArrayValue | null;
    @Output() typeChange: EventEmitter<AppBlockElementType> = new EventEmitter<AppBlockElementType>();
    @Output() showOptions: EventEmitter<void> = new EventEmitter<void>();
    @Output() selectAction: EventEmitter<'input'|'output'> = new EventEmitter<'input'|'output'>();
    @Output() elementClick: EventEmitter<void> = new EventEmitter<void>();
    @Output() optionsChange: EventEmitter<AppBlockElement> = new EventEmitter<AppBlockElement>();
    @Output() elementValueChange: EventEmitter<AppBlockElement> = new EventEmitter<AppBlockElement>();
    @Output() itemSelected: EventEmitter<number> = new EventEmitter<number>();
    @Output() message: EventEmitter<string[]> = new EventEmitter<string[]>();
    @Output() progressUpdate: EventEmitter<string> = new EventEmitter<string>();
    @Output() progressCompleted: EventEmitter<string> = new EventEmitter<string>();
    @Output() delete: EventEmitter<number[]> = new EventEmitter<number[]>();
    @Output() cloneElement: EventEmitter<number[]> = new EventEmitter<number[]>();
    @Output() addAfter: EventEmitter<number[]> = new EventEmitter<number[]>();
    @Output() selected: EventEmitter<string> = new EventEmitter<string>();
    @Output() unselected: EventEmitter<string> = new EventEmitter<string>();
    @Output() refreshIframeContent: EventEmitter<HTMLIFrameElement> = new EventEmitter<HTMLIFrameElement>();

    @ViewChild(MessagesElementComponent) messagesEl?: MessagesElementComponent;
    @ViewChild('chartLine') chartLine?: ChartComponent;

    chartOptions: ChartOptions;
    pagesOptions: PaginationInstance;
    timerSelectItem?: ReturnType<typeof setTimeout>;

    constructor(
        private elementRef: ElementRef
    ) {}

    ngOnInit(): void {
        this.createChartOptions();
        if (this.isChartElement()) {
            this.chartOptionsUpdate();
        }
        if (!this.editorMode) {
            this.updateStateByOptions();
        }
        if (this.options.type === 'input-pagination' && !this.options.valueObj) {
            this.updatePagesOptions();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log('ngOnChanges', this.options.type, changes);
        const typeChange = changes['type'];
        if (typeChange && !typeChange.firstChange) {
            this.updateStateByTypeChange();
        }
        if (this.isChartElement() && changes['valueObj'] && (!typeChange || typeChange.firstChange)) {
            if (this.chartOptions) {
                this.chartOptionsUpdate();
                this.renderChartLine();
            }
        }
        if (this.isChartElement() && changes['tabIndexCurrent']) {
            const previousTabIndex = changes['tabIndexCurrent'].previousValue;
            const currentTabIndex = changes['tabIndexCurrent'].currentValue;
            const wasHidden = this.tabIndex !== -1 && previousTabIndex !== this.tabIndex;
            const isVisible = this.tabIndex === -1 || currentTabIndex === this.tabIndex;

            if (wasHidden && isVisible) {
                this.renderChartLine();
            }
        }
        if (changes['editorMode'] && !changes['editorMode'].firstChange && !changes['editorMode'].currentValue) {
            this.updateStateByOptions();
        }
        if (changes['value'] && ['text'].includes(this.options.type) && this.options.maxHeight) {
            setTimeout(this.scrollBottom.bind(this), 1);
        }
    }

    updateItemType(): void {
        this.typeChange.emit(this.type);
    }

    elementClone(index: number, parentIndex: number, event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.cloneElement.emit([parentIndex, index]);
    }

    elementAddAfter(index: number, parentIndex: number, event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.addAfter.emit([parentIndex, index]);
    }

    elementDelete(index: number, parentIndex: number, event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.delete.emit([parentIndex, index]);
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

    numberIncrease(keyName = 'value', max?: number): void {
        const currentValue = Number(this.options[keyName as keyof AppBlockElement] || 0);
        if (typeof max === 'number' && currentValue >= max) {
            return;
        }
        this.updateOptions({[keyName]: currentValue + 1}, true);
    }

    numberDecrease(keyName = 'value', min?: number): void {
        const currentValue = Number(this.options[keyName as keyof AppBlockElement] || 0);
        if (typeof min === 'number' && currentValue <= min) {
            return;
        }
        this.updateOptions({[keyName]: currentValue - 1}, true);
    }

    chartOptionsUpdate(): void {
        if (!this.chartOptions || !this.isChartValue(this.valueObj)) {
            return;
        }
        if (this.options.type === 'input-chart-pie') {
            this.chartOptions.series = this.valueObj.yAxisData.map((value) => this.normalizeChartValue(value));
            this.chartOptions.labels = this.valueObj.xAxisData.map((value) => String(value || ''));
            this.chartOptions.chart.type = 'donut';
            return;
        }
        this.chartOptions.series = [
            {
                name: this.options?.itemTitle || 'Item',
                data: this.valueObj?.yAxisData.map((value) => this.normalizeChartValue(value))
            }
        ];
        this.chartOptions.xaxis = {
            categories: this.valueObj?.xAxisData
        };
        if (['bar', 'area'].includes(this.chartOptions.chart.type)) {
            this.chartOptions.chart.type = this.valueObj?.yAxisData.length > 400 || this.valueObj?.yAxisData.length < 10 ? 'bar' : 'area';
        }
    }

    renderChartLine(): void {
        if (!this.chartOptions || !this.chartLine) {
            return;
        }

        setTimeout(() => {
            this.chartLine?.updateOptions({
                series: this.chartOptions.series,
                xaxis: this.chartOptions.xaxis,
                labels: this.chartOptions.labels,
                chart: this.chartOptions.chart
            }, false, true);
        });
    }

    isChartElement(): boolean {
        return ['input-chart-line', 'input-chart-pie'].includes(this.options?.type);
    }

    updateStateByOptions(): void {
        switch (this.options.type) {
            case 'input-rating':
                this.updateOptions({value: this.normalizeRatingValue(this.options.value as string | number | null)});
                break;
            case 'input-date':
                if (!this.options.value && this.options.useDefault) {
                    const offsetDays = this.options?.offset || 0;
                    const now = moment();
                    // now.set({hour: 0, minutes: 0, seconds: 0});
                    now.add(offsetDays, 'days');
                    this.updateOptions({
                        value: this.options?.includeTime === false ? now.format('YYYY-MM-DD') : now.format('YYYY-MM-DD HH:mm')
                    });
                }
                break;
            case 'input-pagination':
                this.updatePagesOptions();
                break;
        }
    }

    private updateStateByTypeChange(): void {
        if (this.isChartElement()) {
            this.createChartOptions();
            this.chartOptionsUpdate();
            this.renderChartLine();
            return;
        }

        if (this.options.type === 'input-pagination') {
            if (!this.options.valueObj) {
                this.updatePagesOptions();
            }
            return;
        }

        if (!this.editorMode) {
            this.updateStateByOptions();
        }
    }

    onClick(): void {
        this.elementClick.emit();
    }

    onFieldValueInput(value: AppBlockElementValue): void {
        const nextValue = this.options.type === 'input-rating'
            ? this.normalizeRatingValue(value as string | number | null)
            : value;
        if (!Object.is(this.options.value, nextValue)) {
            this.updateOptions({value: nextValue});
        }
    }

    onFieldValueChanged(value: AppBlockElementValue): void {
        this.onFieldValueInput(value);
        this.elementValueChange.emit(this.options);
        const elementParent = this.elementRef.nativeElement.parentNode?.parentNode;
        // Auto pause audio/video
        if (elementParent) {
            const audioElements = Array.from(elementParent.querySelectorAll('audio,video'));
            audioElements.forEach((audio) => {
                (audio as HTMLAudioElement).pause();
            });
        }
    }

    onTableValueSelected(value: string): void {
        this.onFieldValueChanged(value);
    }

    onValueArrChanged(valueArr: AppBlockElementArrayValue): void {
        this.updateOptions({valueArr}, true);
    }

    onChange(optionName: keyof AppBlockElement, isChecked: boolean, emitChange = false): void {
        this.updateOptions({[optionName]: !isChecked}, emitChange);
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
            const valueArr = [...element.valueArr];
            if (element.itemThumbnailFieldName) {
                const item = valueArr[index];
                if (item && typeof item === 'object' && !(item instanceof File)) {
                    valueArr[index] = {...item, [element.itemThumbnailFieldName]: imageBrokenUrl};
                }
            } else {
                valueArr[index] = imageBrokenUrl;
            }
            this.updateOptions({valueArr}, true);
        } else {
            this.updateOptions({value: imageBrokenUrl}, true);
        }
    }

    createChartOptions(): void {
        const isPieChart = this.options?.type === 'input-chart-pie';
        this.chartOptions = {
            series: isPieChart
                ? (this.editorMode ? [430, 1000, 2300] : [])
                : [
                    {
                        name: this.options?.itemTitle || 'Item',
                        data: this.editorMode ? [10, 41, 35, 51, 49, 62, 69, 91, 148] : []
                    }
                ],
            xaxis: {
                categories: this.editorMode ? ['Jan', 'Feb',  'Mar',  'Apr',  'May',  'Jun',  'Jul',  'Aug', 'Sep'] : []
            },
            labels: isPieChart && this.editorMode ? ['Category 1', 'Category 2', 'Category 3'] : [],
            chart: {
                height: 350,
                type: isPieChart ? 'donut' : 'area',
                events: {
                    markerClick: (event, chartContext, config) => {
                        this.onItemSelected(config.dataPointIndex);
                    },
                    dataPointSelection: (event, chartContext, config) => {
                        this.onItemSelected(config.dataPointIndex);
                    }
                }
            },
            colors: isPieChart ? ['#00BAEC', '#34D399', '#F59E0B', '#F472B6', '#8B5CF6', '#64748B'] : ['#00BAEC'],
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
        const valueObj: PaginationValue = {
            id: this.options.name,
            totalItems: this.editorMode ? ((this.options.perPage || 0) * 5) : 0,
            itemsPerPage: this.options.perPage || 0,
            currentPage: 1
        };
        this.updateOptions({
            valueObj,
            value: this.options.useAsOffset ? 0 : 1
        });
    }

    onPageChanged(pageNumber: number): void {
        if (!this.isPaginationValue(this.options.valueObj)) {
            this.updatePagesOptions();
        }
        const valueObj = {...this.paginationValue, currentPage: pageNumber} as PaginationValue;
        const value = this.options.useAsOffset
            ? (this.options.perPage || 0) * (pageNumber - 1)
            : pageNumber;
        this.updateOptions({valueObj, value}, true);
    }

    onItemSelected(index: number): void {
        clearTimeout(this.timerSelectItem);
        this.timerSelectItem = setTimeout(() => {
            const valueObj = this.options.valueObj;
            if (this.isChartValue(valueObj) && valueObj.data?.[index] && this.options.itemFieldName) {
                const selectedValue = valueObj.data[index][this.options.itemFieldName];
                if (this.isElementValue(selectedValue)) {
                    this.updateOptions({value: selectedValue});
                }
            }
            this.itemSelected.emit(index);
        }, 100);
    }

    onProgressUpdate(options: AppBlockElement): void {
        const taskIdField = options.taskIdFieldName || 'uuid';
        const taskId = this.isRecordValue(options.valueObj) ? options.valueObj[taskIdField] : '';
        this.progressUpdate.emit(typeof taskId === 'string' ? taskId : '');
    }

    onProgressCompleted(options: AppBlockElement): void {
        const taskIdField = options.taskIdFieldName || 'uuid';
        const taskId = this.isRecordValue(options.valueObj) ? options.valueObj[taskIdField] : '';
        this.progressCompleted.emit(typeof taskId === 'string' ? taskId : '');
    }

    scrollBottom(): void {
        const textElement = this.elementRef.nativeElement.querySelector('.text-content');
        if (textElement) {
            textElement.scrollTo({
                top: textElement.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    undoLastOutgoing(): void {
        this.messagesEl?.undoLastOutgoing();
    }

    onMessage(msg: string[]): void {
        this.message.emit(msg);
    }

    onSelected(event: MouseEvent): void {
        if ((event.target as HTMLInputElement).checked) {
            this.selected.emit((event.target as HTMLInputElement).value);
        } else {
            this.unselected.emit((event.target as HTMLInputElement).value);
        }
    }

    isArray(obj: unknown): boolean {
        return Array.isArray(obj);
    }

    get paginationValue(): PaginationValue | null {
        return this.isPaginationValue(this.options.valueObj) ? this.options.valueObj : null;
    }

    stringValue(value: AppBlockElementValue | undefined): string {
        return typeof value === 'string' ? value : '';
    }

    stringObjectValue(value: AppBlockElementObjectValue | null | undefined): string {
        return typeof value === 'string' ? value : '';
    }

    numericValue(value: AppBlockElementValue | undefined): number {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : 0;
    }

    recordName(value: string | File | AppBlockElementRecord): string {
        if (value instanceof File) {
            return value.name;
        }
        return typeof value === 'object' && typeof value['name'] === 'string' ? value['name'] : '';
    }

    private updateOptions(patch: Partial<AppBlockElement>, emitValueChange = false): void {
        this.options = {...this.options, ...patch};
        this.optionsChange.emit(this.options);
        if (emitValueChange) {
            this.elementValueChange.emit(this.options);
        }
    }

    private isChartValue(value: AppBlockElementObjectValue | null): value is ChartValue {
        return this.isRecordValue(value) && Array.isArray(value.xAxisData) && Array.isArray(value.yAxisData);
    }

    private isPaginationValue(value: AppBlockElementObjectValue | null | undefined): value is PaginationValue {
        return this.isRecordValue(value) && typeof value.currentPage === 'number';
    }

    private isRecordValue(value: AppBlockElementObjectValue | null | undefined): value is AppBlockElementRecord {
        return !!value && typeof value === 'object' && !(value instanceof File);
    }

    private isElementValue(value: unknown): value is AppBlockElementValue {
        return value === null
            || ['string', 'number', 'boolean'].includes(typeof value)
            || value instanceof File
            || Array.isArray(value);
    }

    private normalizeRatingValue(value: string | number | null): number {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
            return 0;
        }
        return Math.min(5, Math.max(0, Math.round(numericValue)));
    }

    private normalizeChartValue(value: unknown): number {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
            return 0;
        }
        return Number(numericValue.toFixed(2));
    }
}
