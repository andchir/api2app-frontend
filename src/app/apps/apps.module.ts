import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { authInterceptorProviders } from '../helpers/auth.interceptor';
import { SharedModule } from '../shared.module';
import { AppsRoutingModule } from './apps-routing.module';
import { ListComponent } from './list/list.component';
import { ApplicationsListSharedComponent } from './list/shared/shared.component';
import { ApplicationsListPersonalComponent } from './list/personal/personal.component';
import { ApplicationCreateComponent } from './app-create/app-create.component';
import { ApplicationService } from '../services/application.service';
import { AppBlockElementComponent } from './components/app-block-element/app-block-element.component';
import { ApplicationSharedComponent } from './app-shared/app-shared.component';

@NgModule({
    declarations: [
        ListComponent,
        ApplicationsListSharedComponent,
        ApplicationsListPersonalComponent,
        ApplicationCreateComponent,
        ApplicationSharedComponent,
        AppBlockElementComponent
    ],
    imports: [
        CommonModule,
        AppsRoutingModule,
        SharedModule
    ],
    providers: [authInterceptorProviders, ApplicationService]
})
export class AppsModule {
}
