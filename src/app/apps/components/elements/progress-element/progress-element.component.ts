import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    forwardRef,
    inject,
    input,
    output,
    signal,
    untracked
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PercentComponent } from '../../../../shared/percent/percent.component';


@Component({
    selector: 'app-progress',
    templateUrl: 'progress-element.component.html',
    imports: [
        PercentComponent
    ],
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ProgressElementComponent),
            multi: true
        }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressElementComponent implements ControlValueAccessor {

    readonly editorMode = input(false);
    readonly name = input<string>();
    readonly parentIndex = input<number>();
    readonly index = input<number>();
    readonly statusPending = input('');
    readonly statusProcessing = input('');
    readonly statusCompleted = input('completed');
    readonly statusError = input('error');
    readonly statusFieldName = input('status');
    readonly taskIdFieldName = input('uuid');
    readonly queueNumberFieldName = input('number');
    readonly operationDurationSeconds = input(0);
    readonly isBooleanValue = input(false);
    readonly data = input<unknown>(null);
    readonly dataJson = input<string | null>();
    readonly valueInput = input<number>(undefined, { alias: 'value' });

    readonly valueChange = output<string>();
    readonly progressUpdate = output<void>();
    readonly progressCompleted = output<void>();
    readonly message = output<string[]>();

    private readonly currentValue = signal(0);
    readonly value = computed(() => this.editorMode() ? 65 : this.currentValue());
    readonly status = signal('');
    readonly queueNumber = signal(0);
    readonly isTerminal = computed(() =>
        [this.statusCompleted(), this.statusError(), 'canceled'].includes(this.status()));

    private readonly progressInputs = computed(() => {
        const json = this.dataJson();
        let data: unknown;
        try {
            // An explicitly cleared JSON input must not reuse stale object data.
            data = json === undefined ? this.data() : json ? JSON.parse(json) : null;
        } catch {
            data = undefined;
        }
        return {
            data,
            statusFieldName: this.statusFieldName(),
            taskIdFieldName: this.taskIdFieldName(),
            queueNumberFieldName: this.queueNumberFieldName(),
            statusPending: this.statusPending(),
            statusProcessing: this.statusProcessing(),
            statusCompleted: this.statusCompleted(),
            statusError: this.statusError(),
            operationDurationSeconds: this.operationDurationSeconds()
        };
    });

    private processStartedAt: Date | null = null;
    private readonly delay = 10000;
    private timer: ReturnType<typeof setTimeout> | null = null;
    private destroyed = false;
    private active = false;
    private finished = false;
    private taskUuid: string;
    private waiting = false;
    private nextPollAt = 0;

    constructor() {
        inject(DestroyRef).onDestroy(() => {
            this.destroyed = true;
            this.stopPolling();
        });
        effect(() => {
            const value = this.valueInput();
            if (value !== undefined) {
                untracked(() => this.writeValue(value));
            }
        });
        effect(() => {
            const editorMode = this.editorMode();
            const inputs = this.progressInputs();
            // Timer ticks and writes to UI signals must not retrigger input processing.
            untracked(() => {
                if (editorMode) {
                    this.stopPolling();
                } else {
                    this.onDataUpdated(inputs);
                }
            });
        });
    }

    private onDataUpdated(inputs: ReturnType<ProgressElementComponent['progressInputs']>): void {
        if (this.destroyed) {
            return;
        }
        const data = inputs.data;
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            this.stopPolling();
            if (data === null && this.taskUuid !== undefined) {
                // Clearing the input explicitly starts a new lifecycle, including
                // integrations that do not provide a unique task identifier.
                this.taskUuid = undefined;
                this.finished = false;
                this.processStartedAt = null;
                this.waiting = false;
                this.status.set('');
                this.queueNumber.set(0);
                this.writeValue(0);
            }
            return;
        }
        const taskUuid = String((inputs.taskIdFieldName && data[inputs.taskIdFieldName]) || 'app');
        const isNewTask = this.taskUuid !== taskUuid;
        if (isNewTask) {
            this.stopPolling();
            this.taskUuid = taskUuid;
            this.finished = false;
            this.processStartedAt = null;
            this.waiting = false;
            this.writeValue(0);
        }
        // Ignore repeated terminal responses and late responses after cancellation.
        if (this.finished) {
            return;
        }
        this.status.set(inputs.statusFieldName ? String(data[inputs.statusFieldName] || 'processing') : 'processing');
        const queueNumber = Number(inputs.queueNumberFieldName ? data[inputs.queueNumberFieldName] : 0);
        this.queueNumber.set(Number.isFinite(queueNumber) ? Math.max(0, queueNumber) : 0);
        if ([inputs.statusCompleted, inputs.statusError].includes(this.status())) {
            const result = 'result_data' in data ? data.result_data as { message?: string } : null;
            const errorMessage = this.status() === inputs.statusError ? result?.message : null;
            this.onCompleted();
            if (errorMessage) {
                this.onError(errorMessage);
            }
            return;
        }
        const wasWaiting = this.waiting;
        this.waiting = this.queueNumber() > 0 || !!(inputs.statusPending
            && inputs.statusPending !== inputs.statusProcessing && this.status() === inputs.statusPending);
        if (this.waiting) {
            this.processStartedAt = null;
            this.writeValue(0);
        } else {
            if (!this.processStartedAt) {
                const savedStart = wasWaiting ? null : this.readStartTime();
                this.processStartedAt = savedStart || new Date();
                this.storeStartTime(this.processStartedAt);
            }
            this.updateProgress();
        }
        // Responses may arrive much more often than the polling interval.
        // Keep the existing deadline and timer when updating the displayed state.
        if (!this.active) {
            this.active = true;
            this.nextPollAt = Date.now() + this.delay;
            this.scheduleTick();
        }
    }

    onCompleted(): void {
        if (this.finished || this.destroyed) {
            return;
        }
        this.finished = true;
        this.stopPolling();
        this.writeValue(100);
        this.storeStartTime(null);
        this.processStartedAt = null;
        this.progressCompleted.emit();
    }

    onError(message: string): void {
        this.message.emit([message, 'error']);
    }

    private scheduleTick(): void {
        this.timer = setTimeout(() => {
            if (!this.active || this.destroyed) {
                return;
            }
            if (!this.waiting) {
                this.updateProgress();
            }
            const now = Date.now();
            const shouldPoll = now >= this.nextPollAt;
            if (shouldPoll) {
                this.nextPollAt = now + this.delay;
            }
            // Schedule before emitting: a synchronous subscriber can cancel,
            // complete, replace the task or destroy this component.
            this.scheduleTick();
            if (shouldPoll) {
                this.progressUpdate.emit();
            }
        }, 1000);
    }

    private updateProgress(): void {
        if (!this.processStartedAt) {
            return;
        }
        const duration = Number(this.operationDurationSeconds());
        const elapsed = Math.max(0, Date.now() - this.processStartedAt.getTime());
        const percent = Number.isFinite(duration) && duration > 0 ? elapsed / (duration * 1000) * 100 : 0;
        this.writeValue(Math.min(99, percent));
    }

    private stopPolling(): void {
        this.active = false;
        clearTimeout(this.timer);
        this.timer = null;
    }

    private readStartTime(): Date | null {
        try {
            const saved = window.localStorage.getItem(`${this.taskUuid}-progress-start`);
            const timestamp = saved ? Date.parse(saved) : NaN;
            return Number.isFinite(timestamp) && timestamp <= Date.now() ? new Date(timestamp) : null;
        } catch {
            return null;
        }
    }

    private storeStartTime(date: Date | null): void {
        try {
            const key = `${this.taskUuid}-progress-start`;
            if (date) {
                window.localStorage.setItem(key, date.toISOString());
            } else {
                window.localStorage.removeItem(key);
            }
        } catch {
            // Progress can continue in memory when browser storage is unavailable.
        }
    }

    cancel(): void {
        if (this.finished || this.destroyed) {
            return;
        }
        this.finished = true;
        this.stopPolling();
        this.status.set('canceled');
        this.queueNumber.set(0);
        this.processStartedAt = null;
        this.storeStartTime(null);
        this.writeValue(0);
        this.progressCompleted.emit();
    }

    writeValue(value: number): void {
        const numericValue = Number(value);
        this.currentValue.set(Number.isFinite(numericValue)
            ? Math.max(0, Math.min(100, Math.round(numericValue))) : 0);
    }

    // This read-only control never reports a user-entered form value.
    registerOnChange(_fn: (_: any) => void): void {}

    registerOnTouched(_fn: (_: any) => void): void {}
}
