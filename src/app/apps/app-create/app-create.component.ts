import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { ApplicationItem } from '../models/application-item.interface';
import { ApplicationService } from '../../services/application.service';
import { AppBlock, AppBlockElement, AppBlockElementType } from '../models/app-block.interface';

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
        {elements: []},
        {elements: []},
        {elements: []}
    ];
    selectedElement: AppBlockElement;
    selectedElementOptionsFields: AppBlockElement[] = [];
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
            return ['empty', null].includes(item.type);
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
        this.blocks.push({elements: []});
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
        block.elements.push({type: null});
        this.deleteEmptyElements(block);
        this.deleteEmptyBlockByGrid();
        this.addEmptyBlockByGrid();
    }

    deleteEmptyElements(blockCurrent?: AppBlock): void {
        this.blocks.forEach((block) => {
            if (block !== blockCurrent) {
                block.elements.forEach((element, index, object) => {
                    if (['empty', null].includes(element.type)) {
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
        if (!element.name) {
            Object.assign(element, ApplicationService.getBlockElementDefault(type));
        }
        element.type = type;
        console.log('onElementUpdate', type, element);
    }

    showOptions(element: AppBlockElement): void {
        this.selectedElement = element;
        this.selectedElementOptionsFields = ApplicationService.createElementOptionsFields(element.type, element);
        this.isOptionsActive = true;
    }

    deleteElement(block: AppBlock, elementIndex: number): void {
        if (block.elements.length === 0) {
            return;
        }
        block.elements.splice(elementIndex, 1);
    }

    updateElementOptions(): void {
        if (!this.selectedElement) {
            return;
        }
        Object.assign(this.selectedElement, ApplicationService.fieldsToOptionsObject(this.selectedElementOptionsFields));
        this.isOptionsActive = false;
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
