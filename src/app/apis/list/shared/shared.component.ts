import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

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

    constructor(
        route: ActivatedRoute,
        router: Router,
        authService: AuthService,
        dataService: ApiService
    ) {
        super(route, router, authService, dataService);
    }

    getData(shared = true): void {
        this.loading = true;
        iif(() => shared,
            this.dataService.getListShared(this.currentPage, this.searchWord),
            this.dataService.getList(this.currentPage, this.searchWord)
        )
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.items = res.results;
                    this.totalRecords = res.count;
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
