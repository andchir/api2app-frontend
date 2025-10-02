import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TitleStrategy } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthLoginComponent } from './auth/auth-login.component';
import { AuthRegisterComponent } from './auth/auth-register.component';
import { AuthPasswordResetComponent } from './auth/auth-password-reset.component';
import { AuthUserActivateComponent } from './auth/auth-activate.component';
import { AuthSessionComponent } from './auth/auth-session.component';
import { AuthPasswordResetConfirmComponent } from './auth/auth-password-reset-confirm.component';
import { AuthLogoutComponent } from './auth/auth-logout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { HomeComponent } from "./home/home.component";
import { NotFoundComponent } from './not-found/not-found.component';

import { authInterceptorProviders } from './helpers/auth.interceptor';
import { CustomTitleStrategy } from './helpers/custom-title-strategy';
import { SharedModule } from './shared.module';

@NgModule({ declarations: [
        AppComponent,
        AuthLoginComponent,
        AuthRegisterComponent,
        AuthPasswordResetComponent,
        AuthUserActivateComponent,
        AuthPasswordResetConfirmComponent,
        AuthLogoutComponent,
        AuthSessionComponent,
        HomeComponent,
        DashboardComponent,
        MyProfileComponent,
        NotFoundComponent
    ],
    bootstrap: [AppComponent], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        SharedModule], providers: [authInterceptorProviders, { provide: TitleStrategy, useClass: CustomTitleStrategy }, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {
}
