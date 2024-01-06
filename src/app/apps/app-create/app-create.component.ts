import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';

import { ApplicationService } from '../../services/application.service';
import { AppBlock, AppBlockElement, AppBlockElementType } from '../models/app-block.interface';
import { AppActionComponent } from '../components/app-action/app-action.component';
import { ModalService } from '../../services/modal.service';
import { ApplicationSharedComponent } from '../app-shared/app-shared.component';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-application-create',
    templateUrl: './app-create.component.html',
    styleUrls: ['./app-create.component.css'],
    providers: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationCreateComponent extends ApplicationSharedComponent implements OnInit, OnDestroy {

    @ViewChild('dynamic', { read: ViewContainerRef })
    private viewRef: ViewContainerRef;

    override previewMode = false;
    errorsObj: {[name: string]: string[]} = {};
    isOptionsActive = false;
    saving = false;
    itemId: number = 0;
    selectedElement: AppBlockElement;
    selectedBlock: AppBlock;
    selectedElementIndex: number;
    selectedBlockIndex: number;
    selectedItemOptionsFields: AppBlockElement[] = [];

    constructor(
        cdr: ChangeDetectorRef,
        sanitizer: DomSanitizer,
        route: ActivatedRoute,
        router: Router,
        dataService: ApplicationService,
        apiService: ApiService,
        modalService: ModalService
    ) {
        super(cdr, sanitizer, route, router, dataService, apiService, modalService);
    }

    get optionsTitle(): string {
        return this.selectedElement
            ? $localize `Element Options`
            : $localize `Block Options`;
    }

    override ngOnInit(): void {
        this.itemId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.itemId) {
            this.getData();
        }
    }

    override getData(): void {
        this.dataService.getItem(this.itemId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.loading = false;
                    this.addEmptyBlockByGrid();
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.errorsObj = err;
                    this.loading = false;
                }
            });
    }

    findEmptyBlocks(): AppBlock[] {
        return this.data.blocks.filter((item) => {
            const emptyElements = this.findEmptyElements(item);
            return emptyElements.length === item.elements.length;
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
        const index = this.data.blocks.findIndex((item) => {
            return item.elements.length === 0;
        });
        this.data.blocks.splice(index, 1);

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
        this.data.blocks.push(ApplicationService.getBlockDefaults());
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
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
    }

    deleteEmptyElements(blockCurrent?: AppBlock): void {
        this.data.blocks.forEach((block) => {
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
        this.deleteEmptyBlockByGrid();
        this.addEmptyBlockByGrid();
    }

    showElementOptions(element: AppBlockElement, blockIndex: number, elementIndex: number): void {
        this.selectedElementIndex = elementIndex;
        this.selectedBlockIndex = blockIndex;
        this.selectedElement = element;
        this.selectedBlock = null;
        element.orderIndex = elementIndex;
        this.selectedItemOptionsFields = ApplicationService.createElementOptionsFields(element.type, element);
        this.isOptionsActive = true;
        this.cdr.detectChanges();
    }

    showBlockOptions(block: AppBlock, index: number, event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (!block.options) {
            block.options = {};
        }
        this.selectedBlockIndex = index;
        this.selectedItemOptionsFields = ApplicationService.createBlockOptionsFields(block.options, index);
        this.selectedBlock = block;
        this.selectedElement = null;
        this.isOptionsActive = true;
        this.cdr.detectChanges();
    }

    deleteElement(block: AppBlock, elementIndex: number): void {
        if (block.elements.length === 0) {
            return;
        }
        block.elements.splice(elementIndex, 1);
        this.deleteEmptyBlockByGrid();
        this.addEmptyBlockByGrid();
        this.cdr.detectChanges();
    }

    updateItemOptions(): void {
        if (this.selectedElement) {
            Object.assign(this.selectedElement, ApplicationService.fieldsToOptionsObject(this.selectedItemOptionsFields));
            if (this.selectedElement.orderIndex !== this.selectedElementIndex) {
                this.updateElementOrder(this.selectedElementIndex, this.selectedElement.orderIndex, this.selectedBlockIndex);
            }
        }
        if (this.selectedBlock) {
            Object.assign(this.selectedBlock.options, ApplicationService.fieldsToOptionsObject(this.selectedItemOptionsFields));
            if (this.selectedBlock?.options?.orderIndex !== this.selectedBlockIndex) {
                this.updateBlockIndex(this.selectedBlockIndex, this.selectedBlock?.options?.orderIndex);
            }
        }
        this.selectedItemOptionsFields = [];
        this.selectedElement = null;
        this.selectedBlock = null;
        this.isOptionsActive = false;
    }

    updateElementOrder(currentIndex: number, nexIndex: number, blockIndex: number): void {
        const currentBlock = this.data.blocks[blockIndex] || null;
        if (!currentBlock) {
            return;
        }
        const elements = currentBlock.elements;
        if (nexIndex > elements.length - 1) {
            nexIndex = elements.length - 1;
        }
        if (currentIndex === nexIndex) {
            return;
        }
        const deletedItems = elements.splice(currentIndex, 1);
        elements.splice(nexIndex, 0, deletedItems[0]);
    }

    updateBlockIndex(currentIndex: number, nexIndex: number): void {
        const blocks = this.data.blocks;
        if (nexIndex > blocks.length - 1) {
            nexIndex = blocks.length - 1;
        }
        if (currentIndex === nexIndex) {
            return;
        }
        const deletedItems = blocks.splice(currentIndex, 1);
        blocks.splice(nexIndex, 0, deletedItems[0]);
    }

    saveData(): void {
        const data = Object.assign({}, this.data);
        data.blocks = this.data.blocks.filter((block) => {
            const emptyElements = this.findEmptyElements(block);
            return block.elements.length > emptyElements.length;
        });
        this.message = '';
        this.errorsObj = {};
        this.loading = true;
        this.saving = true;
        this.cdr.detectChanges();
        this.dataService.updateItem(data)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    this.saving = true;
                    this.message = $localize `Saved successfully.`;
                    this.messageType = 'success';
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.errorsObj = err;
                    this.message = $localize `Please correct the errors.`;
                    this.messageType = 'error';
                    this.loading = false;
                    this.saving = true;
                    this.cdr.detectChanges();
                }
            });
    }

    elementActionSelect(element: AppBlockElement, blockIndex: number, actionType: 'input'|'output' = 'input'): void {
        if (!element.options) {
            element.options = {};
        }
        const initialData = {
            selectedUuid: actionType === 'input' ? element.options?.inputApiUuid : element.options?.outputApiUuid,
            selectedFieldName: actionType === 'input' ? element.options?.inputApiFieldName : element.options?.outputApiFieldName,
            selectedFieldType: actionType === 'input' ? element.options?.inputApiFieldType : element.options?.outputApiFieldType,
            elementType: element.type,
            actionType
        };
        if (!initialData.selectedUuid) {
            const index = this.data.blocks[blockIndex].elements.findIndex((item) => {
                return actionType === 'input' ? item.options?.inputApiUuid : item.options?.outputApiUuid;
            });
            if (index > -1) {
                initialData.selectedUuid = actionType === 'input'
                    ? this.data.blocks[blockIndex].elements[index].options.inputApiUuid
                    : this.data.blocks[blockIndex].elements[index].options.outputApiUuid;
            }
        }
        this.modalService.showDynamicComponent(this.viewRef, AppActionComponent, initialData)
            .pipe(take(1))
            .subscribe({
                next: (reason) => {
                    if (reason === 'submit') {
                        if (actionType === 'input') {
                            element.options.inputApiUuid = this.modalService.content.selectedFieldName
                                ? this.modalService.content.selectedApi?.uuid
                                : null;
                            element.options.inputApiFieldName = this.modalService.content.selectedFieldName;
                            element.options.inputApiFieldType = this.modalService.content.selectedFieldType;
                        } else {
                            element.options.outputApiUuid = this.modalService.content.selectedFieldName
                                ? this.modalService.content.selectedApi?.uuid
                                : null;
                            element.options.outputApiFieldName = this.modalService.content.selectedFieldName;
                            element.options.outputApiFieldType = this.modalService.content.selectedFieldType;
                        }
                    }
                    this.cdr.detectChanges();
                }
            });
        this.cdr.detectChanges();
    }

    deleteErrorMessages(name: string) {
        if (this.errorsObj[name]) {
            delete this.errorsObj[name];
        }
        this.cdr.detectChanges();
    }

    onPreviewSwitch(): void {
        if (!this.previewMode) {
            return;
        }
        this.createAppOptions();
    }
}
