import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApisRoutingModule } from './apis-routing.module';
import { ListComponent } from './list/list.component';
import { ApiCreateComponent } from './api-create/api-create.component';
import { ApiItemComponent } from './api-item/api-item.component';

@NgModule({
  declarations: [
    ListComponent,
    ApiCreateComponent,
    ApiItemComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ApisRoutingModule
  ]
})
export class ApisModule { }
