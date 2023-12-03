import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {BehaviorSubject, Subject} from 'rxjs';

import { AuthService } from './services/auth.service';
import { User } from './apis/models/user.interface';
import { DataService } from './services/data.service.abstract';

@Component({
    template: ''
})
export abstract class ListAbstractComponent<T extends {id: number}> implements OnInit, OnDestroy {

    items: T[] = [];
    loading = false;
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

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}