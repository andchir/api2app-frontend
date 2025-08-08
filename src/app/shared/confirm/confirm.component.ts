import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-confirm',
    templateUrl: './confirm.component.html',
    styleUrls: []
})
export class ConfirmComponent implements OnInit {

    @Input() message = $localize `Are you sure you want to delete this item?`;
    @Input() type = 'confirm';
    @Input() isActive = false;
    @Input() isLargeFontSize = true;
    @Output() isActiveChange = new EventEmitter<boolean>();
    @Output() confirmed = new EventEmitter<void>();
    @Output() close: EventEmitter<string> = new EventEmitter<string>();

    ngOnInit(): void {

    }

    closeModal(reason: string = 'close'): void {
        this.isActive = false;
        this.isActiveChange.emit(this.isActive);
        this.close.emit(reason);
    }

    confirm(): void {
        this.confirmed.emit();
        this.closeModal('confirmed');
    }
}
