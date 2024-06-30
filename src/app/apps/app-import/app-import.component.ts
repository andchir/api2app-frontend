import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { ApplicationService } from '../../services/application.service';

@Component({
    selector: 'app-import-application',
    templateUrl: './app-import.component.html'
})
export class ApplicationImportComponent implements OnInit, OnDestroy {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    inputString: string;
    errorMessage = '';
    loading: boolean;
    destroyed$: Subject<void> = new Subject();

    constructor(
        private dataService: ApplicationService
    ) {}

    ngOnInit(): void {

    }

    closeModal(reason = 'close'): void {
        this.close.emit(reason);
    }

    submit() {
        if (!this.inputString) {
            return;
        }
        this.errorMessage = '';
        this.loading = true;
        this.dataService.importItem(this.inputString)
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
