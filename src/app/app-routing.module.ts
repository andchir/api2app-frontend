import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthLoginComponent } from './auth/auth-login.component';
import { AuthLogoutComponent } from './auth/auth-logout.component';
import { AuthRegisterComponent } from './auth/auth-register.component';
import { AuthPasswordResetComponent } from './auth/auth-password-reset.component';
import { AuthUserActivateComponent } from './auth/auth-activate.component';
import { AuthPasswordResetConfirmComponent } from './auth/auth-password-reset-confirm.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'auth',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    {
        path: 'auth/login',
        component: AuthLoginComponent
    },
    {
        path: 'auth/register',
        component: AuthRegisterComponent
    },
    {
        path: 'auth/password_reset',
        component: AuthPasswordResetComponent
    },
    {
        path: 'auth/activate/:uid/:token',
        component: AuthUserActivateComponent
    },
    {
        path: 'auth/password_reset_confirm/:uid/:token',
        component: AuthPasswordResetConfirmComponent
    },
    {
        path: 'auth/logout',
        component: AuthLogoutComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'apis',
        loadChildren: () => import('./apis/apis.module').then(m => m.ApisModule),
    },
    {
        path: 'apps',
        loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule),
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
