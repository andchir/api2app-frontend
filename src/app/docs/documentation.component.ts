import { ChangeDetectorRef, Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { ApplicationService } from '../services/application.service';
import { ApplicationItem } from '../apps/models/application-item.interface';
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { AppsModule } from "../apps/apps.module";

@Component({
    selector: 'app-docs',
    templateUrl: './documentation.component.html',
    standalone: true,
    styleUrls: [],
    imports: [
        NgForOf,
        NgIf,
        NgClass,
        AppsModule
    ],
    providers: [ApplicationService]
})
export class DocumentationComponent implements OnInit, OnDestroy {

    loading = false;
    itemUuid: string;
    data: ApplicationItem = ApplicationService.getDefault();
    tabIndex: number = 0;
    destroyed$: Subject<void> = new Subject();

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        protected cdr: ChangeDetectorRef,
        protected dataService: ApplicationService
    ){}

    ngOnInit(): void {
        switch (this.locale) {
            case 'en':
                this.itemUuid = '1c05b47c-948c-11ef-b839-525400f8f94f';
                break;
            case 'fr':
                this.itemUuid = 'da932582-948c-11ef-b839-525400f8f94f';
                break;
            case 'es':
                this.itemUuid = '36b8f70d-c88a-11f0-b01e-0050565bc892';
                break;
            default:
                this.itemUuid = '5eaba24c-89a5-11ef-ba06-525400f8f94f';
        }
        this.getData();
    }

    getData(): void {
        this.loading = true;
        this.dataService.getItemByUuidShared(this.itemUuid)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.data.name = $localize `Page not found`;
                    this.loading = false;
                }
            });
    }

    switchTab(tabIndex: number): void {
        this.tabIndex = tabIndex;
        this.cdr.detectChanges();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
