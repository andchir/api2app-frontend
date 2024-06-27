import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { MarkdownModule } from 'ngx-markdown';

import { AlertComponent } from './shared/alert/alert.component';
import { ConfirmComponent } from './shared/confirm/confirm.component';
import { ShareItemComponent } from './shared/share-item/share-item.component';
import { FileUploadComponent } from './shared/file-upload/file-upload.component';
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
        ShareItemComponent,
        FileUploadComponent,
        PaginationComponent,

        ToHtmlPipe
    ],
    exports: [
        AlertComponent,
        ConfirmComponent,
        ShareItemComponent,
        FileUploadComponent,
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
