import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppBlockElement } from '../models/app-block.interface';

@Component({
    selector: 'app-block-element',
    templateUrl: './app-block-element.component.html',
    styleUrls: [],
    providers: []
})
export class AppBlockElementComponent implements OnInit, OnChanges {

    @Input() item: AppBlockElement;
    @Output() itemChange: EventEmitter<AppBlockElement> = new EventEmitter<AppBlockElement>();
    @Input() index: number;

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

    updateItemType(type?: string): void {
        console.log('updateItemType', this.item, this.index);
        // if (!type && this.item.type === 'empty') {
        //     this.item.type = 'select-type';
        // }
        // this.itemChange.emit(this.item);
    }

    elementOptionsInit(item: AppBlockElement, event?: MouseEvent) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        console.log('elementOptionsInit', item);
    }
}
