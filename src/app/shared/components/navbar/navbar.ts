import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';
// import { AuthStateService } from '../../core/services/auth-state';
import { NgIf, AsyncPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStateService } from '../../../core/services/auth-state';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  currentUser$: typeof this.authState.currentUser$;

  constructor(private auth: AuthService, private authState: AuthStateService) {
    this.currentUser$ = this.authState.currentUser$;
  }

  logout() {
    this.auth.logout();
  }
}
