import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { take} from 'rxjs/operators';

import { ApiService } from '../../../services/api.service';
import { ApiItem } from '../../models/api-item.interface';
import { AuthService } from '../../../services/auth.service';
import { TokenStorageService } from '../../../services/token-storage.service';
import { ListSharedComponent} from '../shared/shared.component';
import { ModalService } from '../../../services/modal.service';
import { ApiImportComponent } from '../../api-import/api-import.component';

@Component({
    selector: 'app-apis-list-personal',
    templateUrl: './personal.component.html',
    styleUrls: [],
    providers: []
})
export class ListPersonalComponent extends ListSharedComponent implements OnInit, OnDestroy {

    @ViewChild('dynamic', { read: ViewContainerRef })
    private viewRef: ViewContainerRef;

    constructor(
        route: ActivatedRoute,
        router: Router,
        authService: AuthService,
        dataService: ApiService,
        private tokenStorageService: TokenStorageService,
        private modalService: ModalService
    ) {
        super(route, router, authService, dataService);
    }

    override getData(shared: boolean = false) {
        super.getData(shared);
    }

    override viewItem(item: ApiItem): void {
        this.router.navigate(['/apis/edit/', item.id]);
    }

    showImportApiModal():void {
        console.log('showImportApiModal');

        const initialData = {};

        this.modalService.showDynamicComponent(this.viewRef, ApiImportComponent, initialData)
            .pipe(take(1))
            .subscribe({

            });
    }
}
