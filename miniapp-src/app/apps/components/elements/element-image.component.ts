import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter, forwardRef,
    Input,
    OnChanges, OnInit,
    Output, SecurityContext,
    SimpleChanges
} from '@angular/core';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import PhotoSwipe from 'photoswipe';
import PhotoSwipeVideoPlugin from 'photoswipe-video-plugin/dist/photoswipe-video-plugin.esm.js';

@Component({
    selector: 'app-image-elem',
    templateUrl: 'element-image.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        ImageCropperComponent,
        NgTemplateOutlet
    ],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ElementImageComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElementImageComponent implements OnInit, ControlValueAccessor, OnChanges {

    @Input() editorMode = false;
    @Input() type: string = 'image';
    @Input() name: string;
    @Input() parentIndex: number;
    @Input() index: number;
    @Input() data: any;
    @Input() poster: string | null;
    @Input() thumbnailFieldName: string | null;
    @Input() largeFieldName: string | null;
    @Input() mediaOriginalUrl: string | null;
    @Input() fullWidth: boolean;
    @Input() borderShadow: boolean;
    @Input() roundedCorners: boolean;
    @Input() useLink: boolean;
    @Input() useCropper: boolean = false;
    @Input() useLightbox: boolean = false;
    @Input() valueFieldName: string;
    @Input() cropperMaintainAspectRatio: boolean = false;
    @Input() cropperAspectRatio: number = 4 / 3;
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

    isCropped: boolean = false;
    imageWidth: number = 0;
    imageHeight: number = 0;
    imageOutputWidth: number = 0;
    imageOutputHeight: number = 0;
    loading: boolean = false;
    imageChangedEvent: Event | null = null;
    croppedImage: SafeUrl | string = '';

    overlay: HTMLElement;
    lightbox: PhotoSwipeLightbox;

    private _cropperAspectRatioString: string = '';

    get cropperAspectRatioString(): string {
        return this._cropperAspectRatioString;
    }

    @Input()
    set cropperAspectRatioString(value: string) {
        if (typeof value === 'string' && /^\d+:\d+$/.test(value)) {
            const parts = value.split(':');
            const num1 = parseInt(parts[0], 10);
            const num2 = parseInt(parts[1], 10);
            this.cropperMaintainAspectRatio = true;
            this.cropperAspectRatio = num1 / num2;
            this._cropperAspectRatioString = value;
        }
    }

    private _value: SafeUrl | File | string = '';

    get value(): SafeUrl | File | string {
        return this._value;
    }

    @Input()
    set value(val: SafeUrl | File | string) {
        if ((!this.mediaOriginalUrl && val) || !this.useCropper) {
            if (val instanceof File) {
                this.mediaOriginalUrl = URL.createObjectURL(val);
            } else {
                this.mediaOriginalUrl = typeof val === 'string' ? val : '';
                // this.mediaOriginalUrl = val && typeof val === 'string'
                //     ? this.sanitizer.bypassSecurityTrustUrl(val)
                //     : val;
            }
        }
        this._value = val || '';
        this.onChange(this._value);
        this.cdr.detectChanges();
    }

    constructor(
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef
    ) {}

    get previewImageUrl(): string | SafeResourceUrl | null {
        if (this.mediaOriginalUrl && this.type === 'image') {
            return this.sanitizer.sanitize(SecurityContext.URL, this.mediaOriginalUrl);
        }
        if (!this.data || typeof this.data !== 'object') {
            if (this.type === 'video') {
                return this.posterUrl || 'assets/img/transp-big.png';
            }
            return this?.data;
        }
        if (this.thumbnailFieldName.match(/^https?:\/\//)) {
            let imageUrl = this.createUrlFromTemplate(this.thumbnailFieldName, this.data);
            return this.sanitizer.sanitize(SecurityContext.URL, imageUrl);
        }
        if (this.data[this.thumbnailFieldName]) {
            return this.sanitizer.sanitize(SecurityContext.URL, this.data[this.thumbnailFieldName]);
        }
        return 'assets/img/transp-big.png';
    }

    get mediaUrl(): string | SafeResourceUrl | null {
        const mediaUrl = this.createOriginalFileUrl();
        if (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.indexOf('data:') > -1) {
            return '#download';
        }
        return mediaUrl;
    }

    get posterUrl(): string | null {
        if (!this.poster) {
            return null;
        }
        if (this.data) {
            if (this.poster.match(/^https?:\/\//)) {
                let imageUrl = this.createUrlFromTemplate(this.poster, this.data);
                return this.sanitizer.sanitize(SecurityContext.URL, imageUrl);
            }
            if (this.data[this.poster]) {
                return this.sanitizer.sanitize(SecurityContext.URL, this.data[this.poster]);
            }
        } else if (this.poster) {
            return this.sanitizer.sanitize(SecurityContext.URL, this.poster);
        }
        return null;
    }

    ngOnInit(): void {
        if (this.useLightbox) {
            this.lightboxInit();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.editorMode) {
            return;
        }
        if (changes['imageUrl'] && this.useCropper) {
            this.loading = true;
        }
    }

    createOriginalFileUrl(): string | null {
        if (this.mediaOriginalUrl) {
            return this.mediaOriginalUrl;
            // let mediaUrl = this.mediaOriginalUrl;
            // if (mediaUrl && typeof mediaUrl === 'object'
            //     && mediaUrl['changingThisBreaksApplicationSecurity']
            //     && mediaUrl['changingThisBreaksApplicationSecurity'].indexOf('data:') > -1) {
            //     return mediaUrl['changingThisBreaksApplicationSecurity'];
            // }
            // return this.sanitizer.sanitize(SecurityContext.URL, this.mediaOriginalUrl);
        }
        if (!this.data || typeof this.data !== 'object') {
            return this?.data;
        }
        if (this.largeFieldName.match(/^https?:\/\//)) {
            let imageUrl = this.createUrlFromTemplate(this.largeFieldName, this.data);
            return this.sanitizer.sanitize(SecurityContext.URL, imageUrl);
        }
        if (this.data[this.largeFieldName]) {
            return this.sanitizer.sanitize(SecurityContext.URL, this.data[this.largeFieldName]);
        }
        return null;
    }

    createUrlFromTemplate(imageUrl: string, data: any): string {
        if (!data) {
            return imageUrl;
        }
        for (const dKey of Object.keys(data)) {
            imageUrl = imageUrl.replace(`{${dKey}}`, this.data[dKey]);
        }
        return imageUrl;
    }

    onClick(event?: MouseEvent): void {
        if (this.useLightbox) {
            this.lightboxOpen(event);
        } else {
            this.download(event);
        }
    }

    download(event?: MouseEvent): void {
        if (event && !this.useLink) {
            event.preventDefault();
            return;
        }
        let downloadUrl = this.createOriginalFileUrl();
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

    onImageLoaded(imageContainer: HTMLElement): void {
        if (imageContainer) {
            imageContainer.classList.remove('loading-bg-image');
        }
    }

    onImageError(imageContainer: HTMLElement, event?: Event): void {
        if (event.target
            && (!(event.target as HTMLImageElement).src
            || (event.target as HTMLImageElement).src === this.getSiteUrl())) {
            return;
        }
        if (imageContainer) {
            imageContainer.classList.remove('loading-bg-image');
            imageContainer.classList.add('error-bg-image');
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

    cropperImageLoaded(image: LoadedImage): void {
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

    lightboxInit(event?: MouseEvent): void {
        const options = {
            allowPanToNext: false,
            wheelToZoom: true,
            bgOpacity: 0.6,
            // showHideAnimationType: 'none',
            showAnimationDuration: 0,
            hideAnimationDuration: 0,
            pswpModule: PhotoSwipe,
            dataSource: []
        }
        this.lightbox = new PhotoSwipeLightbox(options);

        const videoPlugin = new PhotoSwipeVideoPlugin(this.lightbox, {
            autoplay: false
        });

        this.lightbox.on('afterInit', () => {
            const videoEl = this.lightbox.pswp.container.querySelector('video');
            if (videoEl) {
                videoEl.play().then(_ => {

                }).catch(err => {
                    console.log(err);
                });
                videoEl.style.position = 'static';
                videoEl.style.backgroundColor = '#000000';
            }
        });

        this.lightbox.init();
    }

    createLoadingOverlay(): void {
        this.overlay = document.createElement('div');
        Object.assign(this.overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '100'
        });
        const spinner = document.createElement('div');
        spinner.className = 'animate-spin';
        Object.assign(spinner.style, {
            width: '60px',
            height: '60px',
            border: '6px solid rgba(255, 255, 255, 0.3)',
            borderTop: '6px solid #ffffff',
            borderRadius: '50%'
        });
        this.overlay.appendChild(spinner);
        document.body.appendChild(this.overlay);
    }

    lightboxOpen(event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
        }
        const mediaUrl = this.mediaUrl as string;
        const posterUrl = this.posterUrl;

        if (this.type === 'image' || posterUrl) {
            this.createLoadingOverlay();
            const img = new Image();
            img.onload = () => {
                this.overlay.remove();
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;
                if (this.type === 'image') {
                    this.lightbox.options.dataSource = [
                        {
                            src: img.src,
                            width: naturalWidth,
                            height: naturalHeight,
                            alt: ''
                        }
                    ];
                } else {
                    this.lightbox.options.dataSource = [
                        {
                            src: img.src,
                            width: naturalWidth,
                            height: naturalHeight,
                            msrc: img.src,
                            videoSrc: mediaUrl,
                            type: 'video'
                        }
                    ];
                }
                this.lightbox.loadAndOpen(0);
            };
            img.src = this.type === 'video' ? posterUrl : mediaUrl;
        } else {
            this.lightbox.options.dataSource = [
                {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    type: 'video',
                    msrc: this.previewImageUrl as string,
                    videoSrc: mediaUrl
                }
            ];
            this.lightbox.loadAndOpen(0);
        }
    }

    getSiteUrl(): string {
        return window.location.protocol + '//' + window.location.host + '/';
    }
}
