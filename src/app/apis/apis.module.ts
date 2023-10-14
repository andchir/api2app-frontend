import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApisRoutingModule } from './apis-routing.module';
import { ListComponent } from './list/list.component';

@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    CommonModule,
    ApisRoutingModule
  ]
})
export class ApisModule { }
