import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { ApiItem } from '../models/api-item.interface';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-api-create',
    templateUrl: './api-create.component.html',
    styleUrls: ['./api-create.component.css'],
    providers: []
})
export class ApiCreateComponent implements OnInit, OnDestroy {

    errors: {[name: string]: string[]} = {};
    message: string = '';
    messageType: 'error'|'success' = 'error';
    loading = false;
    submitted = false;

    itemId: number = 0;
    data: ApiItem = ApiService.getDefault();
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
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
                    this.router.navigate(['/apis', 'personal']);
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
