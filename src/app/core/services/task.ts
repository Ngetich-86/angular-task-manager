// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { Task } from '../../types/task.model';


// @Injectable({providedIn: 'root'})
// export class TaskService {
//   private tasksSubject = new BehaviorSubject<Task[]>([]);
//   private currentTaskSubject = new BehaviorSubject<Task | null>(null);
//   tasks$ = this.tasksSubject.asObservable();
//   currentTask$ = this.currentTaskSubject.asObservable();

//   setTasks(tasks: Task[]): void {
//     this.tasksSubject.next(tasks);
//   }
//   addTask(task: Task): void {
//     const currentTasks = this.tasksSubject.getValue();
//     this.tasksSubject.next([...currentTasks, task]);
//   }

//   updateTask(task: Task): void {
//     const currentTasks = this.tasksSubject.getValue();
//     const updatedTasks = currentTasks.map(t => t.id === task.id ? task : t);
//     this.tasksSubject.next(updatedTasks);
//   }
//   deleteTask(taskId: string): void {
//     const currentTasks = this.tasksSubject.getValue();
//     const updatedTasks = currentTasks.filter(t => t.id !== taskId);
//     this.tasksSubject.next(updatedTasks);
//   }
//   setCurrentTask(task: Task | null): void {
//     this.currentTaskSubject.next(task);
//   }
//   clearCurrentTask(): void {
//     this.currentTaskSubject.next(null);
//   }
//   getCurrentTask(): Task | null {
//     return this.currentTaskSubject.getValue();
//   }
//   getTasks(): Task[] {
//     return this.tasksSubject.getValue();
//   }
//   getTaskById(taskId: string): Task | undefined {
//     return this.tasksSubject.getValue().find(task => task.id === taskId);
//   }
//   getTasksByUserId(userId: string): Task[] {
//     return this.tasksSubject.getValue().filter(task => task.user_id === userId);
//   }
//   getTasksByStatus(completed: boolean): Task[] {
//     return this.tasksSubject.getValue().filter(task => task.completed === completed);
//   }
//   getTasksByPriority(priority: "Low" | "medium" | "High" | "Urgent"): Task[] {
//     return this.tasksSubject.getValue().filter(task => task.priority === priority);
//   }
//   getTasksByDueDate(dueDate: Date): Task[] {
//     return this.tasksSubject.getValue().filter(task => task.due_date.toDateString() === dueDate.toDateString());
//   }
//   getTasksByDateRange(startDate: Date, endDate: Date): Task[] {
//     return this.tasksSubject.getValue().filter(task => 
//       task.due_date >= startDate && task.due_date <= endDate
//     );
//   }
//   getTasksBySearchTerm(searchTerm: string): Task[] {
//     return this.tasksSubject.getValue().filter(task => 
//       task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       task.description.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }

// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../types/task.model';
import { TaskCreatePayload, TaskUpdatePayload } from '../../types/task.model';
// import { Task, TaskCreatePayload, TaskUpdatePayload } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly API_URL = 'http://your-backend-api.com/tasks';

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.API_URL);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/${id}`);
  }

  createTask(task: TaskCreatePayload): Observable<Task> {
    return this.http.post<Task>(this.API_URL, task);
  }

  updateTask(id: string, updates: TaskUpdatePayload): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/${id}`, updates);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getTasksByUser(username: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}?username=${username}`);
  }
}