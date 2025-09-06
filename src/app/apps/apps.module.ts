import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgApexchartsModule } from 'ng-apexcharts';
import { DragulaModule } from 'ng2-dragula';

import { authInterceptorProviders } from '../helpers/auth.interceptor';
import { SharedModule } from '../shared.module';
import { AppsRoutingModule } from './apps-routing.module';
import { ListAppsComponent } from './list/list.component';
import { ApplicationsListSharedComponent } from './list/shared/shared.component';
import { ApplicationsListPersonalComponent } from './list/personal/personal.component';
import { ApplicationCreateComponent } from './app-create/app-create.component';
import { AppBlockElementComponent } from './components/app-block-element/app-block-element.component';
import { ApplicationSharedComponent } from './app-shared/app-shared.component';
import { ApplicationEmbeddedComponent } from './app-shared/app-embedded.component';
import { AppActionComponent } from './components/app-action/app-action.component';

import { ApplicationService } from '../services/application.service';
import { ApiService } from '../services/api.service';
import { ModalService } from '../services/modal.service';
import { ElementInputTextComponent } from './components/elements/element-input-text.component';
import { ApplicationImportComponent } from './app-import/app-import.component';
import { RenameComponent } from '../shared/rename/rename.component';
import { TableElementComponent } from './components/elements/table-element.component';
import { SelectImageComponent } from './components/elements/select-image.component';
import { ProgressElementComponent } from './components/elements/progress-element.component';
import { ElementImageComponent } from './components/elements/element-image.component';
import {ImageComparisonComponent} from "./components/elements/image-comparison.component";

@NgModule({
    declarations: [
        ListAppsComponent,
        ApplicationsListSharedComponent,
        ApplicationsListPersonalComponent,
        ApplicationCreateComponent,
        ApplicationSharedComponent,
        ApplicationEmbeddedComponent,
        AppBlockElementComponent,
        AppActionComponent,
        ApplicationImportComponent,

        ElementInputTextComponent,
        RenameComponent
    ],
    imports: [
        CommonModule,
        AppsRoutingModule,
        SharedModule,
        NgApexchartsModule,
        TableElementComponent,
        SelectImageComponent,
        ProgressElementComponent,
        ElementImageComponent,
        DragulaModule.forRoot(),
        ImageComparisonComponent
    ],
    exports: [
        ApplicationSharedComponent
    ],
    providers: [authInterceptorProviders, ApplicationService, ApiService, ModalService]
})
export class AppsModule {
}
