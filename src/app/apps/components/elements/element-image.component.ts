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
export class ElementImageComponent implements ControlValueAccessor, OnChanges {

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
    croppedImage: SafeUrl | string = '';

    private _value: SafeUrl | File | string = '';

    get value(): SafeUrl | File | string {
        return this._value;
    }

    @Input()
    set value(val: SafeUrl | File | string) {
        console.log('VALUE', val);
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
        console.log('ngOnChanges', changes);
        if (changes['imageUrl'] && this.useCropper) {
            this.loading = true;
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

    blobToFile(blobUrl: string): void {
        var reader = new FileReader();
        reader.onload = function() {
            console.log(reader.result);
        }
        // reader.readAsText(blobString);
    }

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
