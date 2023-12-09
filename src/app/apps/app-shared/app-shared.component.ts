import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { ApplicationService } from '../../services/application.service';
import { ApplicationItem } from '../models/application-item.interface';
import { AppBlockElement } from '../models/app-block.interface';
import { ApiService } from '../../services/api.service';
import { ApiItem } from "../../apis/models/api-item.interface";

@Component({
    selector: 'app-item-shared',
    templateUrl: './app-shared.component.html',
    providers: []
})
export class ApplicationSharedComponent implements OnInit, OnDestroy {

    errors: {[name: string]: string[]} = {};
    message: string = '';
    messageType: 'error'|'success' = 'error';
    loading = false;
    submitted = false;

    apiItems: ApiItem[];
    apiUuidsList = [];
    itemUuid: string;
    data: ApplicationItem;
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected dataService: ApplicationService,
        protected apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.itemUuid = this.route.snapshot.paramMap.get('uuid');
        if (this.itemUuid) {
            this.getData();
        }
    }

    getData(): void {
        this.loading = true;
        this.dataService.getItemByUuidShared(this.itemUuid)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.loading = false;
                    this.createAppOptions();
                },
                error: (err) => {
                    this.errors = err;
                    this.loading = false;
                }
            });
    }

    createAppOptions(): void {
        if (!this.data) {
            return;
        }
        this.apiUuidsList = [];
        this.data.blocks.forEach((block) => {
            block.elements.forEach((element) => {
                const uuid = element.options?.apiUuid;
                if (uuid && !this.apiUuidsList.includes(uuid)) {
                    this.apiUuidsList.push(uuid);
                }
            });
        });
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

    deleteErrorMessages(name: string) {
        if (this.errors[name]) {
            delete this.errors[name];
        }
    }

    onElementClick(element: AppBlockElement): void {
        if (element.type === 'button') {
            this.appSubmit(element.options?.apiUuid);
        }
    }

    getApiList(): Promise<any> {
        const promises = [];
        this.apiUuidsList.forEach((uuid) => {
            promises.push(firstValueFrom(this.apiService.getItemByUuidShared(uuid)));
        });
        return Promise.all(promises);
    }

    appSubmit(apiUuid?: string): void {
        if (!apiUuid) {
            return;
        }
        this.message = '';
        this.loading = true;
        this.submitted = true;
        if (!this.apiItems && this.apiUuidsList.length > 0) {
            this.apiItems = [];
            this.getApiList().then((items) => {
                this.apiItems = items;
                this.appSubmit(apiUuid);
            });
            return;
        }
        const currentApi = this.apiItems.find((apiItem) => {
            return apiItem.uuid === apiUuid;
        });
        if (!currentApi) {
            this.loading = false;
            this.submitted = false;
            return;
        }
        const apiItem = this.prepareApiItem(currentApi);
        this.apiService.apiRequest(apiItem)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.createAppResponse(currentApi, res);
                    this.loading = false;
                    this.submitted = false;
                },
                error: (err) => {
                    console.log(err);
                    this.loading = false;
                    this.submitted = false;
                    if (err?.error instanceof Blob) {
                        this.createErrorMessage(err.error);
                    } else {
                        this.messageType = 'error';
                        this.message = err.message || 'Error.';
                    }
                }
            });
    }

    prepareApiItem(inputApiItem: ApiItem): ApiItem {
        const apiItem = Object.assign({}, inputApiItem);
        if (apiItem.requestContentType === 'json' && apiItem.bodyFields) {
            const bodyFields = apiItem.bodyFields.map(field => {
                return {...field};
            })
            const allElements = this.getAllElements();
            bodyFields.forEach((bodyField) => {
                const element = allElements.find((element) => {
                    return element.options?.apiUuid === apiItem.uuid
                        && element.options?.fieldName === bodyField.name
                        && element.options?.fieldType === 'input';
                });
                if (!element) {
                    return;
                }
                bodyField.value = String(element.value);
            });
            apiItem.bodyFields = bodyFields;
        }
        return apiItem;
    }

    createAppResponse(apiItem: ApiItem, response: HttpResponse<any>): void {
        if (response.body) {
            const allElements = this.getAllElements();
            const elements = allElements.filter((element) => {
                return element.options?.apiUuid === apiItem.uuid && element.options?.fieldType === 'output';
            });
            this.apiService.getDataFromBlob(response.body, apiItem.responseContentType)
                .then((data) => {
                    const valuesData = ApiService.getPropertiesRecursively(data, '', [], []);
                    const valuesObj = ApiService.getPropertiesKeyValueObject(valuesData.outputKeys, valuesData.values);
                    elements.forEach((element) => {
                        this.blockElementValueApply(element, valuesObj);
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    createErrorMessage(blob: Blob): void {
        console.log('createErrorMessage');
        this.apiService.getDataFromBlob(blob)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    blockElementValueApply(element: AppBlockElement, data: any): void {
        const fieldName = element.options?.fieldName;
        if (!fieldName) {
            return;
        }
        if (['image', 'audio'].includes(element.type)) {
            element.value = typeof data === 'string' ? data : null;
        } else {
            element.value = (element.prefixText || '')
                + (data[fieldName] || '')
                + (element.suffixText || '');
        }
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
