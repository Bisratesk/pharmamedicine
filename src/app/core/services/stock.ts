import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { StockItem, StockRequest, AdminStockRow } from '../models/stock.model';
import { PharmacyService } from './pharmacy';
import { SearchResult } from '../models/search.model';
import { ActivityService } from './activity';

@Injectable({ providedIn: 'root' })
export class StockService {
  private items: StockItem[] = [
    { id: 1, pharmacyId: 1, medicineName: 'Paracetamol 500mg', price: 45, quantity: 60 },
    { id: 2, pharmacyId: 1, medicineName: 'Amoxicillin 500mg', price: 130, quantity: 25 },
    { id: 3, pharmacyId: 1, medicineName: 'Ibuprofen 400mg', price: 65, quantity: 40 },
    { id: 4, pharmacyId: 1, medicineName: 'Cetirizine 10mg', price: 35, quantity: 8 }, // low stock
    { id: 5, pharmacyId: 2, medicineName: 'Paracetamol 500mg', price: 42, quantity: 35 },
    { id: 6, pharmacyId: 2, medicineName: 'Amoxicillin 500mg', price: 125, quantity: 5 }, // low stock
    { id: 7, pharmacyId: 2, medicineName: 'Ibuprofen 400mg', price: 70, quantity: 18 },
    { id: 8, pharmacyId: 2, medicineName: 'Omeprazole 20mg', price: 95, quantity: 22 },
  ];
  private nextId = 9;

  constructor(private pharmacies: PharmacyService, private activity: ActivityService) {}

  getByPharmacy(pharmacyId: number): Observable<StockItem[]> {
    const mine = this.items.filter(i => i.pharmacyId === pharmacyId);
    return of([...mine]).pipe(delay(250));
  }

  add(pharmacyId: number, req: StockRequest): Observable<StockItem> {
    if (!this.pharmacies.isApproved(pharmacyId)) {
      return throwError(() => new Error('Pharmacy is not approved yet'));
    }
    const item: StockItem = { ...req, id: this.nextId++, pharmacyId };
    this.items.push(item);
    this.activity.log(
      `${this.pharmacies.getById(pharmacyId)?.name} added ${item.medicineName} (qty ${item.quantity}, price ${item.price} ETB)`
    );
    return of(item).pipe(delay(250));
  }

  update(id: number, req: StockRequest): Observable<StockItem> {
    const item = this.items.find(i => i.id === id);
    if (!item) return throwError(() => new Error('Item not found'));

    Object.assign(item, req);
    this.activity.log(
      `${this.pharmacies.getById(item.pharmacyId)?.name} updated ${item.medicineName} (qty ${item.quantity}, price ${item.price} ETB)`
    );
    return of(item).pipe(delay(250));
  }

  remove(id: number): Observable<void> {
    const item = this.items.find(i => i.id === id);
    if (item) {
      this.activity.log(
        `${this.pharmacies.getById(item.pharmacyId)?.name} removed ${item.medicineName}`
      );
    }
    this.items = this.items.filter(i => i.id !== id);
    return of(undefined).pipe(delay(250));
  }

  getAll(): Observable<AdminStockRow[]> {
    const rows = this.items.map(i => ({
      ...i,
      pharmacyName: this.pharmacies.getById(i.pharmacyId)?.name ?? 'Unknown',
    }));
    return of(rows).pipe(delay(250));
  }

  search(term: string): Observable<SearchResult[]> {
    const text = term.trim().toLowerCase();
    if (!text) return of([]);

    const results: SearchResult[] = this.items
      .filter(i => i.quantity > 0 && i.medicineName.toLowerCase().includes(text))
      .filter(i => this.pharmacies.isApproved(i.pharmacyId))
      .map(i => {
        const p = this.pharmacies.getById(i.pharmacyId);
        if (!p) return null;
        return {
          pharmacyId: p.id,
          pharmacyName: p.name,
          address: p.address,
          phone: p.phone,
          medicineName: i.medicineName,
          price: i.price,
          quantity: i.quantity,
          latitude: p.latitude,
          longitude: p.longitude,
        };
      })
      .filter((r): r is SearchResult => r !== null);

    return of(results).pipe(delay(300));
  }
}
