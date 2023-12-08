import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

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
    templateUrl: './app-action.component.html'
})
export class AppActionComponent implements OnInit, OnDestroy {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    selectedUuid: string | null = null;
    elementType: AppBlockElementType;
    selectedApi: ApiItem;
    selectedFieldName: string | null = null;
    selectedFieldType: string | null = null;
    items$: Observable<ApiItem[]>;
    loading = false;
    submitted = false;
    searchInput$ = new Subject<string>();
    inputFields: string[] = [];
    outputFields: string[] = [];
    destroyed$: Subject<void> = new Subject();

    constructor(
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
                distinctUntilChanged(),
                filter(input => !!input),
                debounceTime(700),
                tap(() => this.loading = true),
                switchMap(term => this.dataService.searchItems(term).pipe(
                    map(res => res.results),
                    catchError(() => of([])),
                    tap(() => this.loading = false)
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
                    this.getApiOptions();
                },
                error: (err) => {
                    console.log(err);
                    this.loading = false;
                }
            });
    }

    getApiOptions(): void {
        if (!this.selectedApi || this.elementType === 'button') {
            return;
        }
        if (this.selectedApi.bodyDataSource === 'fields') {
            this.inputFields = this.selectedApi.bodyFields.map((item) => {
                return !item.hidden ? item.name : '';
            });
            this.inputFields = this.inputFields.filter((name) => {
                return name;
            });
        }
        if (this.selectedApi.responseContentType === 'json' && this.selectedApi.responseBody) {
            const body = typeof this.selectedApi.responseBody === 'string' ? JSON.parse(this.selectedApi.responseBody) : {};
            if (Array.isArray(body)) {

            } else {
                for (let prop in body) {
                    this.outputFields.push(prop);
                }
            }
        }
    }

    selectField(fieldName: string, fieldType: string): void{
        if (this.selectedFieldName === fieldName && this.selectedFieldType === fieldType) {
            this.selectedFieldName = null;
            this.selectedFieldType = null;
            return;
        }
        this.selectedFieldName = fieldName;
        this.selectedFieldType = fieldType;
    }

    onSearchCleared(): void {
        this.selectedUuid = '';
        this.selectedApi = null;
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
