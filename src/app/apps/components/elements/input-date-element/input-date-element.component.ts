import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';

interface CalendarDay {
    date: Date;
    dateValue: string;
    dayNumber: number;
    currentMonth: boolean;
    today: boolean;
    selected: boolean;
    rangeStart: boolean;
    rangeEnd: boolean;
    inRange: boolean;
    busy: boolean;
}

@Component({
    selector: 'app-input-date-element',
    templateUrl: 'input-date-element.component.html',
    standalone: true,
    imports: [
        FormsModule,
        NgClass,
        NgForOf,
        NgIf,
        NgTemplateOutlet
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputDateElementComponent implements OnChanges {

    @Input() editorMode = false;
    @Input() name: string;
    @Input() label: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() includeTime = true;
    @Input() compactView = false;
    @Input() rangeMode = false;
    @Input() busyDates: string[] = [];
    @Input() busyDatesFieldName: string = '';
    @Input() dataJson: any = null;
    @Input() dataArrJson: any = null;
    @Input() value: string | null = '';
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

    isOpened = false;
    isBusy = false;
    viewYear: number;
    viewMonth: number;
    selectedDate = '';
    rangeStartDate = '';
    rangeEndDate = '';
    selectedHour = '00';
    selectedMinute = '00';
    rangeStartHour = '00';
    rangeStartMinute = '00';
    rangeEndHour = '00';
    rangeEndMinute = '00';
    calendarDays: CalendarDay[] = [];
    weekDays: string[] = [];
    hours = Array.from({length: 24}, (_, index) => this.pad(index));
    minutes = Array.from({length: 60}, (_, index) => this.pad(index));
    private syncedBusyDates: string[] = [];
    private lastEmittedValue: string | null = null;

    constructor(
        private cdr: ChangeDetectorRef
    ) {
        const today = new Date();
        this.viewYear = today.getFullYear();
        this.viewMonth = today.getMonth();
        this.weekDays = this.createWeekDays();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.isOwnValueChange(changes)) {
            this.lastEmittedValue = null;
            return;
        }
        if (changes['value'] || changes['includeTime'] || changes['rangeMode'] || changes['busyDates'] || changes['busyDatesFieldName'] || changes['dataJson'] || changes['dataArrJson']) {
            this.syncStateFromValue(this.value || '');
        }
        this.calendarDays = this.createCalendarDays();
    }

    get displayValue(): string {
        if (!this.value) {
            return this.rangeMode ? $localize `Select period` : $localize `Select date`;
        }
        return String(this.value);
    }

    get monthLabel(): string {
        const locale = window.document.documentElement.lang || undefined;
        const date = new Date(this.viewYear, this.viewMonth, 1);
        return date.toLocaleDateString(locale, {month: 'long', year: 'numeric'});
    }

    get normalizedBusyDates(): string[] {
        return this.syncedBusyDates
            .map((date) => this.normalizeComparable(date))
            .filter(Boolean);
    }

    @HostListener('document:click')
    closeDropdown(): void {
        if (this.compactView && this.isOpened) {
            this.isOpened = false;
            this.cdr.detectChanges();
        }
    }

    toggleDropdown(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        if (this.editorMode) {
            return;
        }
        this.isOpened = !this.isOpened;
        this.cdr.detectChanges();
    }

    keepDropdownOpened(event: MouseEvent): void {
        event.stopPropagation();
    }

    previousMonth(): void {
        if (this.editorMode) {
            return;
        }
        const date = new Date(this.viewYear, this.viewMonth - 1, 1);
        this.viewYear = date.getFullYear();
        this.viewMonth = date.getMonth();
        this.calendarDays = this.createCalendarDays();
        this.cdr.detectChanges();
    }

    nextMonth(): void {
        if (this.editorMode) {
            return;
        }
        const date = new Date(this.viewYear, this.viewMonth + 1, 1);
        this.viewYear = date.getFullYear();
        this.viewMonth = date.getMonth();
        this.calendarDays = this.createCalendarDays();
        this.cdr.detectChanges();
    }

    selectDate(day: CalendarDay): void {
        if (this.editorMode) {
            return;
        }
        if (day.busy) {
            this.isBusy = true;
            this.cdr.detectChanges();
            return;
        }

        if (this.rangeMode) {
            this.selectRangeDate(day);
            return;
        }

        this.selectedDate = day.dateValue;
        this.viewYear = day.date.getFullYear();
        this.viewMonth = day.date.getMonth();
        this.emitSelectedValue();
    }

    onTimeChange(): void {
        if (this.editorMode) {
            return;
        }
        if (!this.selectedDate && (!this.rangeStartDate || !this.rangeEndDate)) {
            return;
        }
        if (this.rangeMode) {
            this.emitRangeValue();
        } else {
            this.emitSelectedValue();
        }
    }

    clearValue(event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.selectedDate = '';
        this.rangeStartDate = '';
        this.rangeEndDate = '';
        this.value = '';
        this.isBusy = false;
        this.calendarDays = this.createCalendarDays();
        this.lastEmittedValue = '';
        this.valueChange.emit('');
        this.cdr.detectChanges();
    }

    private selectRangeDate(day: CalendarDay): void {
        const shouldStartNewRange = !this.rangeStartDate ||
            !!this.rangeEndDate ||
            this.compareDates(day.dateValue, this.rangeStartDate) < 0;

        if (shouldStartNewRange) {
            this.rangeStartDate = day.dateValue;
            this.rangeEndDate = '';
            this.viewYear = day.date.getFullYear();
            this.viewMonth = day.date.getMonth();
            this.isBusy = false;
            this.calendarDays = this.createCalendarDays();
            this.cdr.detectChanges();
            return;
        }

        this.rangeEndDate = day.dateValue;
        this.viewYear = day.date.getFullYear();
        this.viewMonth = day.date.getMonth();
        this.emitRangeValue();
    }

    private emitSelectedValue(): void {
        const outputValue = this.createOutputValue(this.selectedDate);
        this.isBusy = this.isBusyDate(this.selectedDate, this.selectedHour, this.selectedMinute);
        if (this.isBusy) {
            this.calendarDays = this.createCalendarDays();
            this.cdr.detectChanges();
            return;
        }

        this.value = outputValue;
        this.calendarDays = this.createCalendarDays();
        this.lastEmittedValue = outputValue;
        this.valueChange.emit(outputValue);
        console.log(this.value);
        if (this.compactView) {
            this.isOpened = false;
        }
        this.cdr.detectChanges();
    }

    private emitRangeValue(): void {
        if (!this.rangeStartDate || !this.rangeEndDate) {
            this.calendarDays = this.createCalendarDays();
            this.cdr.detectChanges();
            return;
        }
        this.isBusy = this.isRangeBusy();
        if (this.isBusy) {
            this.calendarDays = this.createCalendarDays();
            this.cdr.detectChanges();
            return;
        }

        const outputValue = `${this.createRangeDateValue(this.rangeStartDate, 'start')} - ${this.createRangeDateValue(this.rangeEndDate, 'end')}`;
        this.value = outputValue;
        this.calendarDays = this.createCalendarDays();
        this.lastEmittedValue = outputValue;
        this.valueChange.emit(outputValue);
        if (this.compactView) {
            this.isOpened = false;
        }
        this.cdr.detectChanges();
    }

    private syncStateFromValue(value: string): void {
        const busyDates = [...(this.busyDates || [])];
        const data = this.parseDataSource(this.dataJson);
        const dataArr = this.parseDataSource(this.dataArrJson);
        const sourceValue = this.busyDatesFieldName ? this.readFieldValue(data, this.busyDatesFieldName) : null;

        if (Array.isArray(sourceValue)) {
            busyDates.push(...this.normalizeSourceArray(sourceValue, this.busyDatesFieldName));
        } else if (sourceValue) {
            busyDates.push(String(sourceValue));
        }

        if (Array.isArray(dataArr)) {
            busyDates.push(...this.normalizeSourceArray(dataArr, this.busyDatesFieldName));
        }

        this.syncedBusyDates = busyDates.map((date) => String(date || '').trim()).filter(Boolean);

        if (!value || typeof value !== 'string') {
            this.selectedDate = '';
            this.rangeStartDate = '';
            this.rangeEndDate = '';
            this.isBusy = false;
            return;
        }

        if (this.rangeMode) {
            this.syncRangeStateFromValue(value);
            return;
        }

        this.selectedDate = value.substring(0, 10);
        if (this.includeTime && value.length >= 16) {
            this.selectedHour = value.substring(11, 13);
            this.selectedMinute = value.substring(14, 16);
        }

        const selected = this.parseDate(this.selectedDate);
        this.viewYear = selected.getFullYear();
        this.viewMonth = selected.getMonth();
        this.isBusy = this.isBusyDate(this.selectedDate, this.selectedHour, this.selectedMinute);
    }

    private syncRangeStateFromValue(value: string): void {
        const [startValue, endValue] = value.split(/\s+-\s+/);
        this.rangeStartDate = startValue ? startValue.substring(0, 10) : '';
        this.rangeEndDate = endValue ? endValue.substring(0, 10) : '';
        if (this.includeTime) {
            if (startValue?.length >= 16) {
                this.rangeStartHour = startValue.substring(11, 13);
                this.rangeStartMinute = startValue.substring(14, 16);
            }
            if (endValue?.length >= 16) {
                this.rangeEndHour = endValue.substring(11, 13);
                this.rangeEndMinute = endValue.substring(14, 16);
            }
        }

        const dateToShow = this.rangeStartDate || this.rangeEndDate;
        if (dateToShow) {
            const selected = this.parseDate(dateToShow);
            this.viewYear = selected.getFullYear();
            this.viewMonth = selected.getMonth();
        }
        this.isBusy = this.rangeStartDate && this.rangeEndDate ? this.isRangeBusy() : false;
    }

    private createOutputValue(dateValue: string): string {
        if (!dateValue) {
            return '';
        }
        if (!this.includeTime) {
            return dateValue;
        }
        return `${dateValue} ${this.selectedHour}:${this.selectedMinute}`;
    }

    private createRangeDateValue(dateValue: string, side: 'start'|'end'): string {
        if (!this.includeTime) {
            return dateValue;
        }
        const hour = side === 'start' ? this.rangeStartHour : this.rangeEndHour;
        const minute = side === 'start' ? this.rangeStartMinute : this.rangeEndMinute;
        return `${dateValue} ${hour}:${minute}`;
    }

    private createCalendarDays(): CalendarDay[] {
        const firstDay = new Date(this.viewYear, this.viewMonth, 1);
        const startOffset = (firstDay.getDay() + 6) % 7;
        const startDate = new Date(this.viewYear, this.viewMonth, 1 - startOffset);
        const todayValue = this.formatDate(new Date());

        return Array.from({length: 42}, (_, index) => {
            const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index);
            const dateValue = this.formatDate(date);
            return {
                date,
                dateValue,
                dayNumber: date.getDate(),
                currentMonth: date.getMonth() === this.viewMonth,
                today: dateValue === todayValue,
                selected: this.rangeMode ? dateValue === this.rangeStartDate || dateValue === this.rangeEndDate : dateValue === this.selectedDate,
                rangeStart: this.rangeMode && dateValue === this.rangeStartDate,
                rangeEnd: this.rangeMode && dateValue === this.rangeEndDate,
                inRange: this.rangeMode && this.isDateInRange(dateValue),
                busy: this.isBusyDate(dateValue, this.selectedHour, this.selectedMinute)
            };
        });
    }

    private createWeekDays(): string[] {
        const locale = window.document.documentElement.lang || undefined;
        const monday = new Date(2024, 0, 1);
        return Array.from({length: 7}, (_, index) => {
            const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
            return date.toLocaleDateString(locale, {weekday: 'short'});
        });
    }

    private isDateInRange(dateValue: string): boolean {
        return !!this.rangeStartDate &&
            !!this.rangeEndDate &&
            this.compareDates(dateValue, this.rangeStartDate) > 0 &&
            this.compareDates(dateValue, this.rangeEndDate) < 0;
    }

    private isRangeBusy(): boolean {
        if (!this.rangeStartDate || !this.rangeEndDate) {
            return false;
        }
        return this.normalizedBusyDates.some((busyDate) => {
            const busyDateOnly = busyDate.substring(0, 10);
            return this.compareDates(busyDateOnly, this.rangeStartDate) >= 0 &&
                this.compareDates(busyDateOnly, this.rangeEndDate) <= 0;
        });
    }

    private isBusyDate(dateValue: string, hour = this.selectedHour, minute = this.selectedMinute): boolean {
        if (!dateValue) {
            return false;
        }
        const dateOnlyValue = dateValue.substring(0, 10);
        const exactValue = this.includeTime ? `${dateOnlyValue} ${hour}:${minute}` : dateOnlyValue;
        return this.normalizedBusyDates.some((busyDate) => {
            if (busyDate.length <= 10) {
                return busyDate === dateOnlyValue;
            }
            return this.includeTime ? busyDate === exactValue : busyDate.substring(0, 10) === dateOnlyValue;
        });
    }

    private normalizeComparable(value: string): string {
        if (!value) {
            return '';
        }
        if (!this.includeTime) {
            return value.substring(0, 10);
        }
        return value.replace('T', ' ').substring(0, 16);
    }

    private normalizeSourceArray(items: any[], fieldName: string): string[] {
        return items
            .map((item) => {
                if (item && typeof item === 'object' && !Array.isArray(item) && fieldName) {
                    return this.readFieldValue(item, fieldName);
                }
                if (item && typeof item === 'object' && !Array.isArray(item) && '' in item) {
                    return item[''];
                }
                return item;
            })
            .filter((item) => item !== null && typeof item !== 'undefined')
            .map((item) => String(item));
    }

    private isOwnValueChange(changes: SimpleChanges): boolean {
        return Object.keys(changes).length === 1 &&
            !!changes['value'] &&
            this.lastEmittedValue !== null &&
            (changes['value'].currentValue || '') === this.lastEmittedValue;
    }

    private readFieldValue(data: any, fieldName: string): any {
        if (!data || !fieldName) {
            return null;
        }
        return fieldName.split('.').reduce((value, key) => {
            if (value && typeof value === 'object' && key in value) {
                return value[key];
            }
            return null;
        }, data);
    }

    private parseDataSource(value: any): any {
        if (!value) {
            return null;
        }
        if (typeof value !== 'string') {
            return value;
        }
        try {
            return JSON.parse(value);
        } catch (error) {
            return null;
        }
    }

    private parseDate(value: string): Date {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    private compareDates(first: string, second: string): number {
        return this.parseDate(first).getTime() - this.parseDate(second).getTime();
    }

    private formatDate(date: Date): string {
        return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())}`;
    }

    private pad(value: number): string {
        return String(value).padStart(2, '0');
    }
}
