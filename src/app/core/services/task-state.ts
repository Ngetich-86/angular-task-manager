import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../../types/task.model';


@Injectable({ providedIn: 'root' })
export class TaskStateService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private currentTaskSubject = new BehaviorSubject<Task | null>(null);
  
  tasks$ = this.tasksSubject.asObservable();
  currentTask$ = this.currentTaskSubject.asObservable();

  setTasks(tasks: Task[]): void {
    this.tasksSubject.next(tasks);
  }

  addTask(task: Task): void {
    const currentTasks = this.tasksSubject.value;
    this.tasksSubject.next([...currentTasks, task]);
  }

  updateTask(updatedTask: Task): void {
    const tasks = this.tasksSubject.value.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    this.tasksSubject.next(tasks);
  }

  deleteTask(taskId: string): void {
    const tasks = this.tasksSubject.value.filter(task => task.id !== taskId);
    this.tasksSubject.next(tasks);
  }

  setCurrentTask(task: Task | null): void {
    this.currentTaskSubject.next(task);
  }

  getTaskById(taskId: string): Task | undefined {
    return this.tasksSubject.value.find(task => task.id === taskId);
  }
}