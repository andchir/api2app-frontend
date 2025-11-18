import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, Inject, LOCALE_ID,
    OnDestroy,
    OnInit
} from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import {ActivatedRoute, Params, Router} from '@angular/router';

import { Subscription, takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';
import { DragulaService } from 'ng2-dragula';

import { ApplicationService } from '../../services/application.service';
import { AppBlock, AppBlockElement, AppBlockElementType } from '../models/app-block.interface';
import { AppActionComponent } from '../components/app-action/app-action.component';
import { ModalService } from '../../services/modal.service';
import { ApplicationSharedComponent } from '../app-shared/app-shared.component';
import { ApiService } from '../../services/api.service';
import { RouterEventsService } from '../../services/router-events.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { ElementOptions } from '../models/element-options';
import { RenameComponent } from '../../shared/rename/rename.component';
import { environment } from '../../../environments/environment';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { VkBridgeService } from '../../services/vk-bridge.service';
import { AuthService } from '../../services/auth.service';

const APP_NAME = environment.appName;

@Component({
    selector: 'app-application-create',
    templateUrl: './app-create.component.html',
    styleUrls: ['./app-create.component.css'],
    providers: [VkBridgeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationCreateComponent extends ApplicationSharedComponent implements OnInit, OnDestroy {

    override isShared = false;
    override previewMode = false;
    errorsObj: {[name: string]: string[]} = {};
    isOptionsActive = false;
    isSettingsActive = false;
    saving = false;
    itemId: number = 0;
    selectedElement: AppBlockElement;
    selectedBlock: AppBlock;
    files: {[key: string]: File} = {image: null};
    selectedElementIndex: number;
    selectedBlockIndex: number;
    isNotified: boolean = false;
    selectedItemOptionsFields: AppBlockElement[] = [];
    copiedElements: AppBlockElement[] = [];
    selectedElementsList: string[] = [];

    subs = new Subscription();

    newElementBlockIndex: number = -1;
    newElementType: string = null;
    inputTypes: {name: AppBlockElementType, title: string, icon: string}[] = [
        {name: 'text-header', title: $localize `Text Header`, icon: 'bi-type-h1'},
        {name: 'text', title: $localize `Text`, icon: 'bi-fonts'},
        {name: 'button', title: $localize `Button`, icon: 'bi-app'},
        {name: 'input-text', title: $localize `Text Field`, icon: 'bi-input-cursor-text'},
        {name: 'input-hidden', title: $localize `Hidden Text Field`, icon: 'bi-input-cursor'},
        {name: 'input-textarea', title: $localize `Text Area`, icon: 'bi-textarea-resize'},
        {name: 'input-number', title: $localize `Number Field`, icon: 'bi-1-square'},
        {name: 'input-slider', title: $localize `Range Slider`, icon: 'bi-sliders'},
        {name: 'input-switch', title: $localize `Switch`, icon: 'bi-toggle-off'},
        {name: 'input-select', title: $localize `Select`, icon: 'bi-menu-button'},
        {name: 'input-tags', title: $localize `Tags`, icon: 'bi-tag'},
        {name: 'input-radio', title: $localize `Radio Buttons`, icon: 'bi-ui-radios'},
        {name: 'input-color', title: $localize `Color Picker`, icon: 'bi-palette'},
        {name: 'input-date', title: $localize `Calendar`, icon: 'bi-calendar3'},
        {name: 'input-file', title: $localize `Upload File`, icon: 'bi-upload'},
        {name: 'image', title: $localize `Image`, icon: 'bi-image'},
        {name: 'audio', title: $localize `Audio`, icon: 'bi-music-note-beamed'},
        {name: 'video', title: $localize `Video`, icon: 'bi-play-btn'},
        {name: 'image-comparison', title: $localize `Image comparison`, icon: 'bi-vr'},
        {name: 'input-chart-line', title: $localize `Line Chart`, icon: 'bi-graph-up'},
        {name: 'input-pagination', title: $localize `Pagination`, icon: 'bi-segmented-nav'},
        {name: 'status', title: $localize `Status Indicator`, icon: 'bi-check-circle'},
        {name: 'progress', title: $localize `Progress Indicator`, icon: 'bi-percent'},
        {name: 'table', title: $localize `Table`, icon: 'bi-table'},
        {name: 'input-select-image', title: $localize `Select image`, icon: 'bi-ui-checks-grid'},
        {name: 'user-subscription', title: $localize `User subscription`, icon: 'bi-cart-check'}
        // {name: 'crop-image', title: $localize `Crop image`, icon: 'bi-crop'}
    ];

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        titleService: Title,
        cdr: ChangeDetectorRef,
        sanitizer: DomSanitizer,
        route: ActivatedRoute,
        router: Router,
        tokenStorageService: TokenStorageService,
        dataService: ApplicationService,
        apiService: ApiService,
        modalService: ModalService,
        routerEventsService: RouterEventsService,
        vkBridgeService: VkBridgeService,
        authService: AuthService,
        private dragulaService: DragulaService
    ) {
        super(cdr, titleService, sanitizer, route, router, tokenStorageService, dataService, apiService,
            modalService, routerEventsService, vkBridgeService, authService);
        dragulaService.createGroup('BLOCK_ELEMENTS', {
            removeOnSpill: false,
            moves: (el, container, handle) => {
                return handle.className.includes('app-element-drag-handle');
            },
            // accepts: (el, target, source, sibling) => {
            //     return target === source;
            // }
        });
        this.subs.add(dragulaService.drag('BLOCK_ELEMENTS')
            .subscribe((e) => {
                e.el.classList.add('shadow-lg', 'bg-white');
            })
        );
        this.subs.add(dragulaService.drop('BLOCK_ELEMENTS')
            .subscribe((e) => {
                this.message = $localize `The element has been moved`;
                this.messageType = 'success';
                e.el.classList.remove('shadow-lg', 'bg-white');
            })
        );
        this.subs.add(dragulaService.over('BLOCK_ELEMENTS')
            .subscribe((e) => {
                Array.from(e.container.querySelectorAll('.app-element-buttons')).forEach((el) => {
                    el.classList.add('hidden');
                });
            })
        );
        this.subs.add(dragulaService.out('BLOCK_ELEMENTS')
            .subscribe((e) => {
                e.el.classList.remove('shadow-lg', 'bg-white');
                Array.from(e.container.querySelectorAll('.app-element-buttons')).forEach((el) => {
                    el.classList.remove('hidden');
                });
            })
        );

        if (window.sessionStorage.getItem('app_elements_copied')) {
            this.copiedElements = JSON.parse(window.sessionStorage.getItem('app_elements_copied'));
        }
    }

    get optionsTitle(): string {
        return this.selectedElement
            ? $localize `Element Options`
            : $localize `Block Options`;
    }

    override ngOnInit(): void {
        this.isLoggedIn = !!this.tokenStorageService.getToken();
        this.itemId = Number(this.route.snapshot.paramMap.get('id'));
        if ((!this.data.tabs || this.data.tabs.length === 0) && !this.previewMode) {
            this.addTab();
        }
        if (this.itemId) {
            this.getData();
        }
        this.route.queryParams
            .pipe(takeUntil(this.destroyed$))
            .subscribe((params: Params) => {
                if (!params['tab']) {
                    return;
                }
                this.tabIndex = parseInt(params['tab']) - 1;
                this.cdr.detectChanges();
            });
    }

    override getData(): void {
        this.dataService.getItem(this.itemId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.loading = false;
                    this.data.blocks.forEach((block, blockIndex) => {
                        if (typeof block.tabIndex === 'undefined') {
                            block.tabIndex = 0;
                        }
                        if (typeof block.options.showLoading === 'undefined') {
                            block.options.showLoading = true;
                        }
                    });
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
            return emptyElements.length === item.elements.length && (item.tabIndex === -1 || item.tabIndex === this.tabIndex);
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
        const newBlock = Object.assign({}, ApplicationService.getBlockDefaults(), {tabIndex: -1});
        this.data.blocks.push(newBlock);
        emptyItems = this.findEmptyBlocks();
        if (emptyItems.length < gridColumns) {
            this.addEmptyBlockByGrid();
        }
        if ((!this.data.tabs || this.data.tabs.length === 0) && !this.previewMode) {
            this.addTab();
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

    onNewElementTypeSelected(type: AppBlockElementType, blockIndex: number): void {
        const block = this.data.blocks[blockIndex];
        const newElement = block.elements.find((elem) => {
            return elem.type === null;
        });
        if (!newElement) {
            return;
        }
        newElement.type = type;
        this.onElementUpdate(newElement, type);

        this.newElementBlockIndex = -1;
        this.newElementType = null;
        this.cdr.markForCheck();
    }

    blockAddElement(blockIndex: number): void {
        const block = this.data.blocks[blockIndex];
        const emptyElements = this.findEmptyElements(block);
        if (emptyElements.length > 0) {
            return;
        }
        block.tabIndex = this.tabIndex;

        block.elements.push({type: null});
        this.newElementBlockIndex = blockIndex;
        this.newElementType = null;

        this.deleteEmptyElements(block);
        this.deleteEmptyBlockByGrid();
        this.addEmptyBlockByGrid();
        this.cdr.markForCheck();
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
            Object.assign(element, ElementOptions.getBlockElementDefault(type));
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
        element.blockIndex = blockIndex;
        this.selectedItemOptionsFields = ElementOptions.createElementOptionsFields(element.type, element);
        this.isOptionsActive = true;
        this.cdr.detectChanges();
    }

    showBlockOptions(block: AppBlock, index: number, event?: MouseEvent): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (!block.options) {
            block.options = ApplicationService.getBlockOptionsDefaults();
        }
        this.selectedBlockIndex = index;
        this.selectedItemOptionsFields = ApplicationService.createBlockOptionsFields(block.options, index, this.tabIndex);
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
            let newItemIndex = this.selectedElement.orderIndex;
            if (this.selectedElement.orderIndex !== this.selectedElementIndex) {
                newItemIndex = this.updateElementOrder(this.selectedElementIndex, this.selectedElement.orderIndex, this.selectedBlockIndex);
            }
            if (this.selectedElement.type === 'input-pagination') {
                this.selectedElement.value = this.selectedElement.useAsOffset ? 0 : 1;
            }
            if (this.selectedElement.blockIndex !== this.selectedBlockIndex) {
                this.moveElementToBlock(newItemIndex, this.selectedBlockIndex, this.selectedElement.blockIndex);
            }
        }
        if (this.selectedBlock) {
            const options = ApplicationService.fieldsToOptionsObject(this.selectedItemOptionsFields);
            let newTabIndex = parseInt(options.tabIndex || '0');
            delete options.tabIndex;
            if (newTabIndex > this.data.tabs.length - 1) {
                newTabIndex = this.data.tabs.length - 1;
            }
            if (this.selectedBlock.tabIndex !== newTabIndex) {
                this.selectedBlock.tabIndex = newTabIndex;
                this.tabIndex = newTabIndex;
            }
            Object.assign(this.selectedBlock.options, options);
            if (this.selectedBlock?.options?.orderIndex !== this.selectedBlockIndex) {
                this.updateBlockIndex(this.selectedBlockIndex, this.selectedBlock?.options?.orderIndex);
            }
        }
        this.selectedItemOptionsFields = [];
        this.selectedElement = null;
        this.selectedBlock = null;
        this.isOptionsActive = false;
        this.cdr.detectChanges();
    }

    updateElementOrder(currentIndex: number, newIndex: number, blockIndex: number): number {
        const currentBlock = this.data.blocks[blockIndex] || null;
        if (!currentBlock) {
            return currentIndex;
        }
        const elements = currentBlock.elements;
        newIndex = Math.max(0, newIndex);
        if (newIndex > elements.length - 1) {
            newIndex = elements.length - 1;
        }
        if (currentIndex === newIndex) {
            return currentIndex;
        }
        const deletedItems = elements.splice(currentIndex, 1);
        elements.splice(newIndex, 0, deletedItems[0]);
        return newIndex;
    }

    moveElementToBlock(currentIndex: number, blockIndex: number, targetBlockIndex: number): number {
        if (blockIndex === targetBlockIndex) {
            return currentIndex;
        }
        const currentBlock = this.data.blocks[blockIndex] || null;
        const targetBlock = this.data.blocks[targetBlockIndex] || null;
        if (!currentBlock || !targetBlock) {
            return currentIndex;
        }
        const element = currentBlock.elements[currentIndex] || null;
        if (!element) {
            return currentIndex;
        }
        const deletedItems = currentBlock.elements.splice(currentIndex, 1);
        let newIndex = Math.max(0, currentIndex);
        if (newIndex > targetBlock.elements.length - 1) {
            newIndex = targetBlock.elements.length - 1;
        }
        targetBlock.elements.splice(newIndex, 0, deletedItems[0]);
        return newIndex;
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

    cloneBlock(block: AppBlock): AppBlock {
        const tabIndex = block.tabIndex || 0;
        const options = Object.assign({}, block.options);
        const elements = block.elements.map(obj => ({...obj}));
        elements.forEach((element: AppBlockElement) => {
            element.options = Object.assign({}, element.options);
        });
        return {tabIndex, elements, options};
    }

    appPreview(): void {
        this.message = '';
        if (!this.data.shared) {
            this.messageType = 'error';
            this.message = $localize `The application must be published (can be hidden).`;
            return;
        }
        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        const url = `${baseUrl}/${this.data.language}/apps/shared/${this.data.uuid}`;
        window.open(url, '_blank').focus();
    }

    appSettingsToggle(): void {
        this.isSettingsActive = !this.isSettingsActive;
    }

    editItemAI(): void {

    }

    cloneItem(): void {
        const initialData = {
            message: $localize `Are you sure you want to clone this application?`,
            isActive: true
        };
        this.modalService.showDynamicComponent(this.viewRef, ConfirmComponent, initialData)
            .pipe(take(1))
            .subscribe({
                next: (reason) => {
                    if (reason === 'confirmed') {
                        this.loading = true;
                        this.dataService.cloneItem(this.data.uuid)
                            .pipe(takeUntil(this.destroyed$))
                            .subscribe({
                                next: (res) => {
                                    this.router.navigate(['apps', 'personal']);
                                    this.cdr.detectChanges();
                                },
                                error: (err) => {
                                    if (err.detail) {
                                        this.message = err.detail;
                                        this.messageType = 'error';
                                    }
                                    this.loading = false;
                                    this.saving = true;
                                    this.cdr.detectChanges();
                                }
                            });
                    }
                }
            });
    }

    override findButtonElement(targetApiUuid: string, blockIndex?: number): AppBlockElement {
        if (!targetApiUuid) {
            return null;
        }
        const buttons = [];
        this.data.blocks.forEach((block, index) => {
            if (typeof blockIndex === 'number' && blockIndex !== index) {
                return;
            }
            block.elements.forEach((element) => {
                if (element.options?.inputApiUuid === targetApiUuid && element.type === 'button') {
                    buttons.push(element);
                }
            });
        });
        return buttons.length > 0 ? buttons[0] : null;
    }

    validateData(): boolean {
        // Elements with an input action selected, but no button
        const elementsOrphan = [];
        this.data.blocks.forEach((block) => {
            block.elements.forEach((element) => {
                if (!element.options?.inputApiUuid) {
                    return;
                }
                const inputApiUuid = element.options?.inputApiUuid;
                const buttonElement = this.findButtonElement(inputApiUuid);
                if (!buttonElement) {
                    elementsOrphan.push(element);
                }
            });
        });

        if (elementsOrphan.length > 0 && !this.isNotified) {
            const initialData = {
                message: $localize `You have selected an input action for the element, but have not added a button to submit the data to the API. In this case, the API will be called automatically when the element receives a value. Are you sure you want to continue?`,
                isLargeFontSize: false,
                isActive: true
            };
            this.modalService.showDynamicComponent(this.viewRef, ConfirmComponent, initialData)
                .pipe(take(1))
                .subscribe({
                    next: (reason) => {
                        if (reason === 'confirmed') {
                            this.isNotified = true;
                            this.saveData(true);
                        }
                    }
                });
            return false;
        }
        return true;
    }

    saveData(confirmed = false): void {
        if (!this.data.name) {
            this.messageType = 'error';
            this.message = $localize `Enter Application Name`;
            return;
        }

        if (!this.validateData() && !confirmed) {
            return;
        }

        const data = Object.assign({}, this.data, {language: this.locale});
        data.shared = data.shared || false;
        data.hidden = data.hidden || false;
        let blocks = data.blocks.map(obj => (this.cloneBlock(obj)));
        blocks = blocks.filter((block) => {
            const emptyElements = this.findEmptyElements(block);
            block.elements = block.elements.filter((el) => {
                return el.type;
            });
            return block.elements.length > emptyElements.length;
        });
        blocks.forEach((block) => {
            block.elements.forEach((element) => {
                if (element.type === 'input-date' && element.useDefault) {
                    element.value = null;
                }
                if (element.options.outputApiUuid && element.options.outputApiFieldName) {
                    // element.value = null;
                    element.valueObj = null;
                    element.valueArr = null;
                }
            });
        });
        data.blocks = blocks;
        this.message = '';
        this.errorsObj = {};
        this.loading = true;
        this.saving = true;
        this.cdr.detectChanges();

        // if (data.id) {
        //     delete data.shared;
        //     delete data.hidden;
        // }

        const formData = this.dataService.creteFormData(data, this.files);
        const itemId = data.id || 0;

        this.dataService.updateItem(formData, itemId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.itemId = res.id;
                    this.data.id = this.itemId;
                    this.loading = false;
                    this.saving = false;
                    this.message = $localize `Saved successfully.`;
                    this.messageType = 'success';
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.errorsObj = err;
                    this.message = $localize `Please correct the errors.`;
                    this.messageType = 'error';
                    this.loading = false;
                    this.saving = false;
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
            note: element.note || '',
            actionType
        };
        if (!initialData.selectedUuid) {
            const index = this.data.blocks[blockIndex].elements.findLastIndex((item) => {
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
                            element.options.inputApiUuid = this.modalService.content.selectedFieldName !== null
                                ? this.modalService.content.selectedApi?.uuid
                                : null;
                            element.options.inputApiFieldName = this.modalService.content.selectedFieldName;
                            element.options.inputApiFieldType = this.modalService.content.selectedFieldType;
                        } else {
                            element.options.outputApiUuid = this.modalService.content.selectedFieldName !== null
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
            this.data.blocks.forEach((block) => {
                this.clearElementsValues(block);
            });
            this.cdr.detectChanges();
            return;
        }
        this.createAppOptions();
        if ((!this.data.tabs || this.data.tabs.length === 0) && !this.previewMode) {
            this.addTab();
        }
    }

    addTab(tabNumber: number = -1): void {
        if (!this.data.tabs) {
            this.data.tabs = [];
        }
        if (tabNumber === -1) {
            this.addTab(this.data.tabs.length + 1);
            return;
        }
        const tabName = ($localize `Tab`) + ' ' + tabNumber;
        if (this.data.tabs.find(name => name === tabName)) {
            this.addTab(tabNumber + 1);
            return;
        }
        this.data.tabs.push(tabName);
    }

    removeTab(): void {
        if (!this.data?.tabs || this.data?.tabs.length <= 1) {
            return;
        }
        const tabIndex = this.tabIndex;
        const blocks = this.data.blocks.filter((block) => {
            return block.tabIndex >= tabIndex;
        });
        this.data?.tabs.splice(this.tabIndex, 1);
        blocks.forEach((block) => {
            if (block.tabIndex > 0) {
                block.tabIndex--;
            }
            if (block.tabIndex > this.data?.tabs.length - 1) {
                block.tabIndex--;
            }
        });
        if (this.data?.tabs.length - 1 < this.tabIndex) {
            this.switchTab(this.tabIndex - 1);
        }
    }

    editTab(): void {
        if (!this.data.tabs[this.tabIndex]) {
            return;
        }
        const initialData = {
            currentValue: this.data.tabs[this.tabIndex]
        };
        this.modalService.showDynamicComponent(this.viewRef, RenameComponent, initialData)
            .pipe(take(1))
            .subscribe({
                next: (reason) => {
                    if (reason === 'submit') {
                        this.data.tabs[this.tabIndex] = this.modalService.content.currentValue;
                    }
                }
            });
    }

    onElementSelected(value: string): void {
        this.selectedElementsList.push(value);
    }

    onElementUnSelected(value: string): void {
        const index = this.selectedElementsList.indexOf(value);
        if (index === -1) {
            return;
        }
        this.selectedElementsList.splice(index, 1);
    }

    onActionSelected(event: Event): void {
        const selectEl = event.target as HTMLInputElement;
        const action = selectEl.value;
        selectEl.value = '';
        this.messageType = 'success';

        const selectedData = [];
        this.selectedElementsList.forEach(value => {
            const tmp = value.split('-');
            const blockIndex = parseInt(tmp[0], 10);
            const elementIndex = parseInt(tmp[1], 10);
            if (!this.data.blocks[blockIndex]) {
                return;
            }
            if (!selectedData[blockIndex]) {
                selectedData[blockIndex] = [];
            }
            selectedData[blockIndex].push(elementIndex);
        });

        switch (action) {
            case 'copy':
            case 'cut':
                this.copiedElements = [];
                selectedData.forEach((ids, blockIndex) => {
                    if (!this.data.blocks[blockIndex]) {
                        return;
                    }
                    const block = this.data.blocks[blockIndex];
                    this.copiedElements = [...this.copiedElements, ...block.elements.filter((_, index) => ids.includes(index))];
                    this.copiedElements = JSON.parse(JSON.stringify(this.copiedElements));
                    if (action === 'cut') {
                        ApplicationService.deleteBlockElementsByIndexArr(block, ids);
                    }
                });
                window.sessionStorage.setItem('app_elements_copied', JSON.stringify(this.copiedElements));
                if (action === 'copy') {
                    this.message = $localize `:@@elementsCopiedSuccess:Selected elements successfully copied to clipboard.`;
                } else if (action === 'cut') {
                    this.message = $localize `:@@elementsCutSuccess:Selected elements successfully cut to clipboard.`;
                }
                break;
            case 'paste_before':
            case 'paste_after':
                const tmp = this.selectedElementsList[0].split('-');
                const blockIndex = parseInt(tmp[0], 10);
                const elementIndex = parseInt(tmp[1], 10);
                const block = this.data.blocks[blockIndex];
                if (!block || this.copiedElements.length === 0) {
                    return;
                }
                this.copiedElements.forEach(element => {
                    element.options = {};
                });
                block.elements.splice((action === 'paste_before' ? elementIndex : elementIndex + 1), 0, ...this.copiedElements);
                break;
        }
        // Clear selection
        this.selectedElementsList = [];
        Array.from(document.querySelectorAll('.element-select-checkbox')).forEach(element => {
            (element as HTMLInputElement).checked = false;
        });
        this.cdr.detectChanges();
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.subs.unsubscribe();
        this.dragulaService.destroy('BLOCK_ELEMENTS');
    }
}
