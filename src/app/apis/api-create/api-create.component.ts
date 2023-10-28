import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { ApiItem } from '../models/api-item.interface';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-api-create',
    templateUrl: './api-create.component.html',
    styleUrls: ['./api-create.component.css'],
    providers: [ApiService]
})
export class ApiCreateComponent implements OnInit, OnDestroy {

    errors: {[name: string]: string[]} = {};
    loading = false;

    data: ApiItem = ApiService.getDefault();
    destroyed$: Subject<void> = new Subject();

    constructor(
        protected router: Router,
        protected apiService: ApiService
    ) {}

    ngOnInit(): void {

    }

    saveData(): void {
        console.log('saveData', this.data);
        // this.errors = {};
        // this.loading = true;
        // this.apiService.updateApiRecord(this.data)
        //     .pipe(takeUntil(this.destroyed$))
        //     .subscribe({
        //         next: (res) => {
        //             this.loading = false;
        //             this.router.navigate(['/apis']);
        //         },
        //         error: (err) => {
        //             this.errors = err;
        //             this.loading = false;
        //         }
        //     });
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
