import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Medicine, MedicineRequest } from '../models/medicine.model';
import { ActivityService } from './activity';

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private medicines: Medicine[] = [
    { id: 1, name: 'Paracetamol', category: 'Pain relief' },
    { id: 2, name: 'Amoxicillin', category: 'Antibiotic' },
    { id: 3, name: 'Ibuprofen', category: 'Pain relief' },
  ];
  private nextId = 4;
constructor(private activity: ActivityService) {}
  getAll(): Observable<Medicine[]> {
    return of([...this.medicines]).pipe(delay(300));
  }

  add(req: MedicineRequest): Observable<Medicine> {
    const med: Medicine = { ...req, id: this.nextId++ };
    this.medicines.push(med);
    this.activity.log(`Admin added ${med.name} to the catalog`);
    return of(med).pipe(delay(300));
  }

 remove(id: number): Observable<void> {
  const med = this.medicines.find(m => m.id === id);
  if (med) this.activity.log(`Admin removed ${med.name} from the catalog`);
  this.medicines = this.medicines.filter(m => m.id !== id);
  return of(undefined).pipe(delay(300));
}
update(id: number, req: MedicineRequest): Observable<Medicine> {
  const med = this.medicines.find(m => m.id === id);
  if (!med) return throwError(() => new Error('Medicine not found'));

  Object.assign(med, req);
  this.activity.log(`Admin updated ${med.name} in the catalog`);
  return of(med).pipe(delay(300));
}
}
