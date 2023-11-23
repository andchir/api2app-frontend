import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { ApiItem } from '../models/api-item.interface';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
    providers: []
})
export class ListComponent implements OnInit {

    items: ApiItem[] = [];
    loading = false;
    isShareActive = false;
    isDeleteAction = false;
    selectedId = 0;
    selectedItem: ApiItem;
    destroyed$: Subject<void> = new Subject();

    constructor(
        private router: Router,
        private tokenStorageService: TokenStorageService,
        private apiService: ApiService
    ) {
    }

    ngOnInit(): void {
        this.getData();
    }

    getData(): void {
        this.loading = true;
        this.apiService.getList()
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.items = res.results;
                    this.loading = false;
                    this.onDataLoaded();
                },
                error: (err) => {
                    this.loading = false;
                    if (err === 'forbidden') {
                        this.navigateToLoginPage();
                    }
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

    editItem(item: ApiItem): void {
        this.router.navigate(['/apis/edit/', item.id]);
    }

    deleteItem(item: ApiItem) {
        this.selectedId = item.id;
        this.isDeleteAction = true;
    }

    shareItem(apiItem: ApiItem): void {
        this.selectedId = apiItem.id;
        const index = this.items.findIndex((item) => {
            return item.id === apiItem.id;
        });
        this.selectedItem = index > -1
            ? Object.assign({}, this.items[index])
            : null;
        this.isShareActive = true;
    }

    deleteItemConfirmed(): void {
        if (!this.selectedId) {
            return;
        }
        this.isDeleteAction = false;
        const itemId = this.selectedId;
        this.closeConfirmModal();
        this.loading = true;
        this.apiService.deleteItem(itemId)
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

    makeSharedConfirmed(shared: boolean): void {
        if (!this.selectedId) {
            return;
        }
        this.apiService.patch(this.selectedId, {shared})
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

    closeConfirmModal(): void {
        this.selectedId = 0;
        this.isDeleteAction = false;
    }

    navigateToLoginPage(): void {
        this.tokenStorageService.navigateLogin();
    }
}
