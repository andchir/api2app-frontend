import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { NgApexchartsModule } from 'ng-apexcharts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SharedModule } from './shared.module';
import { ApplicationSharedComponent } from './apps/app-shared/app-shared.component';
import { AppBlockElementComponent } from './apps/components/app-block-element/app-block-element.component';
import { ElementInputTextComponent } from './apps/components/elements/element-input-text.component';
import { ApplicationService } from './services/application.service';
import { ApiService } from './services/api.service';
import { ModalService } from './services/modal.service';
import { TableElementComponent } from './apps/components/elements/table-element.component';
import { SelectImageComponent } from './apps/components/elements/select-image.component';
import { ProgressElementComponent } from './apps/components/elements/progress-element.component';
import { ElementImageComponent } from './apps/components/elements/element-image.component';
import { ImageComparisonComponent } from './apps/components/elements/image-comparison.component';
import { ElementIframeComponent } from "./apps/components/elements/element-iframe.component";

@NgModule({
    declarations: [
        ApplicationSharedComponent,
        AppBlockElementComponent,
        ElementInputTextComponent,

        AppComponent,
        NotFoundComponent
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
        NgApexchartsModule,
        TableElementComponent,
        SelectImageComponent,
        ProgressElementComponent,
        ElementImageComponent,
        ImageComparisonComponent,
        ElementIframeComponent
    ],
    providers: [ApplicationService, ApiService, ModalService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
