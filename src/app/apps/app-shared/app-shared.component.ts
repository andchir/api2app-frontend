import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnDestroy,
    OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

import { take } from 'rxjs/operators';
import { firstValueFrom, retry, Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';
moment.locale('ru');
import { SseErrorEvent } from 'ngx-sse-client';

import { ApplicationService } from '../../services/application.service';
import { AppErrors, ApplicationItem } from '../models/application-item.interface';
import { AppBlock, AppBlockElement } from '../models/app-block.interface';
import { ApiService } from '../../services/api.service';
import { ApiItem } from '../../apis/models/api-item.interface';
import { ModalService } from '../../services/modal.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { RouterEventsService } from '../../services/router-events.service';
import { VkBridgeService } from '../../services/vk-bridge.service';
import { VkAppOptions } from '../models/vk-app-options.interface';
import { environment } from '../../../environments/environment';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { AppAdultValidationComponent } from '../components/app-adult-validation/app-adult-validation.component';
import { AuthService } from '../../services/auth.service';
import { ModalTopUpBalanceComponent } from '../modal-topup-balance/modal-topup-balance.component';

const APP_NAME = environment.appName;
declare const vkBridge: any;

@Component({
    selector: 'app-item-shared',
    templateUrl: './app-shared.component.html',
    providers: [VkBridgeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationSharedComponent implements OnInit, OnDestroy {

    @ViewChild('dynamic', { read: ViewContainerRef }) protected viewRef: ViewContainerRef;

    @Input('itemUuid') itemUuid: string;
    @Input('showHeader') showHeader: boolean = true;
    @Input('needBackButton') needBackButton: boolean|null = null;
    @Input('noBorder') noBorder: boolean = false;
    errors: AppErrors = {};
    message: string = '';
    messageType: 'error'|'success' = 'error';
    isLoggedIn: boolean = false;
    isShared: boolean = true;
    progressUpdating: boolean = false;
    loading: boolean = false;
    submitted: boolean = false;
    previewMode: boolean = true;
    maintenanceModalActive: boolean = false;
    windowScrolled: boolean = false;
    timerAutoStart: any;
    appsAutoStarted: string[] = [];
    appsAutoStartPending: string[] = [];
    userBalance: number = 0;

    apiItems: {input: ApiItem[], output: ApiItem[]} = {input: [], output: []};
    apiUuidsList: {input: string[], output: string[]} = {input: [], output: []};
    appElements: {
        input: {[uuid: string]: AppBlockElement[]},
        output: {[uuid: string]: AppBlockElement[]},
        buttons: {[uuid: string]:AppBlockElement[]}
    } = {input: {}, output: {}, buttons: {}};

    data: ApplicationItem = ApplicationService.getDefault();
    tabIndex: number = 0;
    destroyed$: Subject<void> = new Subject();

    // VK mini-app data
    // https://dev.vk.com/ru/bridge/VKWebAppGetLaunchParams
    isVkApp: boolean = false;
    vkAppOptions: VkAppOptions = {};

    constructor(
        protected cdr: ChangeDetectorRef,
        protected titleService: Title,
        protected sanitizer: DomSanitizer,
        protected route: ActivatedRoute,
        protected router: Router,
        protected tokenStorageService: TokenStorageService,
        protected dataService: ApplicationService,
        protected apiService: ApiService,
        protected modalService: ModalService,
        protected routerEventsService: RouterEventsService,
        protected vkBridgeService: VkBridgeService,
        protected authService: AuthService
    ) {}

    ngOnInit(): void {
        this.data.blocks = [];
        this.isLoggedIn = !!this.tokenStorageService.getToken();
        if (!this.itemUuid) {
            this.itemUuid = this.route.snapshot.paramMap.get('uuid');
        }
        if (this.needBackButton === null) {
            this.needBackButton = !!this.routerEventsService.getPreviousUrl();
        }
        if (this.itemUuid) {
            this.getData();
        }
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        this.windowScrolled = currentScroll > 100;
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    getData(): void {
        this.errors[this.itemUuid] = {};
        this.loading = true;
        this.dataService.getItemByUuidShared(this.itemUuid)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.data.blocks.forEach((block, blockIndex) => {
                        if (typeof block.options.showLoading === 'undefined') {
                            block.options.showLoading = true;
                        }
                    });
                    this.titleService.setTitle(`${this.data.name} - ${APP_NAME}`);
                    this.loading = false;
                    if (this.data.maintenance) {
                        this.maintenanceModalToggle();
                    } else {
                        this.createAppOptions();
                    }
                    this.subscriptionsElementsSync();
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.data.name = $localize `Page not found`;
                    this.errors[this.itemUuid] = err;
                    this.loading = false;
                }
            });
    }

    createAppOptions(): void {
        if (typeof vkBridge !== 'undefined' && window['isVKApp'] && !this.isVkApp) {
            this.isVkApp = true;
            this.vkAppInit();
        }
        if (this.data.adultsOnly && (
                !window.localStorage.getItem(`${this.data.uuid}-appUserDob`)
                || window.localStorage.getItem(`${this.data.uuid}-ageRestricted`)
            )
        ) {
            this.adultAppRestrict();
        }
        if (!this.data) {
            return;
        }
        const promises = [];
        this.data.blocks.forEach((block, blockIndex) => {
            if (typeof block.tabIndex === 'undefined') {
                block.tabIndex = 0;
            }
            block.elements.forEach((element) => {
                element.blockIndex = blockIndex;
                if (element.type === 'status' && window['isVKApp'] && element.statusCompletedTextForVK) {
                    element.statusCompletedText = element.statusCompletedTextForVK;
                }
                if (element.options?.inputApiUuid) {
                    if (element.type === 'button') {
                        if (!this.appElements.buttons[element.options.inputApiUuid]) {
                            this.appElements.buttons[element.options.inputApiUuid] = [];
                        }
                        this.appElements.buttons[element.options.inputApiUuid].push(element);
                    } else {
                        if (!this.appElements.input[element.options.inputApiUuid]) {
                            this.appElements.input[element.options.inputApiUuid] = [];
                        }
                        this.appElements.input[element.options.inputApiUuid].push(element);
                    }
                }
                if (element.options?.outputApiUuid) {
                    if (!this.appElements.output[element.options.outputApiUuid]) {
                        this.appElements.output[element.options.outputApiUuid] = [];
                    }
                    this.appElements.output[element.options.outputApiUuid].push(element);
                }
                if (element.options?.inputApiUuid && !this.apiUuidsList.input.includes(element.options.inputApiUuid)) {
                    this.apiUuidsList.input.push(element.options.inputApiUuid);
                }
                if (element.options?.outputApiUuid && !this.apiUuidsList.output.includes(element.options.outputApiUuid)) {
                    this.apiUuidsList.output.push(element.options.outputApiUuid);
                }
                if (element.type === 'input-select') {
                    element.value = element.value || null;
                }
                this.elementHiddenStateUpdate(element, block);
                promises.push(ApplicationService.applyLocalStoredValue(element));
            });
        });

        // API auto start
        if (!this.data.maintenance) {
            Promise.all(promises).then(() => {
                this.getApiList('output').then((items) => {
                    this.apiItems['output'] = items;
                    Object.keys(this.appElements.output).forEach((uuid) => {
                        if (!this.appElements.buttons[uuid]) {
                            this.appAutoStart(uuid, 'output', this.appElements.output[uuid][0]);
                        }
                    });
                    this.cdr.detectChanges();
                });
            });
        }

        // Get user balance
        if (this.data.paymentEnabled) {
            this.updateUserBalance();
        }
    }

    elementHiddenStateUpdate(element: AppBlockElement, block?: AppBlock): void {
        if (((!window['isVKApp'] && element.showOnlyInVK) ||['input-hidden'].includes(element.type)) && this.previewMode) {
            element.hidden = true;
            return;
        }
        if (element.hiddenByField && this.previewMode) {
            if (!block) {
                block = this.findBlock(element);
            }
            const hiddenByField = element.hiddenByField.includes('==') ? element.hiddenByField.split('==') : [element.hiddenByField];
            const targetElement = this.findElementByName(block, hiddenByField[0]);
            if (targetElement) {
                if (['input-switch'].includes(targetElement.type)) {
                    element.hidden = !targetElement.enabled;
                    return;
                } else if (hiddenByField.length > 1) {
                    element.hidden = targetElement.value == targetElement[1];
                    return;
                }
            }
        }
        if ((['text', 'text-header', 'status', 'progress', 'input-select-image', 'image', 'video', 'audio'].includes(element.type) || element.hiddenByDefault)
            && !element.value
            && !element.valueObj
            && !element.valueArr
            && this.previewMode) {
                element.hidden = true;
                return;
            }
        element.hidden = false;
    }

    switchTab(tabIndex: number): void {
        this.tabIndex = tabIndex;
        this.cdr.detectChanges();
    }

    appAutoStart(apiUuid: string, actionType: 'input'|'output' = 'output', currentElement: AppBlockElement): void {
        if (!this.appsAutoStarted.includes(apiUuid)) {
            this.appsAutoStarted.push(apiUuid);
        }
        this.appSubmit(this.data.uuid, apiUuid, actionType, currentElement, false);
    }

    getApiList(actionType: 'input'|'output' = 'output'): Promise<any> {
        const promises = [];
        this.apiUuidsList[actionType].forEach((uuid) => {
            const apiItem = (actionType === 'input' ? this.apiItems['output'] : this.apiItems['input'])
                .find((item) => {
                    return item.uuid === uuid;
                });
            if (apiItem) {
                promises.push(Promise.resolve(apiItem));
            } else if (!this.isShared && this.isLoggedIn) {
                promises.push(firstValueFrom(this.apiService.getItemByUuid(uuid)));
            } else {
                promises.push(firstValueFrom(this.apiService.getItemByUuidShared(uuid)));
            }
        });
        return Promise.all(promises);
    }

    appSubmit(appUuid: string, apiUuid: string, actionType: 'input'|'output', currentElement: AppBlockElement, showMessages = true): void {
        if (!apiUuid || !this.previewMode) {
            return;
        }
        this.message = '';
        this.loading = true;
        this.submitted = true;
        this.cdr.detectChanges();
        if (this.apiItems[actionType].length === 0 && this.apiUuidsList[actionType].length > 0) {
            this.getApiList(actionType).then((items) => {
                this.apiItems[actionType] = items;
                this.appSubmit(appUuid, apiUuid, actionType, currentElement, showMessages);
            });
            return;
        }

        const elements = this.findElements(apiUuid, 'input', currentElement, true);
        const blocks = this.findBlocksByElements(elements);
        const input_file = elements.find((elem) => {
            return ['input-file'].includes(elem.type) || (elem.type === 'image' && elem.useCropper);
        });

        if (this.isVkApp && input_file && this.vkAppOptions.userId && !this.vkAppOptions.userFileUploadUrl) {
            this.vkGetFileUploadUrl(() => {
                this.appSubmit(appUuid, apiUuid, 'input', currentElement, showMessages);
            });
            return;
        }

        if (!this.getIsValid(apiUuid, actionType, elements, showMessages)) {
            if (this.appsAutoStarted.includes(apiUuid)) {
                this.removeAutoStart(apiUuid);
            } else if (showMessages) {
                this.message = $localize `Please correct errors in filling out the form.`;
                this.messageType = 'error';
            }
            this.cdr.detectChanges();
            return;
        }
        const currentApi = this.apiItems[actionType].find((apiItem) => {
            return apiItem.uuid === apiUuid;
        });
        if (!currentApi) {
            this.loading = false;
            this.submitted = false;
            return;
        }
        if (currentElement?.type !== 'input-pagination') {
            this.clearPagination(apiUuid);
        }
        const apiItem = this.prepareApiItem(currentApi, actionType, elements);

        this.stateLoadingUpdate(blocks, true, false);
        let chunkIndex = 0;
        const outputElements = this.findElements(apiUuid, 'output', currentElement);

        this.apiService.apiRequest(appUuid, apiItem, false, this.vkAppOptions)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    if (res instanceof MessageEvent) {
                        if (res.type === 'error') {
                            const event = res as unknown as SseErrorEvent;
                            console.log(`ERROR: ${event.message}, STATUS: ${event.status}, STATUS TEXT: ${event.statusText}`);
                            this.message = this.localizeServerMessages(event.message);
                            this.messageType = 'error';
                            this.afterResponseCreated(blocks);
                        } else {
                            const data = (res as MessageEvent).data;
                            if (data === '[DONE]') {
                                outputElements.forEach((element, index) => {
                                    if (element.suffixText) {
                                        element.value += element.suffixText;
                                    }
                                });
                                this.afterResponseCreated(blocks);
                            } else {
                                if (chunkIndex === 0) {
                                    this.stateLoadingUpdate(blocks, false, showMessages && this.appsAutoStarted.length === 0 && !this.progressUpdating);
                                }
                                let dataObj = JSON.parse(data);
                                this.createAppChunkResponse(dataObj, outputElements, chunkIndex);
                                chunkIndex++;
                            }
                        }
                    } else if(res instanceof HttpResponse) {
                        if (this.appsAutoStarted.includes(apiUuid)) {
                            this.afterAutoStarted(apiUuid);
                        }

                        this.loading = false;
                        this.submitted = false;

                        this.stateLoadingUpdate(blocks, false, showMessages && this.appsAutoStarted.length === 0 && !this.progressUpdating);
                        this.createAppResponse(currentApi, res, currentElement);

                        this.progressUpdating = false;
                    }
                },
                error: (err) => {
                    // console.log('ERROR', err);
                    this.loading = false;
                    this.submitted = false;
                    this.progressUpdating = false;
                    if (err?.error instanceof Blob) {
                        this.createErrorMessage(currentApi, err.error);
                    } else {
                        this.messageType = 'error';
                        this.message = err.message || 'Error.';
                    }
                    this.onError(apiUuid);
                    this.stateLoadingUpdate(blocks, false, false);
                }
            });
    }

    removeAutoStart(apiUuid: string): void {
        if (this.appsAutoStarted.includes(apiUuid)) {
            const index = this.appsAutoStarted.indexOf(apiUuid);
            if (index > -1) {
                this.appsAutoStarted.splice(index, 1);
            }
        }
    }

    afterAutoStarted(apiUuid: string): void {
        this.removeAutoStart(apiUuid);
        // clearTimeout(this.timerAutoStart);
        // this.timerAutoStart = setTimeout(() => {
        //     // Re-launch the application if the fields did not pass validation the last time.
        //     this.appsAutoStartPending.forEach((uuid) => {
        //         this.appAutoStart(uuid);
        //     });
        //     this.appsAutoStarted = [];
        // }, 500);
    }

    getAllElements(): AppBlockElement[] {
        if (!this.data?.blocks) {
            return [];
        }
        return this.data.blocks.reduce(
            (accumulator, currentBlock) => {
                accumulator.push(...currentBlock.elements);
                return accumulator;
            }, []
        );
    }

    getBlocksElements(blocks: AppBlock[]): AppBlockElement [] {
        return blocks.reduce(
            (accumulator, currentBlock) => {
                accumulator.push(...currentBlock.elements);
                return accumulator;
            }, []
        );
    }

    findBlock(element: AppBlockElement): AppBlock {
        return this.data.blocks.find((block) => {
            const elem = block.elements.find((el) => {
                return el === element;
            });
            return !!elem;
        });
    }

    findBlocksByElements(elements: AppBlockElement[]): AppBlock[] {
        const blockIndexArr = [];
        const blocks: AppBlock[] = [];
        elements.forEach((elem) => {
            if (!blockIndexArr.includes(elem.blockIndex)) {
                blockIndexArr.push(elem.blockIndex);
                blocks.push(this.data.blocks[elem.blockIndex]);
            }
        });
        return blocks;
    }

    findElementByName(block: AppBlock, elementName: string): AppBlockElement {
        return block.elements.find((element) => {
            return element.name === elementName;
        });
    }

    findBlockElementByName(elementName: string): AppBlockElement {
        if (!elementName) {
            return null;
        }
        let resultElement = null;
        for (const block of this.data.blocks) {
            if (resultElement) {
                break;
            }
            resultElement = block.elements.find((element) => {
                return element.name === elementName;
            });
        }
        return resultElement;
    }

    findButtonElement(targetApiUuid: string, blockIndex?: number): AppBlockElement {
        const buttons = this.appElements.buttons[targetApiUuid] || [];
        if (typeof blockIndex !== 'undefined') {
            return buttons.find((element: AppBlockElement) => {
                return element.blockIndex === blockIndex;
            });
        }
        return buttons.length > 0 ? buttons[0] : null;
    }

    findElements(targetApiUuid: string, actionType: 'input'|'output', currentElement: AppBlockElement, includeCurrent: boolean = false): AppBlockElement[] {
        const blockIndex = currentElement.blockIndex;
        const elements = this.appElements[actionType][targetApiUuid]
            ? this.appElements[actionType][targetApiUuid].filter((element: AppBlockElement) => {
                if (element.blockIndex === blockIndex) {
                    return true;
                }
                const currentButton = this.findButtonElement(targetApiUuid, element.blockIndex);
                return !currentButton;
            }) : [];
        if (includeCurrent) {
            elements.push(currentElement);
        }
        return elements;
    }

    clearValidationErrors(): void {
        Object.keys(this.errors).forEach((apiUuid) => {
            this.errors[apiUuid] = {};
        });
    }

    getIsValid(targetApiUuid: string, actionType: 'input'|'output', elements: AppBlockElement[], createErrorMessages = true): boolean {
        this.clearValidationErrors();
        const errors = {};
        elements.forEach((element) => {
            const {apiUuid, fieldName, fieldType} = this.getElementOptions(element, 'input');
            if (apiUuid !== targetApiUuid || (!element.required && !['input-hidden', 'input-chart-line', 'image'].includes(element.type))) {
                return;
            }
            if (!element.value || (Array.isArray(element.value) && element.value.length === 0)) {
                if (element.valueFrom) {
                    const targetElement = this.findBlockElementByName(element.valueFrom);
                    if (targetElement && targetElement.value) {
                        return;
                    }
                }
                errors[element.name] = element.label
                    ? element.label.replace(':', '') + ' - ' + ($localize `required`)
                    : $localize `This field is required.`;
            }
        });
        if (createErrorMessages) {
            this.errors[targetApiUuid] = errors;
        }
        return Object.keys(errors).length === 0;
    }

    stateLoadingUpdate(blocks: AppBlock[], loading: boolean, showMessage = true, clearBlock = false): void {
        blocks.forEach((block) => {
            if (!loading && showMessage) {
                if (block.options?.messageSuccess) {
                    this.message = block.options.messageSuccess;
                    this.messageType = 'success';
                }
            }
            if ((showMessage && block.options?.autoClear) || clearBlock) {
                this.clearElementsValues(block);
            }
            if (block.options?.showLoading && !this.progressUpdating) {
                block.loading = loading;
            }
        });
        this.cdr.detectChanges();
    }

    onError(apiUuid: string, updateHiddenValue = true): void {
        // console.log('onError', apiUuid);
        const currentApiUuid = apiUuid;
        const blocks = this.data.blocks.filter((item) => {
            const elements = item.elements.filter((el) => {
                return el?.options?.outputApiUuid == apiUuid;
            });
            return elements.length > 0;
        });
        blocks.forEach((block) => {
            block.elements.filter((el) => {
                return el.type === 'status';
            }).forEach((element) => {
                if (element?.options?.outputApiUuid !== currentApiUuid) {
                    element.value = null;
                    if (updateHiddenValue) {
                        this.elementHiddenStateUpdate(element);
                    }
                    return;
                }
                element.value = element?.statusError;
                if (updateHiddenValue) {
                    this.elementHiddenStateUpdate(element);
                }
            });
        });
    }

    clearAllValues(): void {
        const initialData = {
            message: $localize `Are you sure you want to reset all values?`,
            isActive: true
        };
        this.modalService.showDynamicComponent(this.viewRef, ConfirmComponent, initialData)
            .pipe(take(1))
            .subscribe({
                next: (reason) => {
                    if (reason === 'confirmed') {
                        this.data.blocks.forEach((block) => {
                            this.clearElementsValues(block, true, true);
                        });
                        this.message = $localize `All values have been cleared successfully.`;
                        this.messageType = 'success';
                    }
                }
            });
    }

    clearElementsValues(block: AppBlock, updateHiddenValue = true, clearStored = false): void {
        block.elements.forEach((element) => {
            this.clearElementValue(element, updateHiddenValue, clearStored);
        });
    }

    clearElementValue(element: AppBlockElement, updateHiddenValue = true, clearStored = false): void {
        const inputApiUuid = element.options?.inputApiUuid;
        const outputApiUuid = element.options?.outputApiUuid;
        if (!inputApiUuid && !outputApiUuid && !element.loadValueInto) {
            if (updateHiddenValue) {
                this.elementHiddenStateUpdate(element);
            }
            return;
        }
        if (['input-file'].includes(element.type)) {
            element.value = [];
        } else if (['input-text', 'input-textarea', 'input-radio', 'image', 'video', 'audio', 'button',
                'status', 'input-hidden'].includes(element.type)
            && (!element['storeValue'] || clearStored)) {
            element.value = null;
            element.valueArr = null;
            element.valueObj = null;
        }
        if (updateHiddenValue) {
            this.elementHiddenStateUpdate(element);
        }
        if (clearStored) {
            ApplicationService.localStoreValueClear(element);
        }
    }

    prepareApiItem(inputApiItem: ApiItem, actionType: 'input'|'output' = 'input', currentElements: AppBlockElement[]): ApiItem {
        const apiItem = Object.assign({}, inputApiItem);

        // Body data
        if (apiItem.requestContentType === 'json' && apiItem.bodyFields) {
            if (!apiItem.bodyFields) {
                apiItem.bodyFields = [];
            }
            const bodyFields = apiItem.bodyFields.map(field => {
                return {...field};
            });
            let isVKFileUploadingMode = false;
            bodyFields.forEach((bodyField) => {
                let element;
                // JSON field value
                if (ApiService.isJson(bodyField.value)) {
                    const valueObj = JSON.parse(bodyField.value as string);
                    Object.keys(valueObj).forEach((key) => {
                        element = currentElements.find((item) => {
                            const {apiUuid, fieldName, fieldType} = this.getElementOptions(item, 'input');
                            return apiUuid === apiItem.uuid
                                && fieldName === `${bodyField.name}.${key}`
                                && fieldType === 'input';
                        });
                        if (!element) {
                            return;
                        }
                        if (element.type === 'input-switch') {
                            if (element.enabled) {
                                valueObj[key] = element.value || true;
                            }
                        } else {
                            const targetElement = this.findBlockElementByName(element.valueFrom);
                            valueObj[key] = element.valueFrom && targetElement
                                ? targetElement.value
                                : element.value;
                        }
                        if (typeof valueObj[key] === 'string') {
                            valueObj[key] = ApplicationService.createStringValue(element, valueObj[key]);
                        }
                    });
                    bodyField.value = JSON.stringify(valueObj);
                    return;
                // Normal field value
                } else {
                    element = currentElements.find((item) => {
                        const {apiUuid, fieldName, fieldType} = this.getElementOptions(item, 'input');
                        return apiUuid === apiItem.uuid
                            && fieldName === bodyField.name
                            && fieldType === 'input';
                    });
                }
                if (!element) {
                    return;
                }
                ApplicationService.localStoreValue(element);

                bodyField.value = element.valueFrom
                    ? ApplicationService.getElementValue(this.findBlockElementByName(element.valueFrom))
                    : ApplicationService.getElementValue(element);

                if ((element.type === 'input-file' || element.value instanceof File) && this.isVkApp && this.vkAppOptions.userFileUploadUrl) {
                    isVKFileUploadingMode = true;
                }
                if (element.type === 'input-switch') {
                    if (bodyField.value) {
                        bodyField.hidden = !element?.enabled;
                    } else {
                        bodyField.value = element?.enabled;
                        bodyField.hidden = false;
                    }
                }
            });

            // Inject VK file upload URL
            if (isVKFileUploadingMode) {
                let dataField = bodyFields.find((field) => {
                    return field.name === 'opt_vk_data';
                });
                if (!dataField) {
                    dataField = {name: 'opt_vk_data', value: '', hidden: false};
                    bodyFields.push(dataField);
                }
                dataField.value = JSON.stringify({upload_url: this.vkAppOptions?.userFileUploadUrl || ''});
            }

            apiItem.bodyFields = bodyFields;
        }
        const rawFields = this.apiService.getRawDataFields(apiItem);

        // Raw value
        if (apiItem.bodyDataSource === 'raw' || rawFields.length > 0) {
            const element = currentElements.find((item) => {
                const {apiUuid, fieldName, fieldType} = this.getElementOptions(item, actionType);
                return apiUuid === apiItem.uuid
                    && fieldName === 'value'
                    && fieldType === 'input';
            });
            if (element) {
                apiItem.bodyContent = ApplicationService.getElementValue(element) as string;
            } else if (apiItem.bodyContent) {
                const inputData = JSON.parse(apiItem.bodyContent);
                const outputData = this.flattenObj(inputData);

                Object.keys(outputData).forEach((key: string) => {
                    const element = currentElements.find((elem) => {
                        const {apiUuid, fieldName, fieldType} = this.getElementOptions(elem, actionType);
                        return apiUuid === apiItem.uuid
                            && fieldName === key
                            && fieldType === 'input';
                    });
                    if (!element) {
                        return;
                    }
                    ApplicationService.localStoreValue(element);

                    const value = element.valueFrom
                        ? ApplicationService.getElementValue(this.findBlockElementByName(element.valueFrom))
                        : ApplicationService.getElementValue(element);

                    const enabled = element.type !== 'input-switch' || element?.enabled;
                    if (value && !enabled) {
                        delete inputData[key];
                        return;
                    }
                    outputData[key] = ['input-switch'].includes(element.type) ? (value || enabled) : value;
                    if (typeof outputData[key] === 'string') {
                        outputData[key] = ApplicationService.createStringValue(element, outputData[key]);
                    }
                });

                apiItem.bodyContent = JSON.stringify(this.unFlattenObject(outputData));
            } else {
                const outputData = {};
                currentElements.forEach((elem) => {
                    const {apiUuid, fieldName, fieldType} = this.getElementOptions(elem, actionType);
                    if (apiUuid !== apiItem.uuid || fieldType !== 'input') {
                        return;
                    }
                    ApplicationService.localStoreValue(elem);

                    const value = elem.valueFrom
                        ? ApplicationService.getElementValue(this.findBlockElementByName(elem.valueFrom))
                        : ApplicationService.getElementValue(elem);

                    const enabled = elem.type !== 'input-switch' || elem?.enabled;
                    if ((value && !enabled) || (['button'].includes(elem.type) && !value)) {
                        return;
                    }
                    if (typeof value === 'string') {
                        outputData[fieldName] = ApplicationService.createStringValue(elem, value);
                    } else {
                        outputData[fieldName] = value;
                    }
                });
                apiItem.bodyContentFlatten = JSON.stringify(outputData);
            }
        }

        // Query params
        if (!apiItem.queryParams) {
            apiItem.queryParams = [];
        }
        const queryParams = apiItem.queryParams.map(field => {
            return {...field};
        });
        queryParams.forEach((param) => {
            const element = currentElements.find((element) => {
                const {apiUuid, fieldName, fieldType} = this.getElementOptions(element, actionType);
                return apiUuid === apiItem.uuid
                    && fieldName === param.name
                    && fieldType === 'params';
            });
            if (!element) {
                return;
            }
            ApplicationService.localStoreValue(element);
            param.value = element.value
                ? ApplicationService.getElementValue(element) as string
                : null;
            if (element.type === 'input-switch') {
                param.hidden = !element?.enabled;
            }
        });
        apiItem.queryParams = queryParams;

        // Headers
        if (!apiItem.headers) {
            apiItem.headers = [];
        }
        const headers = apiItem.headers.map(field => {
            return {...field};
        });
        headers.forEach((header) => {
            const element = currentElements.find((element) => {
                const {apiUuid, fieldName, fieldType} = this.getElementOptions(element, actionType);
                return apiUuid === apiItem.uuid
                    && fieldName === header.name
                    && fieldType === 'headers';
            });
            if (!element) {
                return;
            }
            header.value = element.valueFrom
                ? ApplicationService.getElementValue(this.findBlockElementByName(element.valueFrom)) as string
                : ApplicationService.getElementValue(element) as string;
        });
        apiItem.headers = headers;

        // Api URL
        const elements = currentElements.filter((item) => {
            const {apiUuid, fieldName, fieldType} = this.getElementOptions(item, 'input');
            return apiUuid === apiItem.uuid && fieldType === 'url';
        });

        apiItem.urlPartIndex = 0;
        apiItem.urlPartValue = null;
        elements.forEach((el) => {
            if (el.value && el.options?.inputApiFieldName !== null) {
                apiItem.urlPartIndex = Number(el.options?.inputApiFieldName);
                apiItem.urlPartValue = String(el.value);
                this.apiRequestUrlUpdate(apiItem, Number(el.options?.inputApiFieldName), String(el.value));
            }
        });

        return apiItem;
    }

    apiRequestUrlUpdate(apiItem: ApiItem, urlPartIndex: number, urlPartValue: string): void {
        const requestUrl = apiItem.requestUrl;
        if (!requestUrl) {
            return;
        }
        let urlParts = [];
        const tmp = requestUrl.split('/');
        urlParts.push(`${tmp[0]}//${tmp[2]}`);
        tmp.splice(0, 3);
        urlParts = [...urlParts, ...tmp];
        if (urlParts.length < urlPartIndex + 2) {
            return;
        }
        urlParts[urlPartIndex + 1] = urlPartValue;
        apiItem.requestUrl = urlParts.join('/');
    }

    getElementOptions(element: AppBlockElement, actionType: 'input'|'output' = 'output'): {apiUuid: string, fieldName: string|number, fieldType: string} {
        return actionType === 'input'
            ? {
                apiUuid: element.options?.inputApiUuid,
                fieldName: element.options?.inputApiFieldName,
                fieldType: element.options?.inputApiFieldType
            }
            : {
                apiUuid: element.options?.outputApiUuid,
                fieldName: element.options?.outputApiFieldName,
                fieldType: element.options?.outputApiFieldType
            };
    }

    createAppResponse(apiItem: ApiItem, response: HttpResponse<any>, currentElement: AppBlockElement): void {
        if (!response.body) {
            return;
        }
        const currentApiUuid = apiItem.uuid;
        const responseContentType = response.headers.has('Content-type')
            ? response.headers.get('Content-type')
            : apiItem.responseContentType;
        const elements = this.findElements(currentApiUuid, 'output', currentElement);
        const blocks = this.findBlocksByElements(elements);
        blocks.forEach((block) => {
            if (block.options?.autoClear) {
                this.clearElementsValues(block);
            }
        });

        this.apiService.getDataFromBlob(response.body, responseContentType)
            .then((data) => {
                const valuesData = ApiService.getPropertiesRecursively(data, '', [], []);
                const valuesObj = ApiService.getPropertiesKeyValueObject(valuesData.outputKeys, valuesData.values);

                elements.forEach((element, index) => {
                    if (element.type === 'input-chart-line') {
                        this.chartElementValueApply(element, data);
                    } else if (element.type === 'input-pagination') {
                        this.paginationValueApply(element, valuesObj, data);
                    } else {
                        this.blockElementValueApply(element, valuesObj, data);
                    }
                    this.elementHiddenStateUpdate(element);
                });

                // Save file to VK files section
                if (this.isVkApp && data?.result_data?.vk_file_to_save) {
                    this.vkSaveFile(data.result_data.vk_file_to_save, elements);
                }
                if (this.isVkApp && currentElement.type === 'button' && this.data.advertising) {
                    this.vkBridgeService.showAds(this.vkAppOptions);
                }

                this.afterResponseCreated(blocks);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    createAppChunkResponse(data: any, elements: AppBlockElement[], chunkIndex: number = 0): void {
        const valuesData = ApiService.getPropertiesRecursively(data, '', [], []);
        const valuesObj = ApiService.getPropertiesKeyValueObject(valuesData.outputKeys, valuesData.values);

        elements.forEach((element, index) => {
            const fieldName = element.options?.outputApiFieldName;
            if (!fieldName) {
                return;
            }
            let value = fieldName === 'value' && !valuesObj[fieldName] ? data : (valuesObj[fieldName] || '');
            if (typeof value === 'object') {
                value = JSON.stringify(value, null, 4);
            }
            if (chunkIndex === 0) {
                element.value = element.prefixText || '';
            }
            element.value += value;
            element.hidden = !element.value;
            this.cdr.detectChanges();
        });
    }

    afterResponseCreated(blocks: AppBlock[]): void {
        if (this.data.paymentEnabled) {
            this.updateUserBalance();
        }
        this.cdr.detectChanges();
    }

    createErrorMessage(apiItem: ApiItem, blob: Blob): void {
        this.apiService.getDataFromBlob(blob)
            .then((data) => {
                let errorMessage = data.detail || data.message || $localize `Error.`;
                this.errors[apiItem.uuid] = {};
                if (typeof data === 'object' && !Array.isArray(data)) {
                    const errorsObj = {};
                    for (let key in data) {
                        errorsObj[key] = Array.isArray(data[key]) ? data[key].join(' ') : data[key];
                    }
                    this.errors[apiItem.uuid] = errorsObj;
                    if (data.detail) {
                        errorMessage = data.detail;
                    }
                }
                const allElements = this.getAllElements();
                const elements = allElements.filter((element) => {
                    return element.options?.outputApiUuid === apiItem.uuid && element.options?.outputApiFieldType === 'output';
                });
                const valuesData = ApiService.getPropertiesRecursively(data, '', [], []);
                const valuesObj = ApiService.getPropertiesKeyValueObject(valuesData.outputKeys, valuesData.values);
                elements.forEach((element) => {
                    if (['input-textarea', 'text'].includes(element.type)) {
                        this.blockElementValueApply(element, valuesObj, data);
                    }
                });
                this.message = this.localizeServerMessages(errorMessage);
                this.messageType = 'error';
                this.cdr.detectChanges();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    localizeServerMessages(errorMessage: string): string {
        if (errorMessage === 'Daily usage limit exceeded.') {
            errorMessage = $localize `Daily usage limit exceeded.`;
        }
        if (errorMessage === 'File not found.') {
            errorMessage = $localize `File not found.`;
        }
        if (errorMessage === 'Unable to determine file type.') {
            errorMessage = $localize `Unable to determine file type.`;
        }
        if (errorMessage === 'Unsupported image file type.') {
            errorMessage = $localize `Unsupported image file type.`;
        }
        if (errorMessage === 'Unsupported video file type.') {
            errorMessage = $localize `Unsupported video file type.`;
        }
        if (errorMessage === 'The file is too large.') {
            errorMessage = $localize `The file is too large.`;
        }
        if (errorMessage === 'Please upload image file.') {
            errorMessage = $localize `Please upload image file.`;
        }
        if (errorMessage === 'Processing error. Please try again later.') {
            errorMessage = $localize `Processing error. Please try again later.`;
        }
        if (errorMessage === 'Task not found.') {
            errorMessage = $localize `Task not found.`;
        }
        if (errorMessage === 'Sorry, access is for subscribers only.') {
            errorMessage = $localize `Sorry, access is for subscribers only.`;
        }
        if (errorMessage === 'The video is too long.') {
            errorMessage = $localize `The video is too long.`;
        }
        if (errorMessage === 'Video not found.') {
            errorMessage = $localize `Video not found.`;
        }
        if (errorMessage === 'No human face found in the photo.') {
            errorMessage = $localize `No human face found in the photo.`;
        }
        if (errorMessage === 'Insufficient funds.') {
            errorMessage = $localize `Insufficient funds.`;
        }
        return errorMessage;
    }

    chartElementValueApply(element: AppBlockElement, data: any): void {
        const fieldNameAxisX = element.fieldNameAxisX;
        const fieldNameAxisY = element.fieldNameAxisY;
        const dataKey = element.options?.outputApiFieldName;
        if (!fieldNameAxisX || !fieldNameAxisY || (!data[dataKey] && !data)) {
            return;
        }
        const dateFormat = element?.format;
        const outData = data[dataKey] || data;
        const yAxisData = outData.map((item) => {
            return parseFloat(item[fieldNameAxisY]);
        });
        const xAxisData = outData.map((item) => {
            const value = item[fieldNameAxisX] || '';
            if (element.isXAxisDate && dateFormat && value) {
                const date = moment(String(value));
                return date.format(dateFormat);
            }
            return value;
        });
        element.valueObj = {xAxisData, yAxisData, data: outData};
    }

    paginationValueApply(element: AppBlockElement, data: any, rawData: any): void {
        const dataKey = String(element.options?.outputApiFieldName || '');
        const endlessMode = dataKey.toLowerCase().includes('current') || dataKey.toLowerCase().includes('page');
        const value = parseInt(element.value as string);
        const currentPage = element.useAsOffset
            ? (value ? (value / element.perPage) + 1 : 1)
            : value;
        const totalItems = endlessMode ? 9999 : (data[dataKey] || 0);
        element.valueObj = {
            id: element.name,
            totalItems,
            itemsPerPage: element.perPage,
            currentPage
        }
    }

    clearPagination(apiUuid: string): void {
        const allElements = this.getAllElements();
        const elements = allElements.filter((el) => {
            return el.type === 'input-pagination' && el.options?.inputApiUuid === apiUuid;
        });
        elements.forEach((elements) => {
            elements.value = elements.useAsOffset ? 0 : 1;
            if (elements.valueObj) {
                elements.valueObj.currentPage = 1;
            }
        });
    }

    blockElementValueApply(element: AppBlockElement, valuesObj: any, rawData: any): void {
        const fieldName = element.options?.outputApiFieldName;
        if (!fieldName) {
            return;
        }
        let value = fieldName === 'value' && !valuesObj[fieldName] ? rawData : (valuesObj[fieldName] || '');
        if (!value) {
            element.value = '';
            this.cdr.detectChanges();
            return;
        }
        if (['image', 'audio', 'video'].includes(element.type) && typeof value === 'string') {
            element.value = this.sanitizer.bypassSecurityTrustResourceUrl(ApplicationService.createStringValue(element, value));
            this.cdr.detectChanges();
            return;
        }
        if (ApiService.isJson(value)) {
            value = JSON.parse(value);
        }
        if (Array.isArray(value)) {
            let valueArr = this.flattenObjInArray(value);
            if (element.itemFieldName && !element.itemFieldName.match(/^https?:\/\//)) {
                // Filter array values
                valueArr = this.filterArrayValues(valueArr, element.itemFieldName);
            }
            element.valueArr = valueArr;
            if (element.valueArr.length > 0 && element.selectDefaultFirst) {// !['image', 'audio'].includes(element.type)) {
                element.value = element?.itemFieldNameForValue
                    ? element.valueArr[0][element?.itemFieldNameForValue]
                    : element.valueArr[0];
            }
            if (['input-text', 'input-textarea', 'input-hidden', 'text', 'text-header'].includes(element.type)) {
                element.value = ApplicationService.createStringValue(element, value, true);
            }
        } else if (['input-switch', 'input-number', 'input-slider', 'status'].includes(element.type)) {
            element.value = value;
        } else if (['progress'].includes(element.type)) {
            element.valueObj = value;
        } else {
            if (typeof value === 'boolean' && element.prefixText) {
                element.value = element.prefixText + (element.suffixText || '');
            } else if (typeof value === 'string' || element.prefixText || element.suffixText) {
                element.value = ApplicationService.createStringValue(element, value, true);
            } else {
                element.value = value;
            }
        }
        ApplicationService.localStoreValue(element);
        if ((element.value || element.valueArr || element.valueObj)/* && !['input-select'].includes(element.type)*/) {
            this.onElementValueChanged(element);
        }
    }

    onElementClick(element: AppBlockElement): void {
        if (!this.previewMode) {
            return;
        }
        if (element.type === 'button') {
            if (element.isClearForm) {
                this.clearAllValues();
            } else if (element.options?.inputApiUuid && element.options?.inputApiFieldName === 'submit') {
                if (this.data.maintenance) {
                    this.maintenanceModalToggle();
                } else {
                    this.appSubmit(this.data.uuid, element.options.inputApiUuid, 'input', element);
                }
            } else if (element.value && String(element.value).match(/https?:\/\//)) {
                if (element.isDownloadMode) {
                    ApplicationService.downloadImage(String(element.value));
                } else {
                    window.open(String(element.value), '_blank').focus();
                }
            }
        }
        if (element.type === 'user-subscription' && this.isVkApp) {
            this.message = '';
            if (element.value) {
                this.message = $localize `You are already subscribed.`;
                this.messageType = 'success';
            } else if (element.subscriptionId) {
                this.vkBridgeService.showSubscriptionBox(element.subscriptionId)
                    .then((data: any) => {
                        if (data?.success) {
                            this.vkAppOptions.userSubscriptions.push(element.subscriptionId);
                            element.value = true;
                            this.message = $localize `The purchase was successful.`;
                            this.messageType = 'success';
                            this.cdr.detectChanges();
                        }
                    });
            }
        }
    }

    onElementValueChanged(element: AppBlockElement): void {
        if (!this.previewMode
            || this.data.maintenance
            || (!element.value && !['input-switch'].includes(element.type))
            || (Array.isArray(element.value) && element.value.length === 0)) {
                return;
            }
        if (element.loadValueInto && element.value) {
            const allElements = this.getAllElements();
            const targetElement = allElements.find((elem) => {
                return elem.name === element.loadValueInto;
            });
            if (targetElement) {
                this.loadValueToElement(targetElement, element.value);
                setTimeout(() => {
                    this.clearElementValue(element, true);
                    if (element.type === 'input-select') {
                        element.value = null;
                    }
                    this.cdr.detectChanges();
                }, 100);
                this.cdr.markForCheck();
            }
            return;
        }
        // Hidden by field switch
        if (['input-switch'].includes(element.type)) {
            const enabled = element.enabled;
            const block = this.findBlock(element);
            if (block) {
                block.elements.forEach((elem) => {
                    this.elementHiddenStateUpdate(elem, block);
                });
            }
        }
        const inputApiUuid = element.options?.inputApiUuid;
        if (inputApiUuid) {
            const buttonElement = this.findButtonElement(inputApiUuid);
            if (inputApiUuid && this.errors[inputApiUuid]) {
                delete this.errors[inputApiUuid][element.name];
            }
            if (buttonElement && !['input-pagination'].includes(element.type)) {
                return;
            }
            this.removeAutoStart(inputApiUuid);
            // this.appAutoStart(inputApiUuid, 'input', element);
            this.appSubmit(this.data.uuid, inputApiUuid, 'input', element);
        }
    }

    loadValueToElement(targetElement: AppBlockElement, newValue: any): void {
        if (['image'].includes(targetElement.type) && typeof newValue !== 'string') {
            if (Array.isArray(newValue) && newValue[0] instanceof File) {
                newValue = newValue[0];
            }
            if (newValue instanceof File) {
                if (!newValue.type.includes('image/') && !newValue.type.includes('djvu')) {
                    return;
                }
                targetElement.valueObj = URL.createObjectURL(newValue);
            } else {
                targetElement.valueObj = newValue;
            }
            targetElement.value = newValue;
            this.elementHiddenStateUpdate(targetElement);
            this.cdr.markForCheck();
            return;
        }
        targetElement.value = newValue;
        this.elementHiddenStateUpdate(targetElement);
        this.cdr.markForCheck();
    }

    onItemSelected(element: AppBlockElement, index: number): void {
        if (!this.previewMode) {
            return;
        }
        const apiUuid = element.options?.inputApiUuid;
        if (!apiUuid) {
            return;
        }
        // console.log('onItemSelected', element);
        this.appSubmit(this.data.uuid, apiUuid, 'input', element);
    }

    onItemClone(data: number[]): void {
        if (data.length < 2) {
            return;
        }
        const parentIndex = data[0];
        const elementIndex = data[1];
        const element = this.data.blocks[parentIndex].elements[elementIndex];
        const elementCloned = Object.assign({}, element, {options: {}});

        this.data.blocks[parentIndex].elements.splice(elementIndex + 1, 0, elementCloned);
        this.cdr.markForCheck();
    }

    onProgressUpdate(currentElement: AppBlockElement): void {
        this.progressUpdating = true;
        const apiUuid = currentElement.options?.outputApiUuid;
        if (!apiUuid) {
            return;
        }
        this.appSubmit(this.data.uuid, apiUuid, 'input', currentElement);
    }

    onProgressCompleted(currentElement: AppBlockElement): void {
        this.progressUpdating = false;
        const apiUuid = currentElement.options?.outputApiUuid;
        if (!apiUuid) {
            return;
        }
        const elements = this.findElements(apiUuid, 'input', currentElement, true);
        const storeElements = elements.filter((elem) => {
            return elem.storeValue;
        });
        storeElements.forEach((elem) => {
            elem.value = null;
            elem.valueObj = null;
            elem.valueArr = null;
            ApplicationService.localStoreValue(elem);
        });
    }

    flattenObjInArray(inputArr: any[]): any[] {
        return inputArr.map((item) => {
            return this.flattenObj(item);
        });
    }

    filterArrayValues(valueArr: any[], itemFieldName: string): any[] {
        if (!itemFieldName || !valueArr) {
            return valueArr;
        }
        valueArr = valueArr.filter((item) => {
            const value = item[itemFieldName] || '';
            return !!value && !ApiService.isJson(value);
        });
        return valueArr;
    }

    flattenObj(obj: any, parent: string = '', res: any = {}): any {
        if (typeof obj !== 'object') {
            return obj;
        }
        if (Array.isArray(obj)) {
            if (obj.length > 0) {
                obj.forEach((item, index) => {
                    let propName = parent ? parent + '.' + index : String(index);
                    res[propName] = item;
                    if (typeof item === 'object') {
                        this.flattenObj(item, propName, res);
                    }
                });
            } else {
                res[parent] = [];
            }
            return res;
        }
        for (let key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            let propName = parent ? parent + '.' + key : key;
            res[propName] = obj[key];
            if (typeof obj[key] === 'object') {
                this.flattenObj(obj[key], propName, res);
            }
        }
        return res;
    }

    unFlattenObject(flatObj: any): any {
        const result = {};
        for (const key in flatObj) {
            if (flatObj.hasOwnProperty(key)) {
                const keys = key.split('.');
                let current = result;
                for (let i = 0; i < keys.length; i++) {
                    const part = keys[i];
                    if (i === keys.length - 1) {
                        current[part] = flatObj[key];
                    } else {
                        if (!current[part]) {
                            current[part] = {};
                        }
                        current = current[part];
                    }
                }
            }
        }
        return result;
    }

    maintenanceModalToggle(): void {
        this.maintenanceModalActive = !this.maintenanceModalActive;
    }

    onMessage(msg: string[]) {
        this.message = this.localizeServerMessages(msg[0]);
        this.messageType = msg[1] as 'error'|'success';
    }

    subscriptionsElementsSync(): void {
        if (!this.vkAppOptions?.userSubscriptions
            || this.vkAppOptions.userSubscriptions.length === 0
            || this.data.blocks.length === 0) {
            return;
        }
        this.data.blocks.forEach((block) => {
            block.elements.forEach((element) => {
                if (element.type !== 'user-subscription') {
                    return;
                }
                if (this.vkAppOptions.userSubscriptions.includes(element.subscriptionId)) {
                    element.value = true;
                }
            });
        });
        this.cdr.markForCheck();
    }

    vkAppInit(): void {
        this.vkBridgeService.getOptions()
            .then((options) => {
                this.vkAppOptions = options;
                if (this.data.advertising && (!this.vkAppOptions?.userSubscriptions
                    || !this.vkBridgeService.hasAnyString(this.vkAppOptions.userSubscriptions, ['remove_ad', 'premium_20', 'premium_30']))) {
                    this.vkBridgeService.showBannerAd();
                }
                this.subscriptionsElementsSync();
            })
            .catch(() => {
                this.vkAppOptions = {};
            });
    }

    adultAppRestrict(): void {
        const initialData = {
            appUuid: this.data.uuid
        };
        this.modalService.showDynamicComponent(this.viewRef, AppAdultValidationComponent, initialData)
            .pipe(take(1))
            .subscribe({
                next: (reason) => {
                    // console.log(reason);
                }
            });
    }

    vkGetFileUploadUrl(callbackFunc?: () => void): void {
        this.message = '';
        this.vkBridgeService.getFileUploadUrl(this.vkAppOptions)
            .then((userFileUploadUrl: string) => {
                if (typeof callbackFunc === 'function') {
                    callbackFunc();
                }
            })
            .catch((error) => {
                console.log(error);
                this.message = $localize `Unable to obtain permission to upload file.`;
                this.messageType = 'error';
                this.cdr.detectChanges();
            });
    }

    vkSaveFile(fileDataString: string, outputElements: AppBlockElement[]): void {
        this.vkBridgeService.saveFile(this.data.name, this.data.language, this.vkAppOptions, fileDataString)
            .then((docUrl: string) => {
                this.message = $localize `The result has been successfully saved to your files.`;
                this.messageType = 'success';

                // Pass the URL as the value of the download button
                // if (docUrl) {
                //     const buttonElement = outputElements.find((elem) => {
                //         return elem.type === 'button';
                //     });
                //     if (buttonElement) {
                //         buttonElement.value = docUrl;
                //         this.elementHiddenStateUpdate(buttonElement);
                //     }
                //     this.cdr.detectChanges();
                // }
            });
    }

    startPayment(): void {
        if (!this.isLoggedIn) {
            this.authService.navigateAuthPage('login');
            return;
        }
        const initialData = {
            appUuid: this.data.uuid
        };
        this.modalService.showDynamicComponent(this.viewRef, ModalTopUpBalanceComponent, initialData)
            .pipe(take(1))
            .subscribe({
                next: (reason) => {
                    // console.log(reason);
                    if (reason === 'confirmed') {

                    } else if (reason === 'promo_code_success') {
                        this.updateUserBalance();
                        this.message = $localize `Congratulations! Promo code accepted.`;
                        this.messageType = 'success';
                    }
                }
            });
    }

    updateUserBalance(): void {
        if (!this.isLoggedIn) {
            return;
        }
        this.dataService.userBalance(this.data.uuid)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.userBalance = res?.balance || 0;
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    // console.log(err);
                }
            });
    }

    navigateBack(event?: MouseEvent) {
        if (event) {
            event.preventDefault();
        }
        this.router.navigate([this.routerEventsService.getPreviousUrl()]);
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
