import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {BehaviorSubject, Subject, takeUntil} from 'rxjs';

import { AuthService } from './services/auth.service';
import { User } from './apis/models/user.interface';
import { DataService } from './services/data.service.abstract';
import {PaginatorState} from "./apps/models/paginator-state.interface";

@Component({
    template: ''
})
export abstract class ListAbstractComponent<T extends {id: number}> implements OnInit, OnDestroy {

    items: T[] = [];
    loading = false;
    perPage = 16;
    totalRecords = 0;
    currentPage = 1;
    selectedId = 0;
    selectedItem: T;
    isDeleteAction = false;
    isShareActive = false;
    userSubject$: BehaviorSubject<User>;
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected router: Router,
        protected authService: AuthService,
        protected dataService: DataService<T>
    ) {
        this.userSubject$ = this.authService.userSubject;
    }

    get baseUrl(): string {
        return `${window.location.protocol}//${window.location.host}`;
    }

    ngOnInit(): void {
        this.getData();
    }

    abstract getData()

    onDataLoaded(): void {
        this.loading = false;
        if (this.selectedId && this.selectedItem) {
            const index = this.items.findIndex((item) => {
                return item.id === this.selectedId;
            });
            if (index > -1) {
                Object.assign(this.selectedItem, this.items[index]);
            }
        }
    }

    deleteItem(item: T) {
        this.selectItem(item);
        this.isDeleteAction = true;
    }

    shareItem(item: T): void {
        this.selectItem(item);
        this.isShareActive = true;
    }

    selectItem(targetItem: T): void {
        this.selectedId = targetItem.id;
        const index = this.items.findIndex((item) => {
            return item.id === targetItem.id;
        });
        this.selectedItem = index > -1
            ? Object.assign({}, this.items[index])
            : null;
    }

    selectionClear(): void {
        this.selectedId = 0;
        this.selectedItem = null;
    }

    makeSharedConfirmed(shared: boolean): void {
        if (!this.selectedId) {
            return;
        }
        this.dataService.patch(this.selectedId, {shared, hidden: false})
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.getData();
                },
                error: (err) => {
                    this.loading = false;
                }
            });
    }

    makeHiddenConfirmed(hidden: boolean): void {
        if (!this.selectedId) {
            return;
        }
        this.dataService.patch(this.selectedId, {hidden})
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.getData();
                },
                error: (err) => {
                    this.loading = false;
                }
            });
    }

    deleteItemConfirmed(): void {
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
                    this.loading = false;
                }
            });
    }

    onPageChange(event: PaginatorState) {
        this.currentPage = event.page + 1;
        this.getData();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
