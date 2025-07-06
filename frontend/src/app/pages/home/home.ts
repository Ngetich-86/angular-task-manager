// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-home',
//   standalone: true,
//   imports: [],
//   templateUrl: './home.html',
//   styleUrl: './home.css'
// })
// export class Home {

// }
// pages/home/home.component.ts
import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, RouterOutlet],
  templateUrl: './home.html'
})
export class HomeComponent {
  username = 'Admin User'; 
  showUserMenu = false;
  sidenavOpen = true;

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }

  logout() {
    // Implement logout functionality
    console.log('Logging out...');
  }
}