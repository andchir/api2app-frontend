import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';

import { NotAuthorizedComponent } from './shared/not-authorized/not-authorized.component';
import { AlertComponent } from './shared/alert/alert.component';
import { ConfirmComponent } from './shared/confirm/confirm.component';
import { DrawerComponent } from './shared/drawer/drawer.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        NgSelectModule
    ],
    declarations: [
        AlertComponent,
        ConfirmComponent,
        DrawerComponent,
        NotAuthorizedComponent
    ],
    exports: [
        AlertComponent,
        ConfirmComponent,
        DrawerComponent,
        NotAuthorizedComponent,
        CommonModule,
        FormsModule,
        RouterModule,
        NgSelectModule
    ]
})
export class SharedModule { }
