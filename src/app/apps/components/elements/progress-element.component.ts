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
export class ProgressElementComponent implements ControlValueAccessor, OnDestroy, OnChanges {

    @Input() editorMode = false;
    @Input() name: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() statusCompleted: string = 'completed';
    @Input() statusError: string = 'error';
    @Input() statusFieldName: string = 'status';
    @Input() taskIdFieldName: string = 'uuid';
    @Input() queueNumberFieldName: string = 'number';
    @Input() operationDurationSeconds: number = 0;
    @Input() isBooleanValue: boolean = false;
    @Input() data: any = {};
    @Input() dataJson: string|null = null;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() progressUpdate: EventEmitter<void> = new EventEmitter<void>();
    @Output() progressCompleted: EventEmitter<void> = new EventEmitter<void>();

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
        if (this.editorMode) {
            val = 65;
        }
        this._value = val || 0;
        this.onChange(this._value);
        this.cdr.detectChanges();
    }

    constructor(
        private cdr: ChangeDetectorRef
    ) {}

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
        const taskUuid = this.data[this.taskIdFieldName] || 'app';
        const queueNumber = this.data[this.queueNumberFieldName] || 0;
        const processStarted = queueNumber === 0 && this.queueNumber > 0;
        if (processStarted) {
            this.processStartedAt = new Date();
            window.localStorage.setItem(`${taskUuid}-progress-start`, this.processStartedAt.toISOString());
        }
        this.queueNumber = queueNumber;
        if ([this.statusCompleted, this.statusError].includes(this.status)) {
            this.onCompleted();
            return;
        }
        this.writeValue(0);
        if (this.queueNumber > 0) {
            this.pollingStatus();
        } else {
            this.pollingProgress();
        }
    }

    onCompleted(): void {
        this.writeValue(100);
        const taskUuid = this.data[this.taskIdFieldName] || '';
        if (taskUuid) {
            window.localStorage.removeItem(`${taskUuid}-progress-start`);
        }
        this.progressCompleted.emit();
    }

    private pollingStatus(): void {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.progressUpdate.emit();
            this.pollingStatus();
        }, this.delay);
    }

    pollingProgress(currentMs: number = 0): void {
        clearTimeout(this.timer);
        if (!this.processStartedAt) {
            const taskUuid = this.data[this.taskIdFieldName] || '';
            const dateString = window.localStorage.getItem(`${taskUuid}-progress-start`);
            if (taskUuid) {
                this.processStartedAt = dateString ? new Date(dateString) : new Date();
                if (!dateString) {
                    window.localStorage.setItem(`${taskUuid}-progress-start`, this.processStartedAt.toISOString());
                }
            }
        }
        if (!this.processStartedAt) {
            return;
        }
        const UPDATE_DELAY = 1000;
        const now = new Date();
        this.timer = setTimeout(() => {
            const diff = Math.min(this.operationDurationSeconds, (now.getTime() - this.processStartedAt.getTime()) / 1000);
            const percent = diff / this.operationDurationSeconds * 100;
            this.writeValue(Math.min(99, percent));
            if (currentMs % this.delay === 0) {
                this.progressUpdate.emit();
            }
            this.pollingProgress(currentMs + UPDATE_DELAY);
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
