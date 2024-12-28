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
import { MyProfileComponent } from './my-profile/my-profile.component';
import { DocumentationComponent } from './docs/documentation.component';
import { AuthSessionComponent } from './auth/auth-session.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: $localize `Create an application simply online`
    },
    {
        path: 'auth',
        children: [
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            },
            {
                path: 'login',
                component: AuthLoginComponent,
                title: $localize `Log in`
            },
            {
                path: 'register',
                component: AuthRegisterComponent,
                title: $localize `Register`
            },
            {
                path: 'password_reset',
                component: AuthPasswordResetComponent,
                title: $localize `Reset the password`
            },
            {
                path: 'activate/:uid/:token',
                component: AuthUserActivateComponent,
                title: $localize `User Activation`
            },
            {
                path: 'session',
                component: AuthSessionComponent,
                title: $localize `Please wait...`
            },
            {
                path: 'password_reset_confirm/:uid/:token',
                component: AuthPasswordResetConfirmComponent,
                title: $localize `Password Reset Confirmation`
            },
            {
                path: 'logout',
                component: AuthLogoutComponent,
                title: $localize `Sign Out`
            }
        ]
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'my-profile',
        component: MyProfileComponent,
        title: $localize `My profile`
    },
    {
        path: 'apis',
        loadChildren: () => import('./apis/apis.module').then(m => m.ApisModule),
        title: $localize `APIs`
    },
    {
        path: 'apps',
        loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule),
        title: $localize `Applications`
    },
    {
        path: 'docs',
        component: DocumentationComponent
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
