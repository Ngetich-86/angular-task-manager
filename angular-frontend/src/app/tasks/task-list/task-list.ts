import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStateService } from '../../core/services/task-state';
import { TaskService } from '../../core/services/task';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.html'
})
export class TaskListComponent implements OnInit {
  tasks$: typeof this.taskState.tasks$;
  currentUser: any;

  constructor(
    private taskService: TaskService,
    private taskState: TaskStateService,
    private auth: AuthService
  ) {
    this.tasks$ = this.taskState.tasks$;
    this.currentUser = this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    if (this.currentUser.role === 'admin') {
      this.taskService.getAllTasks().subscribe(tasks => {
        this.taskState.setTasks(tasks);
      });
    } else {
      this.taskService.getTasksByUser(this.currentUser.username).subscribe(tasks => {
        this.taskState.setTasks(tasks);
      });
    }
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe(() => {
        this.taskState.deleteTask(taskId);
      });
    }
  }
}
