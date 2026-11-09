import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Pharmacy, PharmacyRequest, PharmacyStatus } from '../models/pharmacy.model';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private pharmacies: Pharmacy[] = [];

  constructor(private auth: AuthService) {}

  register(req: PharmacyRequest): Observable<Pharmacy> {
    const user = this.auth.currentUser();
    if (!user) return throwError(() => new Error('Not logged in'));

    const pharmacy: Pharmacy = {
      ...req,
      id: this.pharmacies.length + 1,
      ownerId: user.id,
      status: 'Pending',
    };
    this.pharmacies.push(pharmacy);
    return of(pharmacy).pipe(delay(500));
  }

  getMine(): Observable<Pharmacy | null> {
    const user = this.auth.currentUser();
    const mine = this.pharmacies.find(p => p.ownerId === user?.id) ?? null;
    return of(mine).pipe(delay(300));
    
  }
  isApproved(id: number): boolean {
  return this.pharmacies.find(p => p.id === id)?.status === 'Approved';
}
  getPending(): Observable<Pharmacy[]> {  //returns the pharmacies waiting for status
  const pending = this.pharmacies.filter(p => p.status === 'Pending');
  return of(pending).pipe(delay(300));
}

setStatus(id: number, status: PharmacyStatus): Observable<Pharmacy> { //finds one by id
  const pharmacy = this.pharmacies.find(p => p.id === id);
  if (!pharmacy) return throwError(() => new Error('Pharmacy not found'));

  pharmacy.status = status;
  return of(pharmacy).pipe(delay(300));
}
getById(id: number): Pharmacy | undefined {
  return this.pharmacies.find(p => p.id === id);
}
}
