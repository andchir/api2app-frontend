import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list/list.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { ApplicationsListSharedComponent } from './list/shared/shared.component';
import { ApplicationsListPersonalComponent } from './list/personal/personal.component';

const routes: Routes = [
    {
        path: '',
        component: ListComponent,
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
        path: '**',
        component: NotFoundComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppsRoutingModule { }
