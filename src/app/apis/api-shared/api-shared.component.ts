import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';

import { ApiItem } from '../models/api-item.interface';
import { ApiService } from '../../services/api.service';
import { RouterEventsService } from '../../services/router-events.service';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { ModalService } from '../../services/modal.service';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
    selector: 'app-api-shared',
    templateUrl: './api-shared.component.html',
    styleUrls: ['./api-shared.component.css'],
    providers: []
})
export class ApiSharedComponent implements OnInit, OnDestroy {

    @ViewChild('dynamic', { read: ViewContainerRef }) private viewRef: ViewContainerRef;

    isLoggedIn: boolean = false;
    errors: {[name: string]: string[]} = {};
    message: string = '';
    messageType: 'error'|'success' = 'error';
    loading: boolean = false;
    submitted: boolean = false;
    needBackButton: boolean = false;

    itemUuid: string;
    data: ApiItem = ApiService.getDefault();
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected apiService: ApiService,
        protected routerEventsService: RouterEventsService,
        protected modalService: ModalService,
        private tokenStorageService: TokenStorageService
    ) {}

    ngOnInit(): void {
        this.isLoggedIn = !!this.tokenStorageService.getToken();
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

    cloneItem(): void {
        if (!this.data?.uuid) {
            return;
        }
        const initialData = {
            message: $localize `Are you sure you want to clone this API?`,
            isActive: true
        };
        this.modalService.showDynamicComponent(this.viewRef, ConfirmComponent, initialData)
            .pipe(take(1))
            .subscribe({
                next: (reason) => {
                    if (reason === 'confirmed') {
                        this.loading = true;
                        this.apiService.cloneItem(this.data.uuid)
                            .pipe(takeUntil(this.destroyed$))
                            .subscribe({
                                next: (res) => {
                                    if (res.success) {
                                        this.router.navigate(['apis', 'personal']);
                                    } else {
                                        if (res['detail']) {
                                            this.message = res['detail'];
                                            this.messageType = 'error';
                                        }
                                        this.loading = false;
                                    }
                                },
                                error: (err) => {
                                    if (err.detail) {
                                        this.message = err.detail;
                                        this.messageType = 'error';
                                    }
                                    this.loading = false;
                                }
                            });
                    }
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
