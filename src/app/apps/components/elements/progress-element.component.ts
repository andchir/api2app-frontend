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
    @Input() statusCompleted: string = 'completed';
    @Input() statusError: string = 'error';
    @Input() statusFieldName: string = 'status';
    @Input() queueNumberFieldName: string = 'number';
    @Input() operationDurationSeconds: 0;
    @Input() data: any = {};
    @Input() dataJson: string|null = null;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() progressUpdate: EventEmitter<void> = new EventEmitter<void>();

    processStartedAt: Date;
    status: string = '';
    queueNumber: number = 0;
    delay: number = 10000;
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
        if (this.dataJson) {
            this.data = JSON.parse(this.dataJson);
        }
        this.onDataUpdated();
    }

    onDataUpdated(): void {
        clearTimeout(this.timer);
        if (!this.data) {
            this.data = {};
        }
        this.delay = 10000;
        this.status = this.data[this.statusFieldName] || 'processing';
        const queueNumber = this.data[this.queueNumberFieldName] || 0;
        const processStarted = queueNumber === 0 && this.queueNumber > 0;
        console.log('status', this.status);
        console.log('queueNumber', this.queueNumber);
        console.log('processStarted?', processStarted);
        if (processStarted) {
            this.processStartedAt = new Date();
        }
        this.queueNumber = queueNumber;
        if ([this.statusCompleted, this.statusError].includes(this.status)) {
            this.writeValue(100);
            return;
        }
        this.writeValue(0);
        if (this.queueNumber > 0) {
            this.pollingStatus();
        } else {
            this.pollingProgress();
        }
    }

    private pollingStatus(): void {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.progressUpdate.emit();
            this.pollingStatus();
        }, this.delay);
    }

    pollingProgress(currentMs: number = 0): void {
        console.log('pollingProgress', currentMs);
        clearTimeout(this.timer);
        if (!this.processStartedAt) {
            return;
        }
        const UPDATE_DELAY = 1000;
        const now = new Date();
        this.timer = setTimeout(() => {
            const diff = Math.min(this.operationDurationSeconds, (now.getTime() - this.processStartedAt.getTime()) / 1000);
            const percent = diff / this.operationDurationSeconds * 100;
            this.writeValue(Math.min(99, percent));
            if (percent < 100) {
                if (currentMs % this.delay === 0) {
                    this.progressUpdate.emit();
                }
                this.pollingProgress(currentMs + UPDATE_DELAY);
            } else {
                this.progressUpdate.emit();
            }
        }, UPDATE_DELAY);
    }

    onChange(_: any) {}

    onTouched(_: any) {}

    writeValue(value: number) {
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
