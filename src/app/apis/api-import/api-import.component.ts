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
    inputLinkString: string;
    errorMessage = '';
    loading: boolean;
    destroyed$: Subject<void> = new Subject();

    constructor(
        private dataService: ApiService
    ) {}

    ngOnInit(): void {

    }

    closeModal(reason = 'close'): void {
        this.close.emit(reason);
    }

    submit() {
        if (!this.inputString && !this.inputLinkString) {
            return;
        }
        this.errorMessage = '';
        this.loading = true;
        this.dataService.importItem(this.inputString, this.inputLinkString)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this.closeModal('submit');
                    }
                    this.loading = false;
                },
                error: (err) => {
                    if (err.error) {
                        this.errorMessage = err.error;
                    }
                    this.loading = false;
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
