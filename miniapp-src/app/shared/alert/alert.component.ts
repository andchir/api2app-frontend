import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: []
})
export class AlertComponent implements OnInit, OnChanges {

    @Input() message = '';
    @Input() delay = 3500;
    @Input() type = 'error';
    @Input() closable = true;
    @Input() position = 'fixed';
    @Output() messageChange: EventEmitter<string> = new EventEmitter();
    timer: any;

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['message']) {
            this.onMessageUpdated();
        }
    }

    onMessageUpdated(): void {
        if (!this.delay) {
            return;
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.clearMessage();
        }, this.delay);
    }

    clearMessage(): void {
        this.message = '';
        this.messageChange.emit('');
    }
}
