import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { iif, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ApplicationItem } from '../../models/application-item.interface';
import { ListAbstractComponent } from '../../../list.component.abstract';
import { ApplicationService } from '../../../services/application.service';

@Component({
    selector: 'app-apps-list-shared',
    templateUrl: './shared.component.html',
    styleUrls: []
})
export class ApplicationsListSharedComponent extends ListAbstractComponent<ApplicationItem> implements OnInit, OnDestroy {

    constructor(
        @Inject(LOCALE_ID) locale: string,
        route: ActivatedRoute,
        router: Router,
        authService: AuthService,
        dataService: ApplicationService
    ) {
        super(locale, route, router, authService, dataService);
    }

    getData(): void {
        this.loading = true;
        this.dataService.getListShared(this.currentPage, this.searchWord)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.items = res.results;
                    this.totalRecords = res.count;
                    this.onDataLoaded();
                },
                error: (err) => {
                    // console.log(err);
                    if (err.detail) {
                        this.message = err.detail;
                        this.messageType = 'error';
                    }
                    this.loading = false;
                }
            });
    }

    viewItem(item: ApplicationItem): void {
        this.router.navigate(['/apps/shared/', item.uuid]);
    }

    viewSharedUrl(item: ApplicationItem): void {
        this.selectItem(item);
        this.isShareActive = true;
    }
}
