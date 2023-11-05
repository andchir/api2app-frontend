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
        console.log(item);
        this.router.navigate(['/apis/', item.id]);
    }

    deleteItem(item: ApiItem) {
        this.selectedId = item.id;
        this.isDeleteAction = true;
    }

    deleteItemConfirmed(): void {
        console.log('deleteItemConfirmed', this.selectedId);
        this.closeConfirmModal();
    }

    closeConfirmModal(): void {
        this.selectedId = 0;
        this.isDeleteAction = false;
    }
}
