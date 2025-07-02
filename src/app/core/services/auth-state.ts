import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../types/user.model';

@Injectable({providedIn: 'root'})
export class AuthStateService {
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

   getCurrentUser(): User | null {
  return this.currentUserSubject.getValue();
  }
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }
}
