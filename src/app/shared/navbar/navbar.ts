import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  constructor(public auth: AuthService, private router: Router) {}

  getHomeRoute(): string {
    const role = this.auth.currentUser()?.role;
    if (role === 'Admin') return '/admin';
    if (role === 'PharmacyOwner') return '/owner';
    if (role === 'Customer') return '/search';
    return '/login';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
