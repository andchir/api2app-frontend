import {Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { take } from 'rxjs/operators';
import { takeUntil } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { ApplicationItem } from '../../models/application-item.interface';
import { ListAbstractComponent } from '../../../list.component.abstract';
import { ApplicationService } from '../../../services/application.service';
import { ModalService } from '../../../services/modal.service';
import { ApplicationImportComponent } from '../../app-import/app-import.component';

@Component({
    selector: 'app-apps-list-personal',
    templateUrl: './personal.component.html',
    styleUrls: []
})
export class ApplicationsListPersonalComponent extends ListAbstractComponent<ApplicationItem> implements OnInit, OnDestroy {

    @ViewChild('dynamic', { read: ViewContainerRef })
    private viewRef: ViewContainerRef;

    constructor(
        @Inject(LOCALE_ID) locale: string,
        route: ActivatedRoute,
        router: Router,
        authService: AuthService,
        dataService: ApplicationService,
        private modalService: ModalService
    ) {
        super(locale, route, router, authService, dataService);
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
                    // console.log(err);
                    this.loading = false;
                }
            });
    }

    showImportApiModal():void {
        const initialData = {};
        this.modalService.showDynamicComponent(this.viewRef, ApplicationImportComponent, initialData)
            .pipe(take(1))
            .pipe(take(1))
            .subscribe({
                next: (reason) => {
                    if (reason === 'submit') {
                        this.getData();
                    }
                },
                error: (err) => {

                }
            });
    }
}
