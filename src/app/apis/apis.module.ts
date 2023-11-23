import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared.module';
import { ApisRoutingModule } from './apis-routing.module';
import { ListComponent } from './list/list.component';
import { ApiCreateComponent } from './api-create/api-create.component';
import { ApiItemComponent } from './api-item/api-item.component';
import { ShareApiComponent } from "./share-api/share-api.component";
import { ApiSharedComponent } from './api-shared/api-shared.component';
import { ApiService } from '../services/api.service';
import { authInterceptorProviders } from '../helpers/auth.interceptor';

@NgModule({
    declarations: [
        ListComponent,
        ApiCreateComponent,
        ApiItemComponent,
        ApiSharedComponent,
        ShareApiComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ApisRoutingModule,
        SharedModule
    ],
    providers: [authInterceptorProviders, ApiService]
})
export class ApisModule {
}
