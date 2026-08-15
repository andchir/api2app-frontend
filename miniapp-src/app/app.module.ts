import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TitleStrategy } from '@angular/router';

import { NgxTippyModule } from 'ngx-tippy-wrapper';
import { NgApexchartsModule } from 'ng-apexcharts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ApplicationSharedComponent } from './apps/app-shared/app-shared.component';
import { AppBlockElementComponent } from './apps/components/app-block-element/app-block-element.component';
import { ElementInputTextComponent } from './apps/components/elements/element-input-text/element-input-text.component';
import { TableElementComponent } from './apps/components/elements/table-element/table-element.component';
import { SelectImageComponent } from './apps/components/elements/select-image/select-image.component';
import { ProgressElementComponent } from './apps/components/elements/progress-element/progress-element.component';
import { ElementImageComponent } from './apps/components/elements/element-image/element-image.component';
import { ImageComparisonComponent } from './apps/components/elements/image-comparison/image-comparison.component';
import { ElementIframeComponent } from './apps/components/elements/element-iframe/element-iframe.component';
import { AudioPlayerComponent } from './apps/components/elements/audio-player/audio-player.component';
import { MessagesElementComponent } from './apps/components/elements/messages-element/messages-element.component';
import { InputDateElementComponent } from './apps/components/elements/input-date-element/input-date-element.component';
import { RatingElementComponent } from './apps/components/elements/rating-element/rating-element.component';
import { ApplicationService } from './services/application.service';
import { ApiService } from './services/api.service';
import { ModalService } from './services/modal.service';

import { CustomTitleStrategy } from './helpers/custom-title-strategy';
import { SharedModule } from './shared.module';

@NgModule({
    declarations: [
        AppComponent,
        NotFoundComponent,
        ApplicationSharedComponent,
        AppBlockElementComponent,
        ElementInputTextComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        SharedModule,
        NgxTippyModule,
        NgApexchartsModule,
        TableElementComponent,
        SelectImageComponent,
        ProgressElementComponent,
        ElementImageComponent,
        ImageComparisonComponent,
        ElementIframeComponent,
        AudioPlayerComponent,
        MessagesElementComponent,
        InputDateElementComponent,
        RatingElementComponent
    ],
    providers: [
        ApplicationService,
        ApiService,
        ModalService,
        {provide: TitleStrategy, useClass: CustomTitleStrategy}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
