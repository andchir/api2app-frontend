import { Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FileUploadComponent),
            multi: true,
        }
    ]
})
export class FileUploadComponent implements ControlValueAccessor {

    private _value: File[];
    @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
    @Input() fileInputAccept: string;
    @Input() multiple: boolean = true;
    @Input() placeholder: string = 'Upload File';
    @Input() usePreview: boolean = true;
    disabled = false;
    files: File[] = [];
    imageBlobsUrls: string[] = [];
    loadingUpload = false;

    constructor() {}

    get value(): File[] {
        return this._value;
    }

    @Input()
    set value(val: File[]) {
        this._value = val;
        if (!this._value || this._value.length === 0) {
            this.files = [];
            this.imageBlobsUrls = [];
            this.clearFileInput();
        }
        this.onChange(this._value);
    }

    onFileChange(event: Event): void {
        if (this.loadingUpload) {
            return;
        }
        const inputEl = event.target as HTMLInputElement;
        this.files = Array.from(inputEl.files);
        this.writeValue(this.files);
    }

    dropHandler(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();

        this.dragLeave(null, event.target as HTMLElement);

        const files = this.getTransferredFiles(event.dataTransfer);
        this.files = [...files, ...this.files];
        if (!this.multiple) {
            this.files.splice(1, this.files.length);
        }
        this.writeValue(this.files);
    }

    dragOverHandler(event: DragEvent): void {
        event.preventDefault();
    }

    dragEnter(event: DragEvent, element?: HTMLElement): void {
        element = element || event.target as HTMLElement;
        if (element.tagName !== 'DIV') {
            this.dragEnter(null, element.parentElement);
            return;
        }
        element.classList.add('border-green-400');
        element.querySelector('button').classList.add('pointer-events-none');
    }

    dragLeave(event: DragEvent, element?: HTMLElement): void {
        element = element || event.target as HTMLElement;
        if (element.tagName !== 'DIV') {
            this.dragLeave(null, element.parentElement);
            return;
        }
        element.classList.remove('border-green-400');
        element.querySelector('button').classList.remove('pointer-events-none');
    }

    buttonHandler(event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
        }
        if (this.loadingUpload) {
            return;
        }
        const buttonEl = (event.target as HTMLElement).tagName === 'BUTTON'
            ? event.target as HTMLElement
            : (event.target as HTMLElement).parentNode;
        if (buttonEl.previousSibling) {
            const fileInput = buttonEl.previousSibling as HTMLInputElement;
            fileInput.click();
        }
    }

    getTransferredFiles(dataTransfer: DataTransfer): File[] {
        const files = [];
        if (dataTransfer.items) {
            for (let i = 0; i < dataTransfer.items.length; i++) {
                const file = dataTransfer.items[i].getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }
        return files;
    }

    deleteFile(index: number): void {
        if (this.files.length - 1 < index) {
            return;
        }
        this.files.splice(index, 1);
        if (this.files.length === 0) {
            this.clearFileInput();
        }
        this.writeValue(this.files);
    }

    clearFileInput(): void {
        if (this.fileInput && this.fileInput.nativeElement) {
            this.fileInput.nativeElement.value = null;
        }
    }

    onChange: (value: File[]) => void = noop;

    onTouch: () => void = noop;

    registerOnChange(fn: (value: File[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    writeValue(value: File[]): void {
        this.imageBlobsUrls = [];
        this.value = value;
        if (value) {
            value.forEach((file, index) => {
                this.imageBlobsUrls[index] = this.createImageUrl(file);
            });
        }
    }

    createImageUrl(file: File, imageEl?: HTMLImageElement): string {
        if (!file.type.includes('image/') && !file.type.includes('djvu')) {
            return null;
        }
        if (imageEl && !imageEl.src) {
            imageEl.onload = () => {
                URL.revokeObjectURL(imageEl.src);
            };
        }
        return URL.createObjectURL(file);
    }

    onImageLoaded(event: Event) {
        const imageEl = event.target as HTMLImageElement;
        if (imageEl.src) {
            URL.revokeObjectURL(imageEl.src);
        }
    }
}
