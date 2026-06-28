import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    forwardRef,
    Input
} from '@angular/core';
import { NgClass, NgForOf } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-rating-element',
    templateUrl: 'rating-element.component.html',
    standalone: true,
    imports: [
        NgClass,
        NgForOf
    ],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => RatingElementComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingElementComponent implements ControlValueAccessor {

    @Input() editorMode = false;
    @Input() name: string;
    @Input() parentIndex: number;
    @Input() index: number;

    readonly stars = [1, 2, 3, 4, 5];
    hoverValue = 0;
    disabled = false;
    private _value = 0;

    get value(): number {
        return this._value;
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

    setHoverValue(value: number): void {
        if (this.editorMode || this.disabled) {
            return;
        }
        this.hoverValue = value;
        this.cdr.markForCheck();
    }

    clearHoverValue(): void {
        if (this.editorMode || this.disabled) {
            return;
        }
        this.hoverValue = 0;
        this.cdr.markForCheck();
    }

    selectValue(value: number): void {
        if (this.editorMode || this.disabled) {
            return;
        }
        this._value = this.normalizeValue(value);
        this.onChange(this._value);
        this.onTouched();
        this.cdr.markForCheck();
    }

    isFilled(star: number): boolean {
        return star <= (this.hoverValue || this.value);
    }

    private normalizeValue(value: string | number | null): number {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
            return 0;
        }
        return Math.min(5, Math.max(0, Math.round(numericValue)));
    }
}
