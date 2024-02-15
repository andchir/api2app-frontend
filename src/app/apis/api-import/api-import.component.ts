import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-import-api',
    templateUrl: './api-import.component.html'
})
export class ApiImportComponent implements OnInit, OnDestroy {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    inputString: string;
    loading: boolean;
    destroyed$: Subject<void> = new Subject();

    constructor(
        private dataService: ApiService
    ) {}

    ngOnInit(): void {

    }

    closeModal(): void {
        this.close.emit('close');
    }

    submit() {
        if (!this.inputString) {
            return;
        }
        this.loading = true;
        this.dataService.importItem(this.inputString)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    console.log(res);

                    this.loading = false;
                },
                error: (err) => {
                    this.loading = false;
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
