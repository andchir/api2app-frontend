import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TitleStrategy } from '@angular/router';

import { NgxTippyModule } from 'ngx-tippy-wrapper';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';

import { CustomTitleStrategy } from './helpers/custom-title-strategy';
import { SharedModule } from './shared.module';

@NgModule({
    declarations: [
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
        NgxTippyModule
    ],
    providers: [{provide: TitleStrategy,  useClass: CustomTitleStrategy}],
    bootstrap: [AppComponent]
})
export class AppModule {
}
