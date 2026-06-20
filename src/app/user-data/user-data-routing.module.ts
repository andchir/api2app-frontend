import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotFoundComponent } from '../not-found/not-found.component';
import { UserDataListComponent } from './list/list.component';
import { UserDataTableEditComponent } from './table-edit/table-edit.component';
import { AuthGuard } from '../helpers/auth.guard';

const routes: Routes = [
    {
        path: '',
        component: UserDataListComponent
    },
    {
        path: 'create',
        component: UserDataTableEditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'edit/:id',
        component: UserDataTableEditComponent,
        canActivate: [AuthGuard]
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
