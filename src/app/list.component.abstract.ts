import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';

import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';

@Component({
    template: ''
})
export abstract class ListAbstractComponent<T extends {id: number}> implements OnInit, OnDestroy {

    items: T[] = [];
    loading = false;
    selectedId = 0;
    selectedItem: T;
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected router: Router,
        protected authService: AuthService,
        protected apiService: ApiService
    ) {}

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

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
