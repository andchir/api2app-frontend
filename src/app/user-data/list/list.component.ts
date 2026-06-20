import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { BehaviorSubject, debounceTime, skip, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ListAbstractComponent } from '../../list.component.abstract';
import { UserDataService } from '../services/user-data.service';
import { CustomTable } from '../models/custom-table.interface';

@Component({
    selector: 'app-user-data-list',
    templateUrl: './list.component.html',
    styleUrls: []
})
export class UserDataListComponent extends ListAbstractComponent<CustomTable> implements OnInit, OnDestroy {

    searchInput = '';
    searchInput$ = new BehaviorSubject<string>('');

    constructor(
        @Inject(LOCALE_ID) locale: string,
        route: ActivatedRoute,
        router: Router,
        authService: AuthService,
        dataService: UserDataService
    ) {
        super(locale, route, router, authService, dataService);
        this.perPage = 16;
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.searchInput$
            .pipe(skip(1), debounceTime(700), takeUntil(this.destroyed$))
            .subscribe((search) => {
                this.onSearchUpdate(search);
            });
    }

    getData(): void {
        this.loading = true;
        this.dataService.getList(this.currentPage, this.searchWord)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.items = res.results;
                    this.totalRecords = res.count;
                    this.onDataLoaded();
                },
                error: (err) => {
                    this.message = this.getServerDetailMessage(err);
                    this.messageType = 'error';
                    this.loading = false;
                }
            });
    }

    override deleteItemConfirmed(): void {
        if (!this.selectedId) {
            return;
        }
        this.isDeleteAction = false;
        const itemId = this.selectedId;
        this.loading = true;
        this.dataService.deleteItem(itemId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.selectionClear();
                    this.getData();
                },
                error: (err) => {
                    this.message = this.getServerDetailMessage(err);
                    this.messageType = 'error';
                    this.loading = false;
                }
            });
    }

    override onQueryParamsChange(params: Params): void {
        this.searchInput = params['search'] || '';
        super.onQueryParamsChange(params);
    }

    onSearchKeyUp(event: Event|KeyboardEvent): void {
        this.searchInput$.next((event.target as HTMLInputElement).value);
    }

    onSearchUpdate(search: string): void {
        const queryParams: Params = {};
        const value = search.trim();
        if (value) {
            queryParams['search'] = value;
        }
        this.router.navigate(
            [],
            {
                relativeTo: this.route,
                queryParams
            }
        );
    }

    getFieldsCount(item: CustomTable): number {
        if (typeof item.fields_count === 'number') {
            return item.fields_count;
        }
        return item.fields ? item.fields.length : 0;
    }

    private getServerDetailMessage(err: any): string {
        if (err?.detail) {
            return Array.isArray(err.detail) ? err.detail.join(' ') : String(err.detail);
        }
        return $localize `Error.`;
    }
}
