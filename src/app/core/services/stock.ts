import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { StockItem, StockRequest } from '../models/stock.model';
import {PharmacyService, } from './pharmacy';
import { SearchResult } from '../models/search.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private items: StockItem[] = [];
  private nextId = 1;
  constructor(private pharmacies: PharmacyService) {}

  getByPharmacy(pharmacyId: number): Observable<StockItem[]> {
    const mine = this.items.filter(i => i.pharmacyId === pharmacyId);
    return of([...mine]).pipe(delay(300));
  }

 add(pharmacyId: number, req: StockRequest): Observable<StockItem> {
  if (!this.pharmacies.isApproved(pharmacyId)) {
    return throwError(() => new Error('Pharmacy is not approved yet'));
  }
  const item: StockItem = { ...req, id: this.nextId++, pharmacyId };
  this.items.push(item);
  return of(item).pipe(delay(300));
}
  update(id: number, req: StockRequest): Observable<StockItem> {
    const item = this.items.find(i => i.id === id);
    if (!item) return throwError(() => new Error('Item not found'));

    Object.assign(item, req);
    return of(item).pipe(delay(300));
  }

  remove(id: number): Observable<void> {
    this.items = this.items.filter(i => i.id !== id);
    return of(undefined).pipe(delay(300));
  }
  search(term: string): Observable<SearchResult[]> {
  const text = term.trim().toLowerCase();
  if (!text) return of([]);

  const results: SearchResult[] = this.items
    .filter(i => i.quantity > 0 && i.medicineName.toLowerCase().includes(text))
    .filter(i => this.pharmacies.isApproved(i.pharmacyId))
    .map(i => {
      const p = this.pharmacies.getById(i.pharmacyId)!;
      return {
        pharmacyId: p.id,
        pharmacyName: p.name,
        address: p.address,
        phone: p.phone,
        medicineName: i.medicineName,
        price: i.price,
        quantity: i.quantity,
      };
    });

  return of(results).pipe(delay(300));
}
}
