import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { StockItem, StockRequest } from '../models/stock.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private items: StockItem[] = [];
  private nextId = 1;

  getByPharmacy(pharmacyId: number): Observable<StockItem[]> {
    const mine = this.items.filter(i => i.pharmacyId === pharmacyId);
    return of([...mine]).pipe(delay(300));
  }

  add(pharmacyId: number, req: StockRequest): Observable<StockItem> {
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
}