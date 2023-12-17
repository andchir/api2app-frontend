import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-share-item',
    templateUrl: './share-item.component.html',
})
export class ShareItemComponent {

    @Input() title: string = 'Share Item';
    @Input() loading: boolean = false;
    @Input() isActive: boolean = false;
    @Input() isShared: boolean = false;
    @Input() isHidden: boolean = false;
    @Input() readOnly: boolean = false;
    @Input() itemUuid: string = '';
    @Input() shareUrl: string = 'https://example.com/item/shared/';
    @Output() isActiveChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() isSharedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() isHiddenChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() confirmed: EventEmitter<boolean> = new EventEmitter<boolean>();
    message = '';

    closeModal(): void {
        this.message = '';
        this.isActive = false;
        this.isActiveChange.emit(this.isActive);
    }

    onChangeHidden(): void {
        this.isHidden = !this.isHidden;
        this.isHiddenChange.emit(this.isHidden);
    }

    makeSharedToggle(): void {
        this.message = '';
        this.confirmed.emit(!this.isShared);
    }

    copyUrl(input: HTMLInputElement): void {
        input.select();
        input.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(input.value);
        this.message = 'The URL has been successfully copied to the clipboard.';
    }
}
