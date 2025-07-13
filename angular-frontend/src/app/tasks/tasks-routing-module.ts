import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth-guard';
import { TaskOwnerGuard } from '../core/guards/task-owner-guard';
import { TaskListComponent } from './task-list/task-list';

const routes: Routes = [
  { 
    path: '',
    component: TaskListComponent,
    canActivate: [AuthGuard]
  },
  // { 
  //   path: 'create',
  //   component: TaskFormComponent,
  //   canActivate: [AuthGuard]
  // },
  // { 
  //   path: ':id',
  //   component: TaskDetailsComponent,
  //   canActivate: [AuthGuard, TaskOwnerGuard]
  // },
  // { 
  //   path: ':id/edit',
  //   component: TaskFormComponent,
  //   canActivate: [AuthGuard, TaskOwnerGuard]
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule { }