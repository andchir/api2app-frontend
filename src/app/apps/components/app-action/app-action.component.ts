import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-element-action',
    templateUrl: './app-action.component.html'
})
export class AppActionComponent implements OnInit {

    @Input() customData: any;
    @Output() close: EventEmitter<string> = new EventEmitter<string>();

    constructor() {

    }

    ngOnInit(): void {
        console.log('AppActionComponent INIT', this.customData);
    }

    submit(): void {
        this.close.emit('submit');
    }

    closeModal(): void {
        this.close.emit('close');
    }
}
