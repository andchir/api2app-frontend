import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-drawer',
    templateUrl: './drawer.component.html',
    styleUrls: []
})
export class DrawerComponent implements OnInit {

    @Input() title = 'Options';
    @Input() isActive = false;
    @Output() isActiveChange = new EventEmitter<boolean>();
    @Output() confirmed = new EventEmitter<void>();

    ngOnInit(): void {

    }

    close(): void {
        this.isActive = false;
        this.isActiveChange.emit(this.isActive);
    }

    confirm(): void {
        this.confirmed.emit();
    }
}
