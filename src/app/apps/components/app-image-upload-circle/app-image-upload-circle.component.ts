import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-upload-image-circle',
    templateUrl: 'app-image-upload-circle.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ImageUploadCircleComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageUploadCircleComponent implements ControlValueAccessor {

    private _value: File;
    @Input() imageUrl: string;

    get value() {
        return this._value;
    }

    @Input()
    set value(val) {
        this._value = val;
        this.onChange(this._value);
        this.cdr.detectChanges();
    }

    constructor(
        private cdr: ChangeDetectorRef
    ) {}

    onChange(_: any) {}

    onTouched(_: any) {}

    writeValue(value: any) {
        this.value = value;
    }

    registerOnChange(fn: (_: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: (_: any) => void) {
        this.onTouched = fn;
    }

    onFileChange(event: Event, imageEl: HTMLImageElement) {
        const inputEl = event.target as HTMLInputElement;
        const fieldName = inputEl.dataset['name'] || 'image';
        const files = Array.from(inputEl.files);
        this.onAddFiles(files, fieldName, imageEl);
    }

    buttonFileHandle(fileInput: HTMLInputElement) {
        fileInput.click();
    }

    getFileExtension(fileName: string): string {
        return fileName.split('.').pop().toLowerCase();
    }

    onAddFiles(files: File[], fieldName, imageEl: HTMLImageElement): void {
        if (files.length === 0 || !['png', 'jpg', 'jpeg', 'webp'].includes(this.getFileExtension(files[0].name))) {
            return;
        }
        this.imageUrl = null;
        // this.imageUrl = files.length > 0 ? URL.createObjectURL(files[0]) : '';
        const imageUrl = files.length > 0 ? URL.createObjectURL(files[0]) : '';
        imageEl.src = 'assets/img/transp.gif';
        imageEl.style.backgroundImage = `url(${imageUrl})`;
        this.value = files[0];
    }

    dropHandler(event: DragEvent, imageEl: HTMLImageElement): void {
        event.preventDefault();
        event.stopPropagation();
        const files = this.getTransferredFiles(event.dataTransfer);
        this.onAddFiles(files, 'image', imageEl);
        (event.target as HTMLElement).classList.remove('border-green-500');
    }

    dragOverHandler(event: DragEvent): void {
        event.preventDefault();
    }

    dragEnter(event: DragEvent): void {
        (event.target as HTMLElement).classList.add('border-green-500');
    }

    dragLeave(event: DragEvent): void {
        (event.target as HTMLElement).classList.remove('border-green-500');
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
}
