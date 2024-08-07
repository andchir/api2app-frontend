import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListAppsComponent } from './list/list.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { ApplicationsListSharedComponent } from './list/shared/shared.component';
import { ApplicationsListPersonalComponent } from './list/personal/personal.component';
import { ApplicationCreateComponent } from './app-create/app-create.component';
import { ApplicationSharedComponent } from './app-shared/app-shared.component';
import { ApplicationEmbeddedComponent } from './app-shared/app-embedded.component';

const routes: Routes = [
    {
        path: '',
        component: ListAppsComponent,
        children: [
            {
                path: '',
                redirectTo: 'shared',
                pathMatch: 'full'
            },
            {
                path: 'shared',
                component: ApplicationsListSharedComponent
            },
            {
                path: 'personal',
                component: ApplicationsListPersonalComponent
            }
        ]
    },
    {
        path: 'create',
        component: ApplicationCreateComponent
    },
    {
        path: 'edit/:id',
        component: ApplicationCreateComponent
    },
    {
        path: 'shared/:uuid',
        component: ApplicationSharedComponent
    },
    {
        path: 'embed/:uuid',
        component: ApplicationEmbeddedComponent
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppsRoutingModule { }
