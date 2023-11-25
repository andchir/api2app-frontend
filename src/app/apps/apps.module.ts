import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { authInterceptorProviders } from '../helpers/auth.interceptor';
import { AppsRoutingModule } from './apps-routing.module';
import { ListComponent } from './list/list.component';
import { ApiService } from '../services/api.service';
import { ApplicationsListSharedComponent } from './list/shared/shared.component';
import { ApplicationsListPersonalComponent } from './list/personal/personal.component';
import {SharedModule} from "../shared.module";

@NgModule({
    declarations: [
        ListComponent,
        ApplicationsListSharedComponent,
        ApplicationsListPersonalComponent
    ],
    imports: [
        CommonModule,
        AppsRoutingModule,
        SharedModule
    ],
    providers: [authInterceptorProviders, ApiService]
})
export class AppsModule {
}
