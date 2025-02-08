import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';

import { ApiItem } from '../models/api-item.interface';
import { ApiService } from '../../services/api.service';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { ModalService } from '../../services/modal.service';

@Component({
    selector: 'app-api-create',
    templateUrl: './api-create.component.html',
    styleUrls: ['./api-create.component.css'],
    providers: []
})
export class ApiCreateComponent implements OnInit, OnDestroy {

    @ViewChild('dynamic', { read: ViewContainerRef }) private viewRef: ViewContainerRef;

    errors: {[name: string]: string[]} = {};
    message: string = '';
    messageType: 'error'|'success' = 'error';
    loading = false;
    submitted = false;
    senderValue = 'browser';

    isSettingsActive: boolean = false;
    itemId: number = 0;
    data: ApiItem = ApiService.getDefault();
    destroyed$: Subject<void> = new Subject();

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        protected route: ActivatedRoute,
        protected router: Router,
        protected modalService: ModalService,
        protected apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.itemId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.itemId) {
            this.getData();
        }
    }

    getData(): void {
        this.apiService.getItem(this.itemId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    if (!this.data.queryParams || this.data.queryParams.length === 0) {
                        this.data.queryParams = [{name: '', value: ''}];
                    }
                    if (!this.data.bodyFields || this.data.bodyFields.length === 0) {
                        this.data.bodyFields = [{name: '', value: ''}];
                    }
                    if (!this.data.headers || this.data.headers.length === 0) {
                        this.data.headers = [{name: '', value: ''}];
                    }
                    if (res.sender) {
                        this.senderValue = res.sender;
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
                                    this.router.navigate(['apis', 'personal']);
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

    saveData(): void {
        this.message = '';
        this.errors = {};
        this.loading = true;
        this.submitted = true;
        this.apiService.updateItem(this.data)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.itemId = res.id;
                    this.data.id = this.itemId;
                    this.loading = false;
                    this.submitted = false;
                    this.message = $localize `Saved successfully.`;
                    this.messageType = 'success';
                },
                error: (err) => {
                    this.errors = err;
                    if (this.errors && typeof this.errors === 'object') {
                        let message = '';
                        Object.keys(this.errors).forEach((key) => {
                            message += (message ? '\n' : '') + `${key}: ` + this.errors[key].join(' ');
                        });
                        this.message = message;
                    } else {
                        this.message = 'Please correct the errors.';
                    }
                    this.messageType = 'error';
                    this.loading = false;
                    this.submitted = false;
                }
            });
    }

    deleteErrorMessages(name: string) {
        if (this.errors[name]) {
            delete this.errors[name];
        }
    }

    onUrlEnter(url: string): void {
        if (!this.data.name) {
            this.data.name = url.replace('http://', '')
                .replace('https://', '')
                .replace('/', ' - ');
        }
    }

    onSenderChange(sender: string) {
        this.senderValue = sender;
    }

    apiSettingsToggle(): void {
        this.isSettingsActive = !this.isSettingsActive;
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
