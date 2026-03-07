import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { ApiService, ImportApiItem } from '../../services/api.service';

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
    importApiItems: ImportApiItem[] = [];
    selectedNames: string[] = [];
    destroyed$: Subject<void> = new Subject();

    constructor(
        private dataService: ApiService
    ) {}

    ngOnInit(): void {

    }

    closeModal(reason = 'close'): void {
        this.close.emit(reason);
    }

    onImportItemClick(item: ImportApiItem, event?: MouseEvent): void {
        if (event) {
            event.stopPropagation();
        }
        const checked = event
            ? (event.target as HTMLInputElement).checked
            : !this.selectedNames.includes(item.name);
        if (checked) {
            if (!this.selectedNames.includes(item.name)) {
                this.selectedNames.push(item.name);
            }
        } else {
            const index = this.selectedNames.indexOf(item.name);
            if (index > -1) {
                this.selectedNames.splice(index, 1);
            }
        }
    }

    getImportList(): void {
        this.errorMessage = '';
        this.loading = true;
        this.dataService.getImportList(this.inputLinkString)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.importApiItems = res.apis
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

    submit() {
        if (this.inputLinkString && this.importApiItems.length === 0) {
            this.getImportList();
            return;
        }
        if (!this.inputString && !this.inputLinkString) {
            return;
        }
        this.errorMessage = '';
        this.loading = true;
        this.dataService.importItem(this.inputString, this.inputLinkString, this.selectedNames)
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
