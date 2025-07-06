import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { LoginComponent } from './auth/login/login';
// import { Home } from './pages/home/home';
import { RegisterComponent } from './auth/register/register';
import { HomeComponent } from './pages/home/home';


// app-routing.module.ts
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'auth',
    canActivate: [AuthGuard],
    children: [
    //   { path: 'login', component: LoginComponent },
    //   { path: 'register', component: RegisterComponent }
    ]
  },
  { 
    path: 'tasks',
    canActivate: [AuthGuard],
    loadChildren: () => import('./tasks/tasks-module').then(m => m.TasksModule)
  }
];