import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { takeUntil } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { ApplicationItem } from '../../models/application-item.interface';
import { ListAbstractComponent } from '../../../list.component.abstract';
import { ApplicationService } from '../../../services/application.service';

@Component({
    selector: 'app-apps-list-personal',
    templateUrl: './personal.component.html',
    styleUrls: []
})
export class ApplicationsListPersonalComponent extends ListAbstractComponent<ApplicationItem> implements OnInit, OnDestroy {

    constructor(
        route: ActivatedRoute,
        router: Router,
        authService: AuthService,
        dataService: ApplicationService
    ) {
        super(route, router, authService, dataService);
    }

    getData(): void {
        this.loading = true;
        this.dataService.getList(this.currentPage, this.searchWord)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.items = res.results;
                    this.totalRecords = res.count;
                    this.onDataLoaded();
                },
                error: (err) => {
                    console.log(err);
                    this.loading = false;
                }
            });
    }

    viewItem(item: ApplicationItem): void {
        this.router.navigate(['/apps/edit/', item.id]);
    }

    viewSharedUrl(item: ApplicationItem): void {
        this.selectItem(item);
        this.isShareActive = true;
    }

    downloadItem(item: ApplicationItem): void {
        this.loading = true;
        this.dataService.downloadItem(item.uuid)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    if (res.success) {
                        window.open(`/static/export/${res.file_name}`, '_blank');
                    }
                },
                error: (err) => {
                    console.log(err);
                    this.loading = false;
                }
            });
    }
}
