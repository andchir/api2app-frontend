import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxTippyModule } from 'ngx-tippy-wrapper';

import { authInterceptorProviders } from '../helpers/auth.interceptor';
import { SharedModule } from '../shared.module';
import { UserDataRoutingModule } from './user-data-routing.module';
import { UserDataListComponent } from './list/list.component';
import { UserDataService } from './services/user-data.service';
import { UserDataTableEditComponent } from './table-edit/table-edit.component';

@NgModule({
    declarations: [
        UserDataListComponent,
        UserDataTableEditComponent
    ],
    imports: [
        CommonModule,
        UserDataRoutingModule,
        SharedModule,
        NgxTippyModule
    ],
    exports: [
    ],
    providers: [authInterceptorProviders, UserDataService]
})
export class UserDataModule {
}
