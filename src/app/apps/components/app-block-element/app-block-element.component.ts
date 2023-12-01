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
    @Output() selectAction: EventEmitter<void> = new EventEmitter<void>();
    @Output() delete: EventEmitter<void> = new EventEmitter<void>();

    inputTypes: {name: AppBlockElementType, title: string}[] = [
        {name: 'text-header', title: 'Text Header'},
        {name: 'text', title: 'Text'},
        {name: 'button', title: 'Button'},
        {name: 'input-text', title: 'Text Field'},
        {name: 'input-number', title: 'Number Field'},
        {name: 'input-textarea', title: 'Text Area'},
        {name: 'input-switch', title: 'Switch'},
        {name: 'input-select', title: 'Select'},
        {name: 'input-tags', title: 'Tags'},
        {name: 'input-radio', title: 'Radio Buttons'}
    ];

    constructor() {

    }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges) {

    }

    updateItemType(): void {
        this.typeChange.emit(this.type);
    }

    elementOptionsInit(event?: MouseEvent) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.showOptions.emit();
    }

    elementActionSelect(event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.selectAction.emit();
    }

    elementDeleteInit(): void {
        this.delete.emit();
    }

    numberIncrease(keyName = 'value', max?: number): void {
        this.options[keyName] = Number(this.options[keyName] || 0);
        if (typeof max === 'number' && this.options[keyName] >= max) {
            return;
        }
        this.options[keyName]++;
    }

    numberDecrease(keyName = 'value', min?: number): void {
        this.options[keyName] = Number(this.options[keyName] || 0);
        if (typeof min === 'number' && this.options[keyName] <= min) {
            return;
        }
        this.options[keyName]--;
    }
}
