import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';

import { ApiItem } from '../models/api-item.interface';
import { PricePerUseParam } from '../models/price-per-use-param.interface';
import { ApiItemMessageEvent } from '../api-item/api-item.component';
import { ApiService } from '../../services/api.service';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { ModalService } from '../../services/modal.service';

@Component({
    selector: 'app-api-create',
    templateUrl: './api-create.component.html',
    styleUrls: ['./api-create.component.css'],
    providers: [],
    standalone: false
})
export class ApiCreateComponent implements OnInit, OnDestroy {

    @ViewChild('dynamic', { read: ViewContainerRef }) private viewRef: ViewContainerRef;

    errors: {[name: string]: string[]} = {};
    message: string = '';
    messageType: 'error'|'success' = 'error';
    loading = false;
    submitted = false;
    senderValue = 'browser';

    isNotified: boolean = false;
    isSettingsActive: boolean = false;
    isPriceParamsActive: boolean = false;
    closePriceParamsOnSave: boolean = false;
    itemId: number = 0;
    data: ApiItem = ApiService.getDefault();
    destroyed$: Subject<void> = new Subject();

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        protected route: ActivatedRoute,
        protected router: Router,
        protected modalService: ModalService,
        protected apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.itemId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.itemId) {
            this.getData();
        }
    }

    getData(): void {
        this.apiService.getItem(this.itemId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    if (!this.data.queryParams || this.data.queryParams.length === 0) {
                        this.data.queryParams = [{name: '', value: ''}];
                    }
                    if (!this.data.bodyFields || this.data.bodyFields.length === 0) {
                        this.data.bodyFields = [{name: '', value: ''}];
                    }
                    if (!this.data.headers || this.data.headers.length === 0) {
                        this.data.headers = [{name: '', value: ''}];
                    }
                    if (!this.data.pricePerUseParams) {
                        this.data.pricePerUseParams = [];
                    }
                    if (res.sender) {
                        this.senderValue = res.sender;
                    }
                    this.loading = false;
                },
                error: (err) => {
                    this.errors = err;
                    this.loading = false;
                }
            });
    }

    cloneItem(): void {
        const initialData = {
            message: $localize `Are you sure you want to clone this API?`,
            isActive: true
        };
        this.modalService.showDynamicComponent(this.viewRef, ConfirmComponent, initialData)
            .pipe(take(1))
            .subscribe({
                next: (reason) => {
                    if (reason === 'confirmed') {
                        this.loading = true;
                        this.apiService.cloneItem(this.data.uuid)
                            .pipe(takeUntil(this.destroyed$))
                            .subscribe({
                                next: (res) => {
                                    if (res.success) {
                                        this.router.navigate(['apis', 'personal']);
                                    } else {
                                        if (res['detail']) {
                                            this.message = res['detail'];
                                            this.messageType = 'error';
                                        }
                                        this.loading = false;
                                    }
                                },
                                error: (err) => {
                                    if (err.detail) {
                                        this.message = err.detail;
                                        this.messageType = 'error';
                                    }
                                    this.loading = false;
                                }
                            });
                    }
                }
            });
    }

    private hasPrivateFields(): boolean {
        const hasPrivate = (fields: { private?: boolean }[] | undefined) =>
            !!fields?.some(f => f.private);
        return hasPrivate(this.data.bodyFields)
            || hasPrivate(this.data.headers)
            || hasPrivate(this.data.queryParams)
            || !!this.data.bodyContentPrivate;
    }

    validateData(): boolean {
        const needsWarning = this.data.sender === 'browser' && this.hasPrivateFields();
        if (needsWarning && !this.isNotified) {
            const initialData = {
                message: $localize `Your API configuration is in "browser" mode, in this case an advanced user will be able to see all your private data (authorization keys, etc.). Are you sure you want to continue?`,
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
        if (!this.validateData() && !confirmed) {
            return;
        }

        this.message = '';
        this.errors = {};
        this.loading = true;
        this.submitted = true;

        const isNewItem = !this.data.id;

        this.apiService.updateItem(this.data)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.itemId = res.id;
                    this.data.id = this.itemId;
                    this.loading = false;
                    this.submitted = false;
                    this.message = $localize `Saved successfully.`;
                    this.messageType = 'success';
                    if (this.closePriceParamsOnSave) {
                        this.closePriceParamsOnSave = false;
                        this.isPriceParamsActive = false;
                    }
                    if (isNewItem) {
                        this.navigateToEdit(this.data.id);
                    }
                },
                error: (err) => {
                    this.closePriceParamsOnSave = false;
                    this.errors = err;
                    if (this.errors && typeof this.errors === 'object') {
                        let message = '';
                        Object.keys(this.errors).forEach((key) => {
                            message += (message ? '\n' : '') + `${key}: ` + this.errors[key].join(' ');
                        });
                        this.message = message;
                    } else {
                        this.message = 'Please correct the errors.';
                    }
                    this.messageType = 'error';
                    this.loading = false;
                    this.submitted = false;
                }
            });
    }

    navigateToEdit(appItemId: number): void {
        this.router.navigate(['apis', 'edit', String(appItemId)]);
    }

    deleteErrorMessages(name: string) {
        if (this.errors[name]) {
            delete this.errors[name];
        }
    }

    onUrlEnter(url: string): void {
        if (!this.data.name) {
            this.data.name = url.replace(/^https?:\/\//, '')
                .replace(/^wss?:\/\//, '')
                .replace(/\//g, ' - ').trim();
        }
    }

    onSenderChange(sender: string) {
        this.senderValue = sender;
    }

    onApiItemMessage(event: ApiItemMessageEvent): void {
        this.message = event.text;
        this.messageType = event.type;
    }

    apiSettingsToggle(): void {
        this.isSettingsActive = !this.isSettingsActive;
    }

    get priceParamFieldNames(): string[] {
        if (this.data.bodyDataSource === 'raw') {
            if (!this.data.bodyContent || !ApiService.isJson(this.data.bodyContent)) {
                return [];
            }
            try {
                const bodyData = JSON.parse(this.data.bodyContent);
                const {outputKeys, values} = ApiService.getPropertiesRecursively(bodyData);
                return outputKeys.filter((key, index) => {
                    return values[index] !== null && typeof values[index] !== 'object';
                });
            } catch (e) {
                return [];
            }
        }
        const names: string[] = [];
        (this.data.bodyFields || []).forEach((field) => {
            if (field.name && !field.hidden && !names.includes(field.name)) {
                names.push(field.name);
            }
        });
        return names;
    }

    priceParamsOpen(): void {
        this.isSettingsActive = false;
        this.isPriceParamsActive = true;
    }

    priceParamsClose(): void {
        this.isPriceParamsActive = false;
        this.closePriceParamsOnSave = false;
    }

    savePriceParams(): void {
        this.closePriceParamsOnSave = true;
        this.saveData();
    }

    addPriceParam(): void {
        this.data.pricePerUseParams.push({name: '', value: '', multiplier: 1});
    }

    deletePriceParam(index: number): void {
        this.data.pricePerUseParams.splice(index, 1);
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
