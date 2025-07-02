import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthStateService } from "./auth-state";

// This file is part of the Angular Task Manager project.
// It provides the AuthService class which handles authentication-related operations.
// The AuthService class is responsible for managing user authentication, including login and logout functionalities.
@Injectable({ providedIn: "root" })
export class AuthService {
    private readonly API_URL = "http://localhost:3000/api/auth";

    constructor(
        private http: HttpClient,
        private router: Router,
        private authState: AuthStateService
    ) {}
    login(credentials: { email: string; password: string }) {
        return this.http.post(`${this.API_URL}/login`, credentials);
    }
    register(userData: { name: string; email: string; password: string }) {
        return this.http.post(`${this.API_URL}/register`, userData);

    }
    logout() {
        localStorage.removeItem("access_token");
        this.authState.setCurrentUser(null);
        this.router.navigate(["/login"]);

    }
    isAuthenticated():boolean {
        // Check if the user is authenticated
        return this.authState.getCurrentUser() !== null;
    }
    getCurrentUser() {
        // Get the current authenticated user
        return this.authState.getCurrentUser();
    }
    setCurrentUser(user: any) {
        // Set the current authenticated user
        this.authState.setCurrentUser(user);
    }
    getToken(): string | null {
        // Get the authentication token from local storage
        return localStorage.getItem("access_token");
    }
}