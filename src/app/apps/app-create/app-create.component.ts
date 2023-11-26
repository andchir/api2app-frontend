import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { ApplicationItem } from '../models/application-item.interface';
import { ApplicationService } from '../../services/application.service';
import {
    AppBlock,
    AppBlockElement,
    AppBlockElementOption,
    AppBlockElementType,
    AppOptions
} from '../models/app-block.interface';

@Component({
    selector: 'app-application-create',
    templateUrl: './app-create.component.html',
    styleUrls: ['./app-create.component.css'],
    providers: [ApiService]
})
export class ApplicationCreateComponent implements OnInit, OnDestroy {

    errors: {[name: string]: string[]} = {};
    message: string = '';
    messageType: 'error'|'success' = 'error';
    loading = false;
    submitted = false;
    isOptionsActive = false;

    itemId: number = 0;
    data: ApplicationItem = ApplicationService.getDefault();
    blocks: AppBlock[] = [
        {id: 0, elements: []},
        {id: 0, elements: []},
        {id: 0, elements: []}
    ];
    selectedElement: AppBlockElement;

    currentOptions: AppBlockElementOption[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'input-text',
            value: ''
        },
        {
            name: 'label',
            label: 'Label',
            type: 'input-text',
            value: ''
        },
        {
            name: 'defaultValue',
            label: 'Default Value',
            type: 'input-text',
            value: ''
        }
    ];
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected dataService: ApplicationService
    ) {

    }

    ngOnInit(): void {
        this.itemId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.itemId) {
            this.getData();
        }
    }

    findEmptyBlocks(): AppBlock[] {
        return this.blocks.filter((item) => {
            return item.elements.length === 0;
        });
    }

    findEmptyElements(block: AppBlock): AppBlockElement[] {
        return block.elements.filter((item) => {
            return ['empty', 'select-type'].includes(item.type);
        });
    }

    deleteEmptyBlockByGrid(): void {
        const gridColumns = this.data.gridColumns;
        let emptyItems = this.findEmptyBlocks();
        // console.log('deleteEmptyBlockByGrid', gridColumns, emptyItems.length);
        if (emptyItems.length <= gridColumns) {
            return;
        }
        const index = this.blocks.findIndex((item) => {
            return item.elements.length === 0;
        });
        this.blocks.splice(index, 1);

        emptyItems = this.findEmptyBlocks();
        if (emptyItems.length < gridColumns) {
            this.deleteEmptyBlockByGrid();
        }
    }

    addEmptyBlockByGrid(): void {
        const gridColumns = this.data.gridColumns;
        let emptyItems = this.findEmptyBlocks();
        // console.log('addEmptyBlockByGrid', gridColumns, emptyItems.length);
        if (emptyItems.length >= gridColumns) {
            return;
        }
        this.blocks.push({id: 0, elements: []});
        emptyItems = this.findEmptyBlocks();
        if (emptyItems.length < gridColumns) {
            this.addEmptyBlockByGrid();
        }
    }

    setValue(key: string, value: number): void {
        this.data[key] = value;
        if (key === 'gridColumns') {
            this.deleteEmptyElements();
            this.deleteEmptyBlockByGrid();
            this.addEmptyBlockByGrid();
        }
    }

    blockAddElement(block: AppBlock): void {
        const emptyElements = this.findEmptyElements(block);
        // console.log('blockAddElement', block, 'emptyElements:', emptyElements.length, emptyElements);
        if (emptyElements.length > 0) {
            return;
        }
        block.elements.push({
            id: 0,
            type: 'select-type'
        });
        this.deleteEmptyElements(block);
        this.deleteEmptyBlockByGrid();
        this.addEmptyBlockByGrid();
    }

    deleteEmptyElements(blockCurrent?: AppBlock): void {
        this.blocks.forEach((block) => {
            if (block !== blockCurrent) {
                block.elements.forEach((element, index, object) => {
                    if (['empty', 'select-type'].includes(element.type)) {
                        object.splice(index, 1);
                    }
                });
            }
        });
    }

    updateBlock(block: AppBlock, index?: number): void {
        // console.log('updateBlock', block, index);
        this.addEmptyBlockByGrid();
    }

    onElementUpdate(element: AppBlockElement, type: AppBlockElementType): void {
        if (!element.options) {
            element.fields = this.createElementOptionsFields(type);
            element.options = this.createElementOptionsObject(element.fields);
        }
        element.type = type;
        console.log('onElementUpdate', type, element);
    }

    showOptions(element: AppBlockElement): void {
        if (!element.options) {
            element.fields = this.createElementOptionsFields(element.type);
            element.options = this.createElementOptionsObject(element.fields);
        }
        this.selectedElement = element;
        console.log('showOptions', element);
        this.isOptionsActive = true;
    }

    createElementOptionsObject(fields: AppBlockElementOption[]): AppOptions {
        const output = {} as AppOptions;
        fields.forEach((item) => {
            output[item.name] = item.value;
        });
        return output;
    }

    createElementOptionsFields(type: AppBlockElementType, options?: any): AppBlockElementOption[] {
        if (!options) {
            options = {} as any;
        }
        const output = [] as AppBlockElementOption[];
        switch (type) {
            case 'text-header':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'header1',
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: 'Value',
                    type: 'input-text',
                    value: options?.value || 'Header Text',
                    choices: []
                });
                break;
            case 'text':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'text1',
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: 'Value',
                    type: 'input-text',
                    value: options?.value || 'Example Text',
                    choices: []
                });
                break;
            case 'button':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'submit',
                    choices: []
                });
                output.push({
                    name: 'text',
                    label: 'Text',
                    type: 'input-text',
                    value: options?.text || 'Submit',
                    choices: []
                });
                break;
            case 'input-text':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'name',
                    choices: []
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Text Field',
                    choices: []
                });
                output.push({
                    name: 'placeholder',
                    label: 'Placeholder',
                    type: 'input-text',
                    value: options?.placeholder || 'Enter your name',
                    choices: []
                });
                output.push({
                    name: 'defaultValue',
                    label: 'Default Value',
                    type: 'input-text',
                    value: options?.defaultValue || '',
                    choices: []
                });
                break;
            case 'input-textarea':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'content',
                    choices: []
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Content',
                    choices: []
                });
                output.push({
                    name: 'placeholder',
                    label: 'Placeholder',
                    type: 'input-text',
                    value: options?.placeholder || 'Enter your message here',
                    choices: []
                });
                output.push({
                    name: 'defaultValue',
                    label: 'Default Value',
                    type: 'input-text',
                    value: options?.defaultValue || '',
                    choices: []
                });
                break;
            case 'input-switch':
                output.push({
                    name: 'name',
                    label: 'Name',
                    type: 'input-text',
                    value: options?.name || 'enabled',
                    choices: []
                });
                output.push({
                    name: 'label',
                    label: 'Label',
                    type: 'input-text',
                    value: options?.label || 'Enabled',
                    choices: []
                });
                output.push({
                    name: 'value',
                    label: 'Value',
                    type: 'input-switch',
                    value: options?.value !== null,
                    choices: []
                });
                break;
        }
        return output;
    }

    deleteElement(block: AppBlock, elementIndex: number): void {
        if (block.elements.length === 0) {
            return;
        }
        block.elements.splice(elementIndex, 1);
    }

    getData(): void {
        // this.apiService.getItem(this.itemId)
        //     .pipe(takeUntil(this.destroyed$))
        //     .subscribe({
        //         next: (res) => {
        //             this.data = res;
        //             this.loading = false;
        //         },
        //         error: (err) => {
        //             this.errors = err;
        //             this.loading = false;
        //         }
        //     });
    }

    saveData(): void {
        // this.message = '';
        // this.errors = {};
        // this.loading = true;
        // this.submitted = true;
        // this.apiService.updateItem(this.data)
        //     .pipe(takeUntil(this.destroyed$))
        //     .subscribe({
        //         next: (res) => {
        //             this.loading = false;
        //             this.submitted = false;
        //             this.router.navigate(['/apis']);
        //         },
        //         error: (err) => {
        //             this.errors = err;
        //             this.message = 'Please correct the errors.';
        //             this.messageType = 'error';
        //             this.loading = false;
        //             this.submitted = false;
        //         }
        //     });
    }

    deleteErrorMessages(name: string) {
        if (this.errors[name]) {
            delete this.errors[name];
        }
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
