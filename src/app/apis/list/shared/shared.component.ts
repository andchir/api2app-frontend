import {Component, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';

import {iif, Subject, takeUntil} from 'rxjs';

import { ApiService } from '../../../services/api.service';
import { ApiItem } from '../../models/api-item.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-apis-list-shared',
    templateUrl: './shared.component.html',
    styleUrls: [],
    providers: []
})
export class ListSharedComponent implements OnInit, OnDestroy {

    items: ApiItem[] = [];
    loading = false;
    isShareActive = false;
    selectedId = 0;
    selectedItem: ApiItem;
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected router: Router,
        protected authService: AuthService,
        protected apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.getData();
    }

    getData(shared = true): void {
        this.loading = true;
        iif(() => shared,
            this.apiService.getListShared(),
            this.apiService.getList()
        )
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.items = res.results;
                    this.loading = false;
                    this.onDataLoaded();
                },
                error: (err) => {
                    console.log(err);
                    this.loading = false;
                }
            });
    }

    onDataLoaded(): void {
        if (this.selectedId && this.selectedItem) {
            const index = this.items.findIndex((item) => {
                return item.id === this.selectedId;
            });
            if (index > -1) {
                Object.assign(this.selectedItem, this.items[index]);
            }
        }
    }

    viewItem(item: ApiItem): void {
        this.router.navigate(['/apis/shared/', item.uuid]);
    }

    selectItem(targetItem: ApiItem): void {
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

    viewShareUrl(item: ApiItem): void {
        this.selectItem(item);
        this.isShareActive = true;
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
