import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html'
})
export class FileUploadComponent implements OnInit {

    @Input() fileInputAccept: string;
    @Input() multiple = true;
    files: File[] = [];
    loadingUpload = false;

    constructor() {}

    ngOnInit(): void {

    }

    onFileChange(event: Event): void {
        if (this.loadingUpload) {
            return;
        }
        const inputEl = event.target as HTMLInputElement;
        this.files = Array.from(inputEl.files);
    }

    dropHandler(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();

        (event.target as HTMLElement).classList.remove('border-green-400');

        this.files = this.getTransferredFiles(event.dataTransfer);
        if (!this.multiple) {
            this.files.splice(1, this.files.length);
        }
        console.log(this.files);
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
    }
}
