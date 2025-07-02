import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TaskStateService } from '../services/task-state';



@Injectable({  providedIn: 'root'})
export class TaskOwnerGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private taskStateService: TaskStateService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> {
    const taskId = route.paramMap.get('id');
    const currentUser = this.auth.getCurrentUser();
    
    if (!taskId || !currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // If getTaskById returns a Task object synchronously
    if (taskId) {
      const task = this.taskStateService.getTaskById(taskId!);
      if (!task) {
        this.router.navigate(['/tasks']);
        return false;
      }
      const isOwner = task.id === currentUser.id;
      const isAdmin = currentUser.role === 'admin';

      if (!isOwner && !isAdmin) {
        this.router.navigate(['/tasks']);
        return false;
      } else {
        return true;
      }
    }

    return true;
  }
}
