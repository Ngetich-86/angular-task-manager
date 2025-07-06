import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../core/services/task';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './task-create.html',
  styleUrl: './task-create.css'
})
export class TaskCreate {
  taskForm: ReturnType<FormBuilder['group']>;
  errorMessage: string | null = null;
  priorities = ['Low', 'medium', 'High', 'Urgent'];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private auth: AuthService,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      due_date: ['', Validators.required],
      priority: ['Low', Validators.required]
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const user = this.auth.getCurrentUser();
      if (!user) {
        this.errorMessage = 'User not authenticated.';
        return;
      }
      const now = new Date();
      const payload = {
        title: this.taskForm.value.title as string || '',
        description: this.taskForm.value.description as string || '',
        due_date: new Date(this.taskForm.value.due_date as string),
        priority: this.taskForm.value.priority as 'Low' | 'medium' | 'High' | 'Urgent',
        user_id: user.id,
        completed: false,
        created_at: now,
        updated_at: now
      };
      this.taskService.createTask(payload).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err) => this.errorMessage = err.error?.message || 'Failed to create task'
      });
    } else {
      this.taskForm.markAllAsTouched();
    }
  }
}
