import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApisRoutingModule } from './apis-routing.module';
import { ListComponent } from './list/list.component';
import { ApiCreateComponent } from './api-create/api-create.component';

@NgModule({
  declarations: [
    ListComponent,
    ApiCreateComponent
  ],
  imports: [
    CommonModule,
    ApisRoutingModule
  ]
})
export class ApisModule { }
