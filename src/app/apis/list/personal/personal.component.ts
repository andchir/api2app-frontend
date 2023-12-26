import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { ApiItem } from '../../models/api-item.interface';
import { AuthService } from '../../../services/auth.service';
import { TokenStorageService } from '../../../services/token-storage.service';
import { ListSharedComponent} from '../shared/shared.component';
import {takeUntil} from "rxjs";

@Component({
    selector: 'app-apis-list-personal',
    templateUrl: './personal.component.html',
    styleUrls: [],
    providers: []
})
export class ListPersonalComponent extends ListSharedComponent implements OnInit, OnDestroy {

    constructor(
        route: ActivatedRoute,
        router: Router,
        authService: AuthService,
        dataService: ApiService,
        private tokenStorageService: TokenStorageService
    ) {
        super(route, router, authService, dataService);
    }

    override getData(shared: boolean = false) {
        super.getData(shared);
    }

    override viewItem(item: ApiItem): void {
        this.router.navigate(['/apis/edit/', item.id]);
    }
}
