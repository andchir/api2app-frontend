import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    NgZone,
    OnDestroy,
    Output,
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
export class AudioPlayerComponent implements AfterViewInit, ControlValueAccessor, OnDestroy {

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

    constructor(
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone
    ) {}

    ngAfterViewInit(): void {
        this.syncWavesurferWithValue();
    }

    private setAudioSource(raw: string | Blob | null | undefined): void {
        const normalized = this.normalizeIncomingValue(raw);
        if (normalized === this._value) {
            return;
        }
        this._value = normalized;
        this.syncWavesurferWithValue();
        this.runInZoneAndMarkForCheck();
    }

    private normalizeIncomingValue(raw: string | Blob | null | undefined): string | Blob {
        if (raw == null) {
            return '';
        }
        if (typeof raw === 'string') {
            if (raw === '') {
                return '';
            }
            if (raw.startsWith('data:audio/pcm')) {
                return this.pcmBase64ToWav(raw);
            }
            return raw;
        }
        return raw;
    }

    private syncWavesurferWithValue(): void {
        if (!this._value) {
            this.destroyWavesurfer();
            return;
        }
        if (!this.waveformContainer?.nativeElement) {
            return;
        }
        if (!this.wavesurfer) {
            this.initWavesurfer();
            return;
        }
        this.loadAudio(this._value);
    }

    private destroyWavesurfer(): void {
        if (this.wavesurfer) {
            this.wavesurfer.destroy();
            this.wavesurfer = null;
        }
        this.isPlaying = false;
        this.isLoading = false;
        this.currentTime = '0:00';
        this.duration = '0:00';
        this.hasError = false;
        this.errorMessage = '';
    }

    private runInZoneAndMarkForCheck(): void {
        this.ngZone.run(() => this.cdr.markForCheck());
    }

    pcmBase64ToWav(base64Audio: string, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): Blob {
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
        this.runInZoneAndMarkForCheck();

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
            this.runInZoneAndMarkForCheck();
        });

        this.wavesurfer.on('play', () => {
            this.isPlaying = true;
            this.runInZoneAndMarkForCheck();
        });

        this.wavesurfer.on('pause', () => {
            this.isPlaying = false;
            this.runInZoneAndMarkForCheck();
        });

        this.wavesurfer.on('finish', () => {
            this.isPlaying = false;
            this.runInZoneAndMarkForCheck();
        });

        this.wavesurfer.on('timeupdate', (currentTime: number) => {
            this.currentTime = this.formatTime(currentTime);
            this.runInZoneAndMarkForCheck();
        });

        this.wavesurfer.on('error', (error: Error) => {
            this.isLoading = false;
            this.hasError = true;
            this.errorMessage = $localize `Failed to load audio`;// error.message || 'Failed to load audio';
            console.error('Wavesurfer error:', error);
            this.runInZoneAndMarkForCheck();
        });

        this.wavesurfer.on('loading', () => {
            this.isLoading = true;
            this.hasError = false;
            this.runInZoneAndMarkForCheck();
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
        this.runInZoneAndMarkForCheck();

        try {
            if (this.wavesurfer && url instanceof Blob) {
                this.wavesurfer.loadBlob(url);
            } else {
                this.wavesurfer.load(String(url));
            }
        } catch (error) {
            this.isLoading = false;
            this.hasError = true;
            this.errorMessage = $localize `Failed to load audio`;
            console.error('Failed to load audio:', error);
            this.runInZoneAndMarkForCheck();
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
        this.isLoading = true;
        this.runInZoneAndMarkForCheck();
        fetch(downloadUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const mimeType = blob.type || null;
                const filename = this.generateFilename(mimeType || 'audio/unknown', this.label || 'audio');
                this.downloadBlob(blob, filename);
            })
            .catch(err => {
                console.error('Download failed:', err);
            })
            .finally(() => {
                this.isLoading = false;
                this.runInZoneAndMarkForCheck();
            });
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

    writeValue(value: string | Blob | null | undefined): void {
        this.setAudioSource(value);
    }

    registerOnChange(fn: (_: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => void) {
        this.onTouched = fn;
    }

    ngOnDestroy(): void {
        this.destroyWavesurfer();
    }
}
