import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AlertComponent } from './shared/alert/alert.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        AlertComponent
    ],
    exports: [
        AlertComponent,
        CommonModule,
        FormsModule
    ]
})
export class SharedModule { }
