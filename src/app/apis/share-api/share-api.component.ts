import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiItem } from "../models/api-item.interface";

@Component({
    selector: 'app-share-api',
    templateUrl: './share-api.component.html',
    styleUrls: ['./share-api.component.scss']
})
export class ShareApiComponent implements OnInit {

    @Input() item: ApiItem;
    @Input() isActive = false;
    @Output() isActiveChange = new EventEmitter<boolean>();
    @Output() confirmed = new EventEmitter<boolean>();

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

    makeSharedToggle(): void {
        this.confirmed.emit(!this.item.shared);
    }
}
