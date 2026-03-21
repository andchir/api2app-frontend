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
    @Input() waveColor: string = '#06b6d4';
    @Input() progressColor: string = '#36d9d9';
    @Input() cursorColor: string = '#36d9d9';
    @Input() height: number = 80;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

    wavesurfer: WaveSurfer | null = null;
    isLoading: boolean = false;
    isPlaying: boolean = false;
    currentTime: string = '0:00';
    duration: string = '0:00';
    hasError: boolean = false;
    errorMessage: string = '';

    MIME_TO_EXTENSION: Record<string, string> = {
        'audio/wav': 'wav',
        'audio/mpeg': 'mp3',
        'audio/mp3': 'mp3',
        'audio/ogg': 'ogg',
        'audio/webm': 'webm',
        'audio/flac': 'flac',
        'audio/aac': 'aac',
        'audio/x-m4a': 'm4a',
        'audio/pcm': 'pcm',
        'audio/x-pcm': 'pcm'
    };

    private _value: string | Blob = '';

    get value(): string | Blob {
        return this._value;
    }

    @Input()
    set value(val: string | Blob) {
        if (val !== this._value) {
            if (typeof val === 'string' && val.startsWith('data:audio/pcm')) {
                this.value = this.pcmBase64ToWav(val);
                return;
            }
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

    pcmBase64ToWav(base64Audio: string, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): any {
        if (base64Audio.startsWith('data:')) {
            base64Audio = base64Audio.substring(base64Audio.indexOf(',') + 1);
        }

        let binaryString;
        try {
            binaryString = atob(base64Audio);
        } catch (e) {
            console.error('Base64 decoding error:', e);
            throw new Error('Invalid base64 data');
        }

        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // 3. Receive PCM data (16-bit little-endian)
        // Ensure the buffer contains an even number of bytes for 16-bit data
        if (bytes.length % 2 !== 0) {
            console.warn('PCM data has an odd number of bytes, trim the last byte');
        }

        const pcmData = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.length / 2));

        // 4. Create a WAV header
        const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
        const blockAlign = numChannels * (bitsPerSample / 8);
        const dataSize = pcmData.length * (bitsPerSample / 8);
        const headerSize = 44;
        const totalSize = headerSize + dataSize;

        const wavBuffer = new ArrayBuffer(totalSize);
        const view = new DataView(wavBuffer);

        // RIFF chunk
        writeString(view, 0, 'RIFF');
        view.setUint32(4, totalSize - 8, true); // размер файла минус RIFF и размер
        writeString(view, 8, 'WAVE');

        // fmt subchunk
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // размер fmt чанка (16 для PCM)
        view.setUint16(20, 1, true);  // PCM формат
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);

        // data subchunk
        writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);

        // Writing PCM data
        let offset = 44;
        for (let i = 0; i < pcmData.length; i++) {
            view.setInt16(offset, pcmData[i], true);
            offset += 2;
        }

        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }

        return new Blob([wavBuffer], { type: 'audio/wav' });
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
            this.errorMessage = $localize `Failed to load audio`;// error.message || 'Failed to load audio';
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

    private loadAudio(url: string | Blob): void {
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
            if (this.wavesurfer && url instanceof Blob) {
                this.wavesurfer.loadBlob(url);
            } else {
                this.wavesurfer.load(String(url));
            }
        } catch (error) {
            this.isLoading = false;
            this.hasError = true;
            this.errorMessage = $localize `Failed to load audio`;;
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

    downloadAudio(): void {
        if (!this.wavesurfer || this.isLoading || this.hasError) {
            return;
        }
        if (this.value instanceof Blob) {
            this.downloadBlob(this.value);
        } else {
            this.downloadFromUrl(String(this.value));
        }
    }

    downloadBlob(blob: Blob, filename: string = ''): void {
        if (!filename) {
            const mimeType = blob.type || null;
            filename = this.generateFilename(mimeType || 'audio/unknown', this.label || 'audio');
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    downloadFromUrl(downloadUrl: string): void {
        fetch(downloadUrl)
            .then(response => response.blob())
            .then(blob => {
                const mimeType = blob.type || null;
                const filename = this.generateFilename(mimeType || 'audio/unknown', this.label || 'audio');
                this.downloadBlob(blob, filename);
            })
            .catch(console.error);
    }

    generateFilename(
        mimeType: string,
        filename: string = 'audio'
    ): string {
        const extension = this.getExtensionFromMimeType(mimeType);

        // Очищаем имя файла от недопустимых символов
        const safeFilename = filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

        return `${safeFilename}_${timestamp}.${extension}`;
    }

    getExtensionFromMimeType(mimeType: string): string {
        const cleanMime = mimeType.split(';')[0].trim();
        return this.MIME_TO_EXTENSION[cleanMime] || cleanMime.split('/')[1] || 'txt';
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
