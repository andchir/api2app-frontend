import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter, forwardRef,
    Input,
    OnChanges,
    Output, SecurityContext,
    SimpleChanges
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';

@Component({
    selector: 'app-image-elem',
    templateUrl: 'element-image.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        ImageCropperComponent
    ],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ElementImageComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElementImageComponent implements ControlValueAccessor, OnChanges {

    @Input() editorMode = false;
    @Input() name: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() imageUrl: string | SafeResourceUrl | null;
    @Input() imageLargeUrl: string | SafeResourceUrl | null;
    @Input() fullWidth: boolean;
    @Input() borderShadow: boolean;
    @Input() roundedCorners: boolean;
    @Input() useLink: boolean;
    @Input() useCropper: boolean;
    @Input() valueFieldName: string;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

    downloadUrl: string | SafeResourceUrl | null = '#';
    isCropped: boolean = false;
    imageWidth: number = 0;
    imageHeight: number = 0;
    imageOutputWidth: number = 0;
    imageOutputHeight: number = 0;
    loading: boolean = false;
    imageChangedEvent: Event | null = null;
    croppedImage: SafeUrl | string = '';

    private _value: SafeUrl | File | string = '';

    get value(): SafeUrl | File | string {
        return this._value;
    }

    @Input()
    set value(val: SafeUrl | File | string) {
        if ((!this.imageUrl && val) || !this.useCropper) {
            if (val instanceof File) {
                this.imageUrl = URL.createObjectURL(val);
            } else {
                this.imageUrl = typeof val === 'string'
                    ? this.sanitizer.bypassSecurityTrustUrl(val)
                    : val;
            }
        }
        if (this.useLink) {
            this.createLinkUrl();
        }
        this._value = val || '';
        this.onChange(this._value);
        this.cdr.detectChanges();
    }

    constructor(
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (this.editorMode) {
            return;
        }
        if (changes['imageUrl'] && this.useCropper) {
            this.loading = true;
        }
        if (this.useLink && (changes['imageUrl'] || changes['imageLargeUrl'])) {
            this.createLinkUrl();
        }
    }

    createLinkUrl(): void {
        let downloadUrl = this.imageLargeUrl || this.imageUrl;
        if (downloadUrl && typeof downloadUrl === 'object' && downloadUrl['changingThisBreaksApplicationSecurity']) {
            downloadUrl = downloadUrl['changingThisBreaksApplicationSecurity'];
            downloadUrl = this.sanitizer.sanitize(SecurityContext.URL, downloadUrl);
        }
        this.downloadUrl = typeof downloadUrl === 'string' && downloadUrl.indexOf('data:') === -1
            ? this.sanitizer.bypassSecurityTrustUrl(downloadUrl)
            : '#download';
    }

    download(event?: MouseEvent): void {
        if (event && !this.useLink) {
            event.preventDefault();
            return;
        }
        let downloadUrl = (this.imageLargeUrl || this.imageUrl || '') as any;
        if (downloadUrl && downloadUrl['changingThisBreaksApplicationSecurity']) {
            downloadUrl = downloadUrl['changingThisBreaksApplicationSecurity'];
            downloadUrl = this.sanitizer.sanitize(SecurityContext.URL, downloadUrl);
        }
        if (typeof downloadUrl === 'string' && (downloadUrl.match(/^https?:\/\//) || downloadUrl.includes('blob:') )) {
            return;
        }
        if (event) {
            event.preventDefault();
        }
        const matches = downloadUrl.match(/data:image\/([^;]+)/);
        const filename = (new Date().valueOf()) + '.' + matches[1];

        fetch(downloadUrl)
            .then(response => response.blob())
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                }, 100);
            })
            .catch(console.error);
    }

    onImageError(imageContainer: HTMLElement): void {
        if (imageContainer) {
            imageContainer.classList.remove('loading-bg-image');
        }
        if (this.editorMode) {
            return;
        }
        // const imageBrokenUrl = 'assets/img/image-broken.png';
        // if (typeof index !== 'undefined' && element.valueArr) {
        //     if (element.itemThumbnailFieldName) {
        //         element.valueArr[index][element.itemThumbnailFieldName] = imageBrokenUrl;
        //     } else {
        //         element.valueArr[index] = imageBrokenUrl;
        //     }
        // } else {
        //     element.value = imageBrokenUrl;
        // }
        // this.onFieldValueChanged();
    }

    imageLoaded(image: LoadedImage): void {
        this.imageWidth = image.original.size.width;
        this.imageHeight = image.original.size.height;
        this.imageOutputWidth = this.imageWidth;
        this.imageOutputHeight = this.imageHeight;
        this.isCropped = false;
    }

    imageCropped(event: ImageCroppedEvent): void {
        this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
        this.imageOutputWidth = event.width;
        this.imageOutputHeight = event.height;
        this.isCropped = this.imageWidth !== this.imageOutputWidth || this.imageHeight !== this.imageOutputHeight;
        this.writeValue(event.objectUrl);
    }

    cropperReady(): void {
        this.loading = false;
    }

    loadImageFailed(): void {
        this.loading = false;
    }

    onChange(_: any): void {}

    onTouched(_: any): void {}

    async createFile(imageUrl: string, fileName: string = 'file'): Promise<void|File> {
        return fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                return new File([blob], 'image', {type: blob.type});
            })
            .catch(console.error);
    }

    writeValue(value: SafeUrl | File | string): void {
        if (typeof value === 'string' && value.indexOf('blob:') === 0) {
            this.createFile(value)
                .then((file) => {
                    this.value = file ? file as File : '';
                });
            return;
        }
        this.value = value || '';
    }

    registerOnChange(fn: (_: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => void) {
        this.onTouched = fn;
    }
}
