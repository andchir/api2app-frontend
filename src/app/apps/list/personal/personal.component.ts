import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { takeUntil } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { ApplicationItem } from '../../models/application-item.interface';
import { ListAbstractComponent } from '../../../list.component.abstract';
import { ApplicationService } from '../../../services/application.service';

@Component({
    selector: 'app-apps-list-personal',
    templateUrl: './personal.component.html',
    styleUrls: []
})
export class ApplicationsListPersonalComponent extends ListAbstractComponent<ApplicationItem> implements OnInit, OnDestroy {

    isShareActive = false;

    constructor(
        router: Router,
        authService: AuthService,
        dataService: ApplicationService
    ) {
        super(router, authService, dataService);
    }

    getData(shared = true): void {
        // this.loading = true;
        // iif(() => shared,
        //     this.apiService.getListShared(),
        //     this.apiService.getList()
        // )
        //     .pipe(takeUntil(this.destroyed$))
        //     .subscribe({
        //         next: (res) => {
        //             this.items = res.results;
        //             this.loading = false;
        //             this.onDataLoaded();
        //         },
        //         error: (err) => {
        //             console.log(err);
        //             this.loading = false;
        //         }
        //     });
    }

    deleteItemConfirmed(): void {
        // if (!this.selectedId) {
        //     return;
        // }
        // this.isDeleteAction = false;
        // const itemId = this.selectedId;
        // // this.closeConfirmModal();
        // this.loading = true;
        // this.dataService.deleteItem(itemId)
        //     .pipe(takeUntil(this.destroyed$))
        //     .subscribe({
        //         next: () => {
        //             this.selectionClear();
        //             this.getData(false);
        //         },
        //         error: (err) => {
        //             this.loading = false;
        //         }
        //     });
    }

    viewItem(item: ApplicationItem): void {
        this.router.navigate(['/apis/shared/', item.uuid]);
    }

    viewSharedUrl(item: ApplicationItem): void {
        this.selectItem(item);
        this.isShareActive = true;
    }
}
