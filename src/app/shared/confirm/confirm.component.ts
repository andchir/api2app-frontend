import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-confirm',
    templateUrl: './confirm.component.html',
    styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {

    @Input() message = 'Are you sure you want to delete this item?';
    @Input() type = 'confirm';
    @Input() isActive = false;
    @Output() isActiveChange = new EventEmitter<boolean>();
    @Output() confirmed = new EventEmitter<void>();

    ngOnInit(): void {

    }

    closeModal(): void {
        this.isActive = false;
        this.isActiveChange.emit(this.isActive);
    }

    confirm(): void {
        this.confirmed.emit();
        this.closeModal();
    }
}
