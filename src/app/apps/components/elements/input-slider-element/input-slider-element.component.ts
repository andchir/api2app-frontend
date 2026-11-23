import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    forwardRef,
    Input
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-input-slider-element',
    templateUrl: 'input-slider-element.component.html',
    imports: [
        NgStyle
    ],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => InputSliderElementComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputSliderElementComponent implements ControlValueAccessor {

    @Input() editorMode = false;
    @Input() name: string;
    @Input() label: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() min: number | string = 0;
    @Input() max: number | string = 100;
    @Input() step: number | string = 1;

    disabled = false;
    private _value = 0;

    get value(): number {
        return this._value;
    }

    get minValue(): number {
        return this.toNumber(this.min, 0);
    }

    get maxValue(): number {
        return this.toNumber(this.max, 100);
    }

    get stepValue(): number {
        return this.toNumber(this.step, 1);
    }

    get progress(): number {
        const min = this.minValue;
        const max = this.maxValue;
        if (max <= min) {
            return 0;
        }
        return (this._value - min) / (max - min) * 100;
    }

    constructor(
        private cdr: ChangeDetectorRef
    ) {}

    onChange(_: number) {}

    onTouched() {}

    writeValue(value: string | number | null): void {
        this._value = this.normalizeValue(value);
        this.cdr.markForCheck();
    }

    registerOnChange(fn: (_: number) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.cdr.markForCheck();
    }

    onSliderChange(value: string | number): void {
        this._value = this.normalizeValue(value);
        this.onChange(this._value);
        this.onTouched();
        this.cdr.markForCheck();
    }

    private normalizeValue(value: string | number | null | undefined): number {
        const numericValue = this.toNumber(value, NaN);
        if (!Number.isFinite(numericValue)) {
            return this.minValue;
        }
        return Math.min(this.maxValue, Math.max(this.minValue, numericValue));
    }

    private toNumber(value: number | string | null | undefined, fallback: number): number {
        const numericValue = typeof value === 'string'
            ? parseFloat(value.replace(',', '.'))
            : Number(value);
        return Number.isFinite(numericValue) ? numericValue : fallback;
    }
}
