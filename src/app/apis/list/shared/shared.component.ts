import {Component, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';

import {iif, Subject, takeUntil} from 'rxjs';

import { ApiService } from '../../../services/api.service';
import { ApiItem } from '../../models/api-item.interface';
import { AuthService } from '../../../services/auth.service';
import { ListAbstractComponent } from '../../../list.component.abstract';

@Component({
    selector: 'app-apis-list-shared',
    templateUrl: './shared.component.html',
    styleUrls: [],
    providers: []
})
export class ListSharedComponent extends ListAbstractComponent<ApiItem> implements OnInit, OnDestroy {

    isShareActive = false;

    constructor(
        router: Router,
        authService: AuthService,
        apiService: ApiService
    ) {
        super(router, authService, apiService);
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
                    this.loading = false;
                    if (err === 'forbidden') {
                        this.navigateToLoginPage();
                    }
                }
            });
    }

    viewItem(item: ApiItem): void {
        this.router.navigate(['/apis/shared/', item.uuid]);
    }

    viewSharedUrl(item: ApiItem): void {
        this.selectItem(item);
        this.isShareActive = true;
    }

    navigateToLoginPage(): void {
        this.authService.navigateLogin();
    }
}
