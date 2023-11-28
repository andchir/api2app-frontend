import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import {AppBlockElement, AppBlockElementType} from '../../models/app-block.interface';

@Component({
    selector: 'app-block-element',
    templateUrl: './app-block-element.component.html',
    styleUrls: [],
    providers: []
})
export class AppBlockElementComponent implements OnInit, OnChanges {

    @Input() index: number = 0;
    @Input() parentIndex: number = 0;
    @Input() editorMode = false;
    @Input() type: AppBlockElementType;
    @Input() options: AppBlockElement;
    @Output() typeChange: EventEmitter<AppBlockElementType> = new EventEmitter<AppBlockElementType>();
    @Output() showOptions: EventEmitter<void> = new EventEmitter<void>();
    @Output() delete: EventEmitter<void> = new EventEmitter<void>();

    inputTypes: {name: string, title: string}[] = [
        {name: 'text-header', title: 'Text Header'},
        {name: 'text', title: 'Text'},
        {name: 'button', title: 'Button'},
        {name: 'input-text', title: 'Text Field'},
        {name: 'input-textarea', title: 'Text Area'},
        {name: 'input-switch', title: 'Switch'},
        {name: 'input-select', title: 'Select'},
        {name: 'input-radio', title: 'Radio Buttons'}
    ];

    constructor() {

    }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges) {

    }

    updateItemType(): void {
        console.log('updateItemType', this.type, this.index);
        if (this.type === 'empty') {
            this.type = null;
        }
        this.typeChange.emit(this.type);
    }

    elementOptionsInit(event?: MouseEvent) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.showOptions.emit();
    }

    elementDeleteInit(): void {
        this.delete.emit();
    }
}
