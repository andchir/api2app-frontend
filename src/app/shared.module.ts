import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { MarkdownModule } from 'ngx-markdown';

import { NotAuthorizedComponent } from './shared/not-authorized/not-authorized.component';
import { AlertComponent } from './shared/alert/alert.component';
import { ConfirmComponent } from './shared/confirm/confirm.component';
import { DrawerComponent } from './shared/drawer/drawer.component';
import { ShareItemComponent } from './shared/share-item/share-item.component';
import { FileUploadComponent } from './shared/file-upload/file-upload.component';
import { ImageUploadCircleComponent } from './apps/components/app-image-upload-circle/app-image-upload-circle.component';
import { PaginationComponent } from './shared/pagination/pagination.component';

import { ToHtmlPipe } from './shared/pipes/to-html.pipe';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        NgSelectModule,
        NgxPaginationModule,
        MarkdownModule.forRoot()
    ],
    declarations: [
        AlertComponent,
        ConfirmComponent,
        DrawerComponent,
        ShareItemComponent,
        NotAuthorizedComponent,
        FileUploadComponent,
        ImageUploadCircleComponent,
        PaginationComponent,

        ToHtmlPipe
    ],
    exports: [
        AlertComponent,
        ConfirmComponent,
        DrawerComponent,
        ShareItemComponent,
        NotAuthorizedComponent,
        FileUploadComponent,
        ImageUploadCircleComponent,
        PaginationComponent,
        CommonModule,
        FormsModule,
        RouterModule,
        NgSelectModule,
        NgxPaginationModule,
        MarkdownModule,

        ToHtmlPipe
    ]
})
export class SharedModule { }
