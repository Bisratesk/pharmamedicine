import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Pharmacy, PharmacyRequest, PharmacyStatus } from '../models/pharmacy.model';
import { AuthService } from './auth';
import { ActivityService } from './activity';

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private pharmacies: Pharmacy[] = [
    {
      id: 1,
      ownerId: 2, // Belongs to demo owner (owner@test.com)
      name: 'LifeCare Central Pharmacy',
      address: 'Bole Road, Near Edna Mall, Addis Ababa',
      phone: '+251 91 123 4567',
      licenseNumber: 'PH-ETH-2026-0819',
      openingTime: '08:00',
      closingTime: '22:00',
      status: 'Approved',
      latitude: 9.0108,
      longitude: 38.7615,
    },
    {
      id: 2,
      ownerId: 99,
      name: 'MedPlus Community Pharmacy',
      address: 'Churchill Avenue, Piazza, Addis Ababa',
      phone: '+251 91 234 5678',
      licenseNumber: 'PH-ETH-2026-1142',
      openingTime: '07:30',
      closingTime: '21:00',
      status: 'Approved',
      latitude: 9.0227,
      longitude: 38.7516,
    },
    {
      id: 3,
      ownerId: 100,
      name: 'St. Paul Care Pharmacy',
      address: 'Gullele Sub-City, Swaziland Street',
      phone: '+251 91 345 6789',
      licenseNumber: 'PH-ETH-2026-4401',
      openingTime: '08:00',
      closingTime: '20:00',
      status: 'Pending',
      latitude: 9.0550,
      longitude: 38.7300,
    },
  ];

  constructor(private auth: AuthService, private activity: ActivityService) {}

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
    this.activity.log(`${pharmacy.name} registered (Pending approval)`);
    return of(pharmacy).pipe(delay(400));
  }

  getMine(): Observable<Pharmacy | null> {
    const user = this.auth.currentUser();
    const mine = this.pharmacies.find(p => p.ownerId === user?.id) ?? null;
    return of(mine).pipe(delay(250));
  }

  isApproved(id: number): boolean {
    return this.pharmacies.find(p => p.id === id)?.status === 'Approved';
  }

  getPending(): Observable<Pharmacy[]> {
    const pending = this.pharmacies.filter(p => p.status === 'Pending');
    return of(pending).pipe(delay(250));
  }

  getAll(): Observable<Pharmacy[]> {
    const order: Record<PharmacyStatus, number> = { Pending: 0, Approved: 1, Rejected: 2 };
    const list = [...this.pharmacies].sort((a, b) => order[a.status] - order[b.status]);
    return of(list).pipe(delay(250));
  }

  setStatus(id: number, status: PharmacyStatus): Observable<Pharmacy> {
    const pharmacy = this.pharmacies.find(p => p.id === id);
    if (!pharmacy) return throwError(() => new Error('Pharmacy not found'));

    pharmacy.status = status;
    this.activity.log(`Admin ${status === 'Approved' ? 'approved' : status === 'Rejected' ? 'rejected' : 'reset'} ${pharmacy.name}`);
    return of(pharmacy).pipe(delay(250));
  }

  getById(id: number): Pharmacy | undefined {
    return this.pharmacies.find(p => p.id === id);
  }
}

export type { Pharmacy };
