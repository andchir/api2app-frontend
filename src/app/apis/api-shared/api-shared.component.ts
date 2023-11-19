import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { ApiItem } from '../models/api-item.interface';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-api-shared',
    templateUrl: './api-shared.component.html',
    styleUrls: ['./api-shared.component.css'],
    providers: [ApiService]
})
export class ApiSharedComponent implements OnInit, OnDestroy {

    errors: {[name: string]: string[]} = {};
    message: string = '';
    messageType: 'error'|'success' = 'error';
    loading = false;
    submitted = false;

    itemUuid: string;
    data: ApiItem = ApiService.getDefault();
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.itemUuid = this.route.snapshot.paramMap.get('uuid');
        if (this.itemUuid) {
            this.getData();
        }
    }

    getData(): void {
        this.apiService.getItemByUuid(this.itemUuid)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.loading = false;
                },
                error: (err) => {
                    this.errors = err;
                    this.loading = false;
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
                    this.loading = false;
                    this.submitted = false;
                    this.router.navigate(['/apis']);
                },
                error: (err) => {
                    this.errors = err;
                    this.message = 'Please correct the errors.';
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

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
