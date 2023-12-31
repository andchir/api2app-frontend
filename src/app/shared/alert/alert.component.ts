import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: []
})
export class AlertComponent implements OnInit {

    @Input() message = '';
    @Input() type = 'error';
    @Input() closable = true;
    @Input() position = 'fixed';
    @Output() messageChange: EventEmitter<string> = new EventEmitter();

    ngOnInit(): void {

    }

    clearMessage(): void {
        this.message = '';
        this.messageChange.emit('');
    }
}
