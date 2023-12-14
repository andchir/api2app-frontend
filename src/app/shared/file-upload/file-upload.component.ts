import { Component, forwardRef, Input } from '@angular/core';
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
    @Input() fileInputAccept: string;
    @Input() multiple = true;
    @Input() placeholder = 'Upload File';
    disabled = false;
    files: File[] = [];
    loadingUpload = false;

    constructor() {}

    get value(): File[] {
        return this._value;
    }

    @Input()
    set value(val: File[]) {
        this._value = val;
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

        (event.target as HTMLElement).classList.remove('border-green-400');

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

    dragEnter(event: DragEvent): void {
        (event.target as HTMLElement).classList.add('border-green-400');
    }

    dragLeave(event: DragEvent): void {
        (event.target as HTMLElement).classList.remove('border-green-400');
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
                files.push(dataTransfer.items[i].getAsFile());
            }
        }
        return files;
    }

    deleteFile(index: number): void {
        if (this.files.length - 1 < index) {
            return;
        }
        this.files.splice(index, 1);
        this.writeValue(this.files);
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
        this.value = value;
    }
}
