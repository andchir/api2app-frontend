import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import WaveSurfer from 'wavesurfer.js';

@Component({
    selector: 'app-audio-player',
    templateUrl: 'audio-player.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgClass
    ],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => AudioPlayerComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioPlayerComponent implements AfterViewInit, ControlValueAccessor, OnChanges, OnDestroy {

    @ViewChild('waveformContainer', { static: false }) waveformContainer!: ElementRef<HTMLDivElement>;

    @Input() editorMode = false;
    @Input() name: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() label: string = '';
    @Input() waveColor: string = '#4F4A85';
    @Input() progressColor: string = '#383351';
    @Input() cursorColor: string = '#383351';
    @Input() height: number = 80;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

    wavesurfer: WaveSurfer | null = null;
    isLoading: boolean = false;
    isPlaying: boolean = false;
    currentTime: string = '0:00';
    duration: string = '0:00';
    hasError: boolean = false;
    errorMessage: string = '';

    private _value: string = '';

    get value(): string {
        return this._value;
    }

    @Input()
    set value(val: string) {
        if (val !== this._value) {
            this._value = val || '';
            this.onChange(this._value);
            if (this.wavesurfer && val) {
                this.loadAudio(val);
            }
            this.cdr.detectChanges();
        }
    }

    constructor(
        private cdr: ChangeDetectorRef
    ) {}

    ngAfterViewInit(): void {
        if (this._value && this.waveformContainer) {
            this.initWavesurfer();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value'] && !changes['value'].firstChange) {
            const newValue = changes['value'].currentValue;
            if (newValue && this.waveformContainer) {
                if (!this.wavesurfer) {
                    this.initWavesurfer();
                } else {
                    this.loadAudio(newValue);
                }
            }
        }
    }

    private initWavesurfer(): void {
        if (!this.waveformContainer?.nativeElement) {
            return;
        }

        // Destroy existing instance if any
        if (this.wavesurfer) {
            this.wavesurfer.destroy();
            this.wavesurfer = null;
        }

        this.isLoading = true;
        this.hasError = false;
        this.errorMessage = '';
        this.cdr.detectChanges();

        this.wavesurfer = WaveSurfer.create({
            container: this.waveformContainer.nativeElement,
            waveColor: this.waveColor,
            progressColor: this.progressColor,
            cursorColor: this.cursorColor,
            height: this.height,
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            normalize: true,
            interact: true,
            fillParent: true,
            minPxPerSec: 1,
            hideScrollbar: true
        });

        this.wavesurfer.on('ready', () => {
            this.isLoading = false;
            this.duration = this.formatTime(this.wavesurfer?.getDuration() || 0);
            this.cdr.detectChanges();
        });

        this.wavesurfer.on('play', () => {
            this.isPlaying = true;
            this.cdr.detectChanges();
        });

        this.wavesurfer.on('pause', () => {
            this.isPlaying = false;
            this.cdr.detectChanges();
        });

        this.wavesurfer.on('finish', () => {
            this.isPlaying = false;
            this.cdr.detectChanges();
        });

        this.wavesurfer.on('timeupdate', (currentTime: number) => {
            this.currentTime = this.formatTime(currentTime);
            this.cdr.detectChanges();
        });

        this.wavesurfer.on('error', (error: Error) => {
            this.isLoading = false;
            this.hasError = true;
            this.errorMessage = error.message || 'Failed to load audio';
            console.error('Wavesurfer error:', error);
            this.cdr.detectChanges();
        });

        this.wavesurfer.on('loading', () => {
            this.isLoading = true;
            this.hasError = false;
            this.cdr.detectChanges();
        });

        if (this._value) {
            this.loadAudio(this._value);
        }
    }

    private loadAudio(url: string): void {
        if (!this.wavesurfer) {
            return;
        }

        this.isLoading = true;
        this.hasError = false;
        this.errorMessage = '';
        this.currentTime = '0:00';
        this.duration = '0:00';
        this.cdr.detectChanges();

        try {
            this.wavesurfer.load(url);
        } catch (error) {
            this.isLoading = false;
            this.hasError = true;
            this.errorMessage = 'Failed to load audio file';
            console.error('Failed to load audio:', error);
            this.cdr.detectChanges();
        }
    }

    togglePlayPause(): void {
        if (!this.wavesurfer || this.isLoading || this.hasError) {
            return;
        }
        this.wavesurfer.playPause();
    }

    private formatTime(seconds: number): string {
        if (isNaN(seconds) || !isFinite(seconds)) {
            return '0:00';
        }
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    onChange(_: any) {}

    onTouched(_: any) {}

    writeValue(value: string): void {
        this._value = value || '';
        if (this._value && this.waveformContainer) {
            if (!this.wavesurfer) {
                // Delay initialization to ensure the container is ready
                setTimeout(() => {
                    this.initWavesurfer();
                }, 0);
            } else {
                this.loadAudio(this._value);
            }
        }
        this.cdr.detectChanges();
    }

    registerOnChange(fn: (_: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => void) {
        this.onTouched = fn;
    }

    ngOnDestroy(): void {
        if (this.wavesurfer) {
            this.wavesurfer.destroy();
            this.wavesurfer = null;
        }
    }
}
