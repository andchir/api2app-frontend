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
import { SafeResourceUrl } from '@angular/platform-browser';

import { Subject } from 'rxjs';

@Component({
    selector: 'app-image-elem',
    templateUrl: 'element-image.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgClass
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
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
