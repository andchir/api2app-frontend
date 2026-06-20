import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotFoundComponent } from '../not-found/not-found.component';
import { UserDataListComponent } from './list/list.component';

const routes: Routes = [
    {
        path: '',
        component: UserDataListComponent
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
export class UserDataRoutingModule { }
