import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
        router: Router,
        authService: AuthService,
        dataService: ApplicationService
    ) {
        super(router, authService, dataService);
    }

    getData(shared = true): void {
        this.loading = true;
        iif(() => shared,
            this.dataService.getListShared(),
            this.dataService.getList()
        )
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.items = res.results;
                    this.onDataLoaded();
                },
                error: (err) => {
                    console.log(err);
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
