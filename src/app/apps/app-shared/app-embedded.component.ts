import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    LOCALE_ID,
    OnDestroy,
    OnInit
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import { takeUntil } from 'rxjs';

import { ApplicationService } from '../../services/application.service';
import { ApiService } from '../../services/api.service';
import { ModalService } from '../../services/modal.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { environment } from '../../../environments/environment';
import { RouterEventsService } from '../../services/router-events.service';
import { ApplicationSharedComponent } from './app-shared.component';
import { VkBridgeService } from '../../services/vk-bridge.service';
import { AuthService } from '../../services/auth.service';

const APP_NAME = environment.appName;
declare const vkBridge: any;

@Component({
    selector: 'app-item-embedded',
    templateUrl: './app-shared.component.html',
    providers: [VkBridgeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationEmbeddedComponent extends ApplicationSharedComponent implements OnInit, OnDestroy {

    constructor(
        @Inject(LOCALE_ID) public locale: string,
        titleService: Title,
        cdr: ChangeDetectorRef,
        sanitizer: DomSanitizer,
        route: ActivatedRoute,
        router: Router,
        tokenStorageService: TokenStorageService,
        dataService: ApplicationService,
        apiService: ApiService,
        modalService: ModalService,
        routerEventsService: RouterEventsService,
        vkBridgeService: VkBridgeService,
        authService: AuthService
    ) {
        super(cdr, titleService, sanitizer, route, router, tokenStorageService, dataService, apiService, modalService,
            routerEventsService, vkBridgeService, authService);
    }

    override getData(): void {
        this.errors[this.itemUuid] = {};
        this.loading = true;
        this.dataService.getItemByUuidEmbedded(this.itemUuid)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.titleService.setTitle(`${this.data.name} - ${APP_NAME}`);
                    this.loading = false;
                    if (this.data.maintenance) {
                        this.maintenanceModalToggle();
                    }
                    this.createAppOptions();
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.data.name = $localize `Page not found`;
                    this.errors[this.itemUuid] = err;
                    this.loading = false;
                }
            });
    }
}
