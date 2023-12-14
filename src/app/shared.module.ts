import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';

import { NotAuthorizedComponent } from './shared/not-authorized/not-authorized.component';
import { AlertComponent } from './shared/alert/alert.component';
import { ConfirmComponent } from './shared/confirm/confirm.component';
import { DrawerComponent } from './shared/drawer/drawer.component';
import { ShareItemComponent } from './shared/share-item/share-item.component';
import { FileUploadComponent } from './shared/file-upload/file-upload.component';

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
        ShareItemComponent,
        NotAuthorizedComponent,
        FileUploadComponent
    ],
    exports: [
        AlertComponent,
        ConfirmComponent,
        DrawerComponent,
        ShareItemComponent,
        NotAuthorizedComponent,
        FileUploadComponent,
        CommonModule,
        FormsModule,
        RouterModule,
        NgSelectModule
    ]
})
export class SharedModule { }
