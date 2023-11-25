import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { takeUntil } from 'rxjs';

import { ApiService } from '../../../services/api.service';
import { ApiItem } from '../../models/api-item.interface';
import { AuthService } from '../../../services/auth.service';
import { TokenStorageService } from '../../../services/token-storage.service';
import { ListSharedComponent} from '../shared/shared.component';

@Component({
    selector: 'app-apis-list-personal',
    templateUrl: './personal.component.html',
    styleUrls: [],
    providers: []
})
export class ListPersonalComponent extends ListSharedComponent implements OnInit, OnDestroy {

    constructor(
        router: Router,
        authService: AuthService,
        dataService: ApiService,
        private tokenStorageService: TokenStorageService
    ) {
        super(router, authService, dataService);
    }

    override ngOnInit(): void {
        if (this.userSubject$.getValue()) {
            this.getData(false);
        }
    }

    override viewItem(item: ApiItem): void {
        this.router.navigate(['/apis/edit/', item.id]);
    }

    deleteItem(apiItem: ApiItem) {
        this.selectItem(apiItem);
        this.isDeleteAction = true;
    }

    shareItem(apiItem: ApiItem): void {
        this.selectItem(apiItem);
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
        this.dataService.deleteItem(itemId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.selectionClear();
                    this.getData(false);
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
        this.dataService.patch(this.selectedId, {shared})
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.getData(false);
                },
                error: (err) => {
                    this.loading = false;
                }
            });
    }

    closeConfirmModal(): void {
        this.selectionClear();
        this.isDeleteAction = false;
    }
}
