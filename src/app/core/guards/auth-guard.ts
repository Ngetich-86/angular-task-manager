import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
// This guard is a placeholder for authentication logic.
// It currently allows all routes to be accessed without any authentication checks.
// In a real application, you would implement logic to check if the user is authenticated.
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if the user is authenticated
    if (this.auth.isAuthenticated()) {
      // Optionally redirect authenticated users
      this.router.navigate(['/dashboard']);
      return true; // Allow access to the route
    } else {
      this.router.navigate(['/login']); // Redirect to login if not authenticated
      return false; // Deny access to the route
    }
  }
}
