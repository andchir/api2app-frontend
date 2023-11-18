import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AlertComponent } from './shared/alert/alert.component';
import { ConfirmComponent } from './shared/confirm/confirm.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        AlertComponent,
        ConfirmComponent
    ],
    exports: [
        AlertComponent,
        ConfirmComponent,
        CommonModule,
        FormsModule
    ]
})
export class SharedModule { }
