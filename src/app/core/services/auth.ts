import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError, delay, tap } from 'rxjs';
import { LoginRequest, LoginResponse,RegisterRequest, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private fakeUsers = [
    { id: 1, fullName: 'Admin', email: 'admin@test.com', password: '1234', role: 'Admin' as const },
    { id: 2, fullName: 'Owner', email: 'owner@test.com', password: '1234', role: 'PharmacyOwner' as const },
    { id: 3, fullName: 'Customer', email: 'customer@test.com', password: '1234', role: 'Customer' as const },
  ];

 currentUser = signal<User | null>(JSON.parse(localStorage.getItem('user') ?? 'null'));

  login(req: LoginRequest): Observable<LoginResponse> {
    const found = this.fakeUsers.find(
      u => u.email === req.email && u.password === req.password
    );

    if (!found) {
      return throwError(() => new Error('Invalid email or password'));
    }

    const { password, ...user } = found;
    return of({ token: 'fake-jwt-token', user }).pipe(
      delay(500),
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.currentUser.set(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

register(req: RegisterRequest): Observable<User> {
  if (this.fakeUsers.some(u => u.email === req.email)) {
    return throwError(() => new Error('Email already registered'));
  }

  const newUser = {
    id: this.fakeUsers.length + 1,
    fullName: req.fullName,
    email: req.email,
    password: req.password,
    role: req.role as any,
  };
  this.fakeUsers.push(newUser);

  const { password, ...user } = newUser;
  return of(user).pipe(delay(500));
}
}