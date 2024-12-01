import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter, forwardRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { NgIf } from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import { Subject } from 'rxjs';

import { PercentComponent } from '../../../shared/percent/percent.component';


@Component({
    selector: 'app-progress',
    templateUrl: 'progress-element.component.html',
    standalone: true,
    imports: [
        NgIf,
        PercentComponent
    ],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ProgressElementComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressElementComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges {

    @Input() editorMode = false;
    @Input() name: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() statusCompleted: 'completed';
    @Input() statusError: 'error';
    @Input() statusFieldName: 'status';
    @Input() queueNumberFieldName: 'number';
    @Input() operationDurationSeconds: 0;
    @Input() data: any = {};
    @Input() dataJson: string|null = null;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() progressUpdate: EventEmitter<string> = new EventEmitter<string>();

    queueNumber: number = 0;
    delay: number = 10000;
    isError: boolean = false;
    timer: any;
    private destroyed$ = new Subject<void>();

    private _value: number = 0;

    get value(): number {
        return this._value;
    }

    @Input()
    set value(val) {
        this._value = val || 0;
        this.onChange(this._value);
        this.cdr.detectChanges();
    }

    constructor(
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // console.log('ngOnInit');
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.editorMode) {
            return;
        }
        console.log('ngOnChanges', changes);
        if (this.dataJson) {
            this.data = JSON.parse(this.dataJson);
        }
        this.onDataUpdated();
    }

    onDataUpdated(): void {
        console.log('onDataUpdated', this.data);
        clearTimeout(this.timer);
        if (!this.data) {
            this.data = {};
        }
        const status = this.data[this.statusFieldName] || 'processing';
        this.queueNumber = this.data[this.queueNumberFieldName] || 0;
        if ([this.statusCompleted, this.statusError].includes(status)) {
            this.isError = status === this.statusError;
            this.writeValue(100);
            return;
        }
        this.writeValue(0);
        console.log('status', status);
        console.log('queueNumber', this.queueNumber);
    }

    onChange(_: any) {}

    onTouched(_: any) {}

    writeValue(value: number) {
        console.log('writeValue', value);
        this.value = value || 0;
    }

    registerOnChange(fn: (_: any) => void) {
        // this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => void) {
        // this.onTouched = fn;
    }

    ngOnDestroy(): void {
        clearTimeout(this.timer);
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
