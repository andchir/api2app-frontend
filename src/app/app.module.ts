import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthLoginComponent } from './auth/auth-login.component';
import { AuthRegisterComponent } from './auth/auth-register.component';
import { AuthLogoutComponent } from './auth/auth-logout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from "./home/home.component";
import { NotFoundComponent } from './not-found/not-found.component';

import { authInterceptorProviders } from './helpers/auth.interceptor';
import { SharedModule } from './shared.module';

@NgModule({
    declarations: [
        AppComponent,
        AuthLoginComponent,
        AuthRegisterComponent,
        AuthLogoutComponent,
        HomeComponent,
        DashboardComponent,
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
        SharedModule
    ],
    providers: [authInterceptorProviders],
    bootstrap: [AppComponent]
})
export class AppModule {
}
