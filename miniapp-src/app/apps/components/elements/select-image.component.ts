import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    forwardRef,
    Input, OnChanges, OnInit,
    Output, SimpleChanges
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';

@Component({
    selector: 'app-select-image',
    templateUrl: 'select-image.component.html',
    standalone: true,
    imports: [
        NgForOf,
        NgIf,
        NgClass
    ],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => SelectImageComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectImageComponent implements ControlValueAccessor, OnInit, OnChanges {

    @Input() editorMode = false;
    @Input() name: string;
    @Input() showTitle: boolean = true;
    @Input() parentIndex: number;
    @Input() maxHeight: number;
    @Input() index: number;
    @Input() data: any[] = [];
    @Input() dataJson: string|null = null;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

    private _value: string;
    maxHeightValue = 'none'

    get value(): string {
        return this._value;
    }

    @Input()
    set value(val) {
        this._value = val;
        this.onChange(this._value);
        this.cdr.detectChanges();
    }

    constructor(
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        if (this.dataJson) {
            this.data = JSON.parse(this.dataJson);
        }
        this.maxHeightValue = this.maxHeight ? this.maxHeight + 'px' : 'none';
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataJson'] && changes['dataJson'].currentValue) {
            this.data = JSON.parse(changes['dataJson'].currentValue);
        }
        if (changes['maxHeight']) {
            this.maxHeightValue = this.maxHeight ? this.maxHeight + 'px' : 'none';
        }
    }

    onChange(_: any) {}

    onTouched(_: any) {}

    writeValue(value: string) {
        this.value = value;
    }

    registerOnChange(fn: (_: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => void) {
        this.onTouched = fn;
    }

    selectItem(item: any): void {
        if (this.editorMode) {
            return;
        }
        this.value = this.value !== item.name ? item.name : '';
    }
}
