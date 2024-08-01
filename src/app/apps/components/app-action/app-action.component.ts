import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';

import {
    Observable,
    Subject,
    catchError,
    concat,
    debounceTime,
    distinctUntilChanged,
    map,
    of,
    takeUntil,
    tap
} from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

import { ApiItem } from '../../../apis/models/api-item.interface';
import { ApiService } from '../../../services/api.service';
import { ApplicationService } from '../../../services/application.service';
import {AppBlockElementType} from "../../models/app-block.interface";

@Component({
    selector: 'app-element-action',
    templateUrl: './app-action.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppActionComponent implements OnInit, OnDestroy {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    selectedUuid: string | null = null;
    elementType: AppBlockElementType;
    selectedApi: ApiItem;
    selectedFieldName: string | number | null = null;
    selectedFieldType: 'input' | 'output' | 'params' | 'headers' | 'url' | number | null = null;
    actionType: 'input'|'output';
    loading = false;
    submitted = false;
    urlParts: string[] = [];
    inputFields: string[] = [];
    inputParams: string[] = [];
    inputHeaders: string[] = [];
    outputFields: string[] = [];
    items$: Observable<ApiItem[]>;
    searchInput$ = new Subject<string>();
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected cdr: ChangeDetectorRef,
        protected dataService: ApiService,
        protected applicationService: ApplicationService
    ) {}

    ngOnInit(): void {
        this.loadItems();
        if (this.selectedUuid) {
            this.onApiSelected();
        }
    }

    submit(): void {
        this.close.emit('submit');
    }

    closeModal(): void {
        this.close.emit('close');
    }

    private loadItems() {
        this.items$ = concat(
            of([]),
            this.searchInput$.pipe(
                takeUntil(this.destroyed$),
                distinctUntilChanged(),
                filter(input => !!input),
                debounceTime(700),
                tap(() => this.loading = true),
                switchMap(term => this.dataService.searchItems(term).pipe(
                    map(res => res.results),
                    catchError(() => of([])),
                    tap(() => {
                        this.loading = false;
                        this.cdr.detectChanges();
                    })
                ))
            )
        );
    }

    onApiSelected(): void {
        if (!this.selectedUuid) {
            return;
        }
        this.inputFields = [];
        this.outputFields = [];
        this.loading = true;
        this.cdr.detectChanges();
        this.dataService.getItemByUuid(this.selectedUuid)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.selectedApi = res;
                    this.items$
                        .pipe(take(1))
                        .subscribe({
                            next: (items) => {
                                if (items.length === 0) {
                                    this.items$ = of([res]);
                                }
                            }
                        });
                    this.loading = false;
                    this.cdr.detectChanges();
                    this.getApiOptions();
                },
                error: (err) => {
                    console.log(err);
                    this.loading = false;
                }
            });
    }

    getApiOptions(): void {
        this.inputFields = [];
        if (!this.selectedApi || ['button'].includes(this.elementType) && this.actionType === 'input') {
            this.inputFields.push('submit');
            this.cdr.detectChanges();
            return;
        }
        this.urlParts = [];
        if (this.actionType === 'input') {
            if (this.selectedApi.requestUrl) {
                const tmp = this.selectedApi.requestUrl.split('/');
                this.urlParts.push(`${tmp[0]}//${tmp[2]}`);
                tmp.splice(0, 3);
                this.urlParts = [...this.urlParts, ...tmp];
            }

            // Input fields
            if (this.selectedApi.bodyDataSource === 'fields') {
                this.inputFields = this.getArrayValues('bodyFields');
            }
            const rawFields = this.dataService.getRawDataFields(this.selectedApi);
            let isRawData = (this.selectedApi.bodyDataSource === 'raw' && this.selectedApi.bodyContent && this.selectedApi.requestContentType === 'json') || rawFields.length > 0;
            if (isRawData) {
                const bodyContent = typeof this.selectedApi.bodyContent === 'string' ? JSON.parse(this.selectedApi.bodyContent) : {};
                this.inputFields = [...this.inputFields, ...ApiService.getPropertiesRecursively(bodyContent).outputKeys];
            }
            this.inputFields.unshift('value');

            // Input params
            this.inputParams = this.getArrayValues('queryParams');

            // Input headers
            this.inputHeaders = this.getArrayValues('headers');
        }

        if (this.actionType === 'output') {
            // Output fields
            if (this.selectedApi.responseContentType === 'json' && this.selectedApi.responseBody) {
                const responseBody = typeof this.selectedApi.responseBody === 'string' ? JSON.parse(this.selectedApi.responseBody) : {};
                this.outputFields = ApiService.getPropertiesRecursively(responseBody).outputKeys;
            }
            this.outputFields.unshift('value');
        }
        this.cdr.detectChanges();
    }

    selectField(fieldName: string|number, fieldType: 'input' | 'output' | 'params' | 'headers' | 'url' | null): void{
        if (this.selectedFieldName === fieldName && this.selectedFieldType === fieldType) {
            this.selectedFieldName = null;
            this.selectedFieldType = null;
            this.cdr.detectChanges();
            return;
        }
        this.selectedFieldName = fieldName;
        this.selectedFieldType = fieldType;
        this.cdr.detectChanges();
    }

    getArrayValues(inputKey: string, targetKey: string = 'name'): string[] {
        if (!this.selectedApi[inputKey]) {
            return [];
        }
        const output = this.selectedApi[inputKey].map((item) => {
            return !item.hidden ? item[targetKey] : '';
        });
        return output.filter((name) => {
            return name;
        });
    }

    getRawDataFields(inputKey: string): string[] {
        if (!this.selectedApi[inputKey]) {
            return [];
        }
        const output = this.selectedApi[inputKey].map((item) => {
            return !item.hidden && item.value === '[RAW]' ? item['name'] : '';
        });
        return output.filter((name) => {
            return name;
        });
    }

    onSearchCleared(): void {
        this.selectedUuid = '';
        this.selectedApi = null;
        this.loadItems();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
