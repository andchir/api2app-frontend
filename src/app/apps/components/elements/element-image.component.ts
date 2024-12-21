import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter, forwardRef,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

import { Subject } from 'rxjs';
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
export class ElementImageComponent implements ControlValueAccessor, OnDestroy, OnChanges {

    @Input() editorMode = false;
    @Input() name: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() imageUrl: string | SafeResourceUrl | null;
    @Input() imageLargeUrl: string | SafeResourceUrl | null;
    @Input() valueArr: string;
    @Input() fullWidth: boolean;
    @Input() borderShadow: boolean;
    @Input() roundedCorners: boolean;
    @Input() useLink: boolean;
    @Input() useCropper: boolean;
    @Input() valueFieldName: string;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

    isCropped: boolean = false;
    imageWidth: number = 0;
    imageHeight: number = 0;
    imageOutputWidth: number = 0;
    imageOutputHeight: number = 0;
    loading: boolean = false;
    imageChangedEvent: Event | null = null;
    croppedImage: SafeUrl  = '';

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
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (this.editorMode) {
            return;
        }
    }

    download(event?: MouseEvent): void {
        if (event && !this.useLink) {
            event.preventDefault();
            return;
        }
        let imageUrl = (this.imageLargeUrl || this.imageUrl || '') as any;
        if (imageUrl && imageUrl.changingThisBreaksApplicationSecurity) {
            imageUrl = imageUrl.changingThisBreaksApplicationSecurity;
        }
        if (typeof imageUrl === 'string' && (imageUrl.match(/^https?:\/\//) || imageUrl.includes('blob:') )) {
            return;
        }
        if (event) {
            event.preventDefault();
        }
        const matches = imageUrl.match(/data:image\/([^;]+)/);
        const filename = (new Date().valueOf()) + '.' + matches[1];

        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                link.click();
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
        const imageBrokenUrl = 'assets/img/image-broken.png';
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
        // event.blob can be used to upload the cropped image
        this.imageOutputWidth = event.width;
        this.imageOutputHeight = event.height;
        this.isCropped = this.imageWidth !== this.imageOutputWidth || this.imageHeight !== this.imageOutputHeight;
    }

    cropperReady(): void {
        this.loading = false;
    }

    loadImageFailed(): void {
        this.loading = false;
    }

    onChange(_: any): void {}

    onTouched(_: any): void {}

    writeValue(value: number): void {
        this.value = value || 0;
    }

    registerOnChange(fn: (_: any) => void): void {
        // this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => void): void {
        // this.onTouched = fn;
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    protected readonly String = String;
}
