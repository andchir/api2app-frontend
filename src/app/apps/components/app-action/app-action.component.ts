import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiItem } from '../../../apis/models/api-item.interface';

@Component({
    selector: 'app-element-action',
    templateUrl: './app-action.component.html'
})
export class AppActionComponent implements OnInit {

    @Input() customData: any;
    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    apisList: ApiItem[] = [];
    selectedApi: ApiItem;

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
