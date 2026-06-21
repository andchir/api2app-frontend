import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-api-export',
    templateUrl: './api-export.component.html'
})
export class ApiExportComponent {

    @Input() curlString = '';
    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    copied = false;

    closeModal(reason = 'close'): void {
        this.close.emit(reason);
    }

    copyToClipboard(): void {
        if (!this.curlString || !navigator?.clipboard) {
            return;
        }
        navigator.clipboard.writeText(this.curlString)
            .then(() => {
                this.copied = true;
                setTimeout(() => {
                    this.copied = false;
                }, 1500);
            });
    }
}
