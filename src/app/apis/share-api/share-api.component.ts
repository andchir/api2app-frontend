import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-share-api',
    templateUrl: './share-api.component.html',
    styleUrls: ['./share-api.component.scss']
})
export class ShareApiComponent implements OnInit {

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
