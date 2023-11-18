import {Component, OnInit} from '@angular/core';

import {Subject, takeUntil} from 'rxjs';

import {ApiService} from '../../services/api.service';
import {ApiItem} from '../models/api-item.interface';
import {Router} from "@angular/router";

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
    providers: [ApiService]
})
export class ListComponent implements OnInit {

    items: ApiItem[] = [];
    loading = false;
    isShareActive = false;
    isDeleteAction = false;
    selectedId = 0;
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected router: Router,
        protected apiService: ApiService
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
                },
                error: (err) => {
                    this.loading = false;
                }
            });
    }

    editItem(item: ApiItem): void {
        this.router.navigate(['/apis/edit/', item.id]);
    }

    deleteItem(item: ApiItem) {
        this.selectedId = item.id;
        this.isDeleteAction = true;
    }

    shareItem(item: ApiItem): void {
        this.selectedId = item.id;
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
                next: (res) => {
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
}
