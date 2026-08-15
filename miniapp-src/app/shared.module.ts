import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxTippyModule } from 'ngx-tippy-wrapper';
import { MarkdownModule, MarkedOptions, MARKED_OPTIONS, MarkedRenderer } from 'ngx-markdown';
import { Tokens } from 'marked';

import { AlertComponent } from './shared/alert/alert.component';
import { ConfirmComponent } from './shared/confirm/confirm.component';
import { ShareItemComponent } from './shared/share-item/share-item.component';
import { FileUploadComponent } from './shared/file-upload/file-upload.component';
import { PaginationComponent } from './shared/pagination/pagination.component';

import { ToHtmlPipe } from './shared/pipes/to-html.pipe';
import { FilterBlockPipe } from './shared/pipes/filter-block';

export function markedOptionsFactory(): MarkedOptions {
    const renderer = new MarkedRenderer();
    const blockquoteRenderer = renderer.blockquote;
    const linkRenderer = renderer.link;

    renderer.blockquote = function (this: MarkedRenderer, token: Tokens.Blockquote): string {
        return blockquoteRenderer.call(this, token).replace(/^<blockquote>/, '<blockquote class="blockquote">');
    };

    renderer.link = function (this: MarkedRenderer, token: Tokens.Link): string {
        const html = linkRenderer.call(this, token);
        const target = token.href.includes('#') ? '_self' : '_blank';
        return html.replace(/^<a /, `<a class="whitespace-nowrap text-blue-500 underline hover:text-blue-700" target="${target}" rel="nofollow" `);
    };

    return {
        renderer,
        gfm: true,
        breaks: false,
        pedantic: false
    };
}

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        NgSelectModule,
        NgxPaginationModule,
        MarkdownModule.forRoot({
            loader: HttpClient,
            markedOptions: {
                provide: MARKED_OPTIONS,
                useFactory: markedOptionsFactory,
            },
        }),
        NgxTippyModule
    ],
    declarations: [
        AlertComponent,
        ConfirmComponent,
        ShareItemComponent,
        FileUploadComponent,
        PaginationComponent,

        ToHtmlPipe,
        FilterBlockPipe
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

        ToHtmlPipe,
        FilterBlockPipe
    ]
})
export class SharedModule { }
