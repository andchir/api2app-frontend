import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { ApiItem } from '../models/api-item.interface';
import { ApiService } from '../../services/api.service';
import { RouterEventsService } from '../../services/router-events.service';

@Component({
    selector: 'app-api-shared',
    templateUrl: './api-shared.component.html',
    styleUrls: ['./api-shared.component.css'],
    providers: []
})
export class ApiSharedComponent implements OnInit, OnDestroy {

    errors: {[name: string]: string[]} = {};
    message: string = '';
    messageType: 'error'|'success' = 'error';
    loading = false;
    submitted = false;
    needBackButton = false;

    itemUuid: string;
    data: ApiItem = ApiService.getDefault();
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected apiService: ApiService,
        protected routerEventsService: RouterEventsService
    ) {}

    ngOnInit(): void {
        this.itemUuid = this.route.snapshot.paramMap.get('uuid');
        this.needBackButton = !!this.routerEventsService.getPreviousUrl();
        if (this.itemUuid) {
            this.getData();
        }
    }

    getData(): void {
        this.loading = true;
        this.apiService.getItemByUuidShared(this.itemUuid, true)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    if (!this.data.bodyFields) {
                        this.data.bodyFields = [];
                    }
                    if (!this.data.queryParams) {
                        this.data.queryParams = [];
                    }
                    if (!this.data.headers) {
                        this.data.headers = [];
                    }
                    this.loading = false;
                },
                error: (err) => {
                    this.errors = err;
                    this.loading = false;
                }
            });
    }

    deleteErrorMessages(name: string) {
        if (this.errors[name]) {
            delete this.errors[name];
        }
    }

    navigateBack(event?: MouseEvent) {
        if (event) {
            event.preventDefault();
        }
        this.router.navigate([this.routerEventsService.getPreviousUrl()]);
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
