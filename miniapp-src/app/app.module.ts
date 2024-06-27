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
        NgApexchartsModule
    ],
    providers: [ApplicationService, ApiService, ModalService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
