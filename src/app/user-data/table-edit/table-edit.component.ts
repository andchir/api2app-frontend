import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';

import { CustomTable } from '../models/custom-table.interface';
import { CustomTableField } from '../models/custom-table-field.interface';
import { UserDataService } from '../services/user-data.service';

@Component({
    selector: 'app-user-data-table-edit',
    templateUrl: './table-edit.component.html',
    styleUrls: []
})
export class UserDataTableEditComponent implements OnInit, OnDestroy {

    itemId = 0;
    data: CustomTable = UserDataTableEditComponent.getDefaultTable();
    fieldTypes = [
        {name: 'string', title: $localize`:@@UserDataFieldTypeString:String`},
        {name: 'text', title: $localize`:@@UserDataFieldTypeText:Text`},
        {name: 'integer', title: $localize`:@@UserDataFieldTypeInteger:Integer`},
        {name: 'float', title: $localize`:@@UserDataFieldTypeFloat:Float`},
        {name: 'boolean', title: $localize`:@@UserDataFieldTypeBoolean:Boolean`},
        {name: 'date', title: $localize`:@@UserDataFieldTypeDate:Date`},
        {name: 'datetime', title: $localize`:@@UserDataFieldTypeDateTime:DateTime`},
        {name: 'json', title: $localize`:@@UserDataFieldTypeJson:JSON`},
        {name: 'file', title: $localize`:@@UserDataFieldTypeFile:File`}
    ];
    errors: {[name: string]: string[]} = {};
    message = '';
    messageType: 'error'|'success' = 'error';
    loading = false;
    submitted = false;
    createApiLoading = false;
    accessKeyVisible = false;
    hiddenAccessKey = '************************';
    showAccessKeyLabel = $localize`:@@UserDataShowAccessKey:Show access key`;
    hideAccessKeyLabel = $localize`:@@UserDataHideAccessKey:Hide access key`;
    selectedField: CustomTableField = null;
    isDeleteFieldAction = false;
    isCreateApiAction = false;
    destroyed$: Subject<void> = new Subject();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userDataService: UserDataService
    ) {}

    static getDefaultTable(): CustomTable {
        return {
            id: 0,
            date_created: '',
            date_updated: '',
            title: '',
            name: '',
            description: '',
            fields: []
        };
    }

    static getDefaultField(orderIndex = 0): CustomTableField {
        return {
            name: '',
            column_name: '',
            field_type: 'string',
            required: true,
            default_value: null,
            max_length: 255,
            order_index: orderIndex
        };
    }

    ngOnInit(): void {
        this.itemId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.itemId) {
            this.getData();
        } else {
            this.addField();
        }
    }

    get isNewItem(): boolean {
        return !this.data.id;
    }

    getData(): void {
        this.loading = true;
        this.userDataService.getItem(this.itemId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.data.fields = this.data.fields || [];
                    this.loading = false;
                },
                error: (err) => {
                    this.errors = this.normalizeErrors(err);
                    this.message = this.getErrorMessage(this.errors);
                    this.messageType = 'error';
                    this.loading = false;
                }
            });
    }

    addField(): void {
        this.data.fields = this.data.fields || [];
        this.data.fields.push(UserDataTableEditComponent.getDefaultField(this.data.fields.length));
    }

    deleteField(field: CustomTableField): void {
        if (!field.id) {
            this.data.fields = this.data.fields.filter((item) => item !== field);
            this.reorderFields();
            return;
        }
        this.selectedField = field;
        this.isDeleteFieldAction = true;
    }

    deleteFieldConfirmed(): void {
        if (!this.selectedField?.id || !this.data.id) {
            return;
        }
        this.loading = true;
        this.isDeleteFieldAction = false;
        this.userDataService.deleteField(this.data.id, this.selectedField.id)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.selectedField = null;
                    this.getData();
                },
                error: (err) => {
                    this.errors = this.normalizeErrors(err);
                    this.message = this.getErrorMessage(this.errors);
                    this.messageType = 'error';
                    this.loading = false;
                }
            });
    }

    createApiItem(): void {
        if (!this.data.id || this.createApiLoading) {
            return;
        }
        this.isCreateApiAction = true;
    }

    createApiItemConfirmed(): void {
        if (!this.data.id || this.createApiLoading) {
            return;
        }
        this.isCreateApiAction = false;
        this.message = '';
        this.errors = {};
        this.createApiLoading = true;
        this.userDataService.createApiItem(this.data.id)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.message = $localize`:@@UserDataApiCreated:API configurations created successfully.`;
                    this.messageType = 'success';
                    this.createApiLoading = false;
                },
                error: (err) => {
                    this.errors = this.normalizeErrors(err);
                    this.message = this.getErrorMessage(this.errors);
                    this.messageType = 'error';
                    this.createApiLoading = false;
                }
            });
    }

    saveData(): void {
        if (!this.data.title?.trim()) {
            this.errors = {title: ['Title is required.']};
            this.message = $localize `Please correct the errors.`;
            this.messageType = 'error';
            return;
        }

        this.message = '';
        this.errors = {};
        this.loading = true;
        this.submitted = true;

        const isNewItem = this.isNewItem;
        const payload = this.createPayload();

        const request$ = isNewItem
            ? this.userDataService.postItem(payload as CustomTable)
            : this.userDataService.patch(this.data.id, {
                title: payload.title,
                description: payload.description
            }).pipe(
                switchMap((res) => {
                    const newFields = (this.data.fields || []).filter((field) => !field.id && field.name.trim());
                    if (newFields.length === 0) {
                        return of(res);
                    }
                    return forkJoin(newFields.map((field) => this.userDataService.addField(this.data.id, this.cleanField(field))))
                        .pipe(switchMap(() => this.userDataService.getItem(this.data.id)));
                })
            );

        request$
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.data.fields = this.data.fields || [];
                    this.itemId = res.id;
                    this.loading = false;
                    this.submitted = false;
                    this.message = $localize `Saved successfully.`;
                    this.messageType = 'success';
                    if (isNewItem) {
                        this.router.navigate(['user-data', 'edit', String(res.id)]);
                    }
                },
                error: (err) => {
                    this.errors = this.normalizeErrors(err);
                    this.message = this.getErrorMessage(this.errors);
                    this.messageType = 'error';
                    this.loading = false;
                    this.submitted = false;
                }
            });
    }

    createPayload(): Partial<CustomTable> {
        const fields = (this.data.fields || [])
            .filter((field) => field.name.trim())
            .map((field, index) => this.cleanField(field, index));
        return {
            title: this.data.title.trim(),
            name: this.data.name?.trim() || this.data.title.trim(),
            description: this.data.description || '',
            fields
        };
    }

    cleanField(field: CustomTableField, index: number = field.order_index): CustomTableField {
        const cleanField = Object.assign({}, field, {
            name: field.name.trim(),
            column_name: field.column_name.trim(),
            order_index: index
        });
        if (!['string', 'file'].includes(cleanField.field_type)) {
            cleanField.max_length = null;
        }
        delete cleanField.id;
        delete cleanField.table;
        return cleanField;
    }

    reorderFields(): void {
        (this.data.fields || []).forEach((field, index) => {
            field.order_index = index;
        });
    }

    deleteErrorMessages(name: string): void {
        if (this.errors[name]) {
            delete this.errors[name];
        }
    }

    private normalizeErrors(err: any): {[name: string]: string[]} {
        if (!err || typeof err !== 'object') {
            return {detail: [String(err || 'Error')]};
        }
        const errors: {[name: string]: string[]} = {};
        Object.keys(err).forEach((key) => {
            errors[key] = Array.isArray(err[key]) ? err[key] : [String(err[key])];
        });
        return errors;
    }

    private getErrorMessage(errors: {[name: string]: string[]}): string {
        return errors['detail']?.join(' ') || $localize `Please correct the errors.`;
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
