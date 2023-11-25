import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiItem } from "../models/api-item.interface";

@Component({
    selector: 'app-share-api',
    templateUrl: './share-api.component.html',
    styleUrls: ['./share-api.component.scss']
})
export class ShareApiComponent implements OnInit {

    @Input() title = 'Share API';
    @Input() loading = false;
    @Input() item: ApiItem;
    @Input() isActive = false;
    @Input() readOnly = false;
    @Output() isActiveChange = new EventEmitter<boolean>();
    @Output() confirmed = new EventEmitter<boolean>();
    message = '';

    ngOnInit(): void {

    }

    closeModal(): void {
        this.message = '';
        this.isActive = false;
        this.isActiveChange.emit(this.isActive);
    }

    confirm(): void {
        this.message = '';
        this.confirmed.emit();
        this.closeModal();
    }

    makeSharedToggle(): void {
        this.message = '';
        this.confirmed.emit(!this.item.shared);
    }

    copyUrl(input: HTMLInputElement): void {
        input.select();
        input.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(input.value);
        this.message = 'The URL has been successfully copied to the clipboard.';
    }
}
