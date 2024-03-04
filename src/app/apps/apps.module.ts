import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgApexchartsModule } from 'ng-apexcharts';

import { authInterceptorProviders } from '../helpers/auth.interceptor';
import { SharedModule } from '../shared.module';
import { AppsRoutingModule } from './apps-routing.module';
import { ListAppsComponent } from './list/list.component';
import { ApplicationsListSharedComponent } from './list/shared/shared.component';
import { ApplicationsListPersonalComponent } from './list/personal/personal.component';
import { ApplicationCreateComponent } from './app-create/app-create.component';
import { AppBlockElementComponent } from './components/app-block-element/app-block-element.component';
import { ApplicationSharedComponent } from './app-shared/app-shared.component';
import { AppActionComponent } from './components/app-action/app-action.component';

import { ApplicationService } from '../services/application.service';
import { ApiService } from '../services/api.service';
import { ModalService } from '../services/modal.service';
import { ElementInputTextAreaComponent } from './components/elements/input-textarea.component';

@NgModule({
    declarations: [
        ListAppsComponent,
        ApplicationsListSharedComponent,
        ApplicationsListPersonalComponent,
        ApplicationCreateComponent,
        ApplicationSharedComponent,
        AppBlockElementComponent,
        AppActionComponent,

        ElementInputTextAreaComponent
    ],
    imports: [
        CommonModule,
        AppsRoutingModule,
        SharedModule,
        NgApexchartsModule
    ],
    providers: [ authInterceptorProviders, ApplicationService, ApiService, ModalService ]
})
export class AppsModule {
}
