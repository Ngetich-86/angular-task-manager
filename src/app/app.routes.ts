import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { LoginComponent } from './auth/login/login';
import { Home } from './pages/home/home';
import { RegisterComponent } from './auth/register/register';


// app-routing.module.ts
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'auth',
    canActivate: [AuthGuard],
    children: [
    //   { path: 'login', component: LoginComponent },
    //   { path: 'register', component: RegisterComponent }
    ]
  }
//   { 
//     path: 'tasks',
//     canActivate: [AuthGuard],
//     loadChildren: () => import('./modules/tasks/tasks.module').then(m => m.TasksModule)
//   },
];