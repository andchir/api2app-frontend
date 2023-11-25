import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppsRoutingModule } from './apps-routing.module';
import { ListComponent } from './list/list.component';
import { ListSharedComponent } from './list/shared/shared.component';

@NgModule({
    declarations: [
        ListComponent,
        ListSharedComponent
    ],
    imports: [
        CommonModule,
        AppsRoutingModule
    ]
})
export class AppsModule {
}
