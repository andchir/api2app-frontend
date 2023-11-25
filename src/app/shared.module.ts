import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AlertComponent } from './shared/alert/alert.component';
import { ConfirmComponent } from './shared/confirm/confirm.component';
import { NotAuthorizedComponent } from './shared/not-authorized/not-authorized.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule
    ],
    declarations: [
        AlertComponent,
        ConfirmComponent,
        NotAuthorizedComponent
    ],
    exports: [
        AlertComponent,
        ConfirmComponent,
        NotAuthorizedComponent,
        CommonModule,
        FormsModule,
        RouterModule
    ]
})
export class SharedModule { }
