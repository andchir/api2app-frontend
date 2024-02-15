import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { authInterceptorProviders } from '../helpers/auth.interceptor';
import { SharedModule } from '../shared.module';
import { ApisRoutingModule } from './apis-routing.module';
import { ListApisComponent } from './list/list.component';
import { ListPersonalComponent } from './list/personal/personal.component';
import { ListSharedComponent } from './list/shared/shared.component';
import { ApiCreateComponent } from './api-create/api-create.component';
import { ApiItemComponent } from './api-item/api-item.component';
import { ApiSharedComponent } from './api-shared/api-shared.component';
import { ApiService } from '../services/api.service';
import { ApiImportComponent } from './api-import/api-import.component';
import { ModalService } from '../services/modal.service';

@NgModule({
    declarations: [
        ListApisComponent,
        ListPersonalComponent,
        ListSharedComponent,
        ApiCreateComponent,
        ApiItemComponent,
        ApiSharedComponent,
        ApiImportComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ApisRoutingModule,
        SharedModule
    ],
    providers: [authInterceptorProviders, ApiService, ModalService]
})
export class ApisModule {
}
