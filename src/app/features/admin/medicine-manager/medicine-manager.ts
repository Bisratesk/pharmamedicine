import { Component, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { StockService } from '../../../core/services/stock';
import { AdminStockRow } from '../../../core/models/stock.model';

@Component({
  selector: 'app-medicine-manager',
  imports: [ReactiveFormsModule, DecimalPipe],
  styleUrl: './medicine-manager.css',
  templateUrl: './medicine-manager.html',
})
export class MedicineManager {
  items = signal<AdminStockRow[]>([]);
  editingId = signal<number | null>(null);
  searchQuery = signal('');
  form;

  filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.items();
    return this.items().filter(m =>
      m.medicineName.toLowerCase().includes(q) ||
      m.pharmacyName.toLowerCase().includes(q)
    );
  });

  constructor(private fb: FormBuilder, private stock: StockService) {
    this.form = this.fb.nonNullable.group({
      medicineName: ['', [Validators.required, Validators.minLength(2)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
    });
    this.load();
  }

  load() {
    this.stock.getAll().subscribe(list => this.items.set(list));
  }

  edit(row: AdminStockRow) {
    this.editingId.set(row.id);
    this.form.patchValue({
      medicineName: row.medicineName,
      price: row.price,
      quantity: row.quantity,
    });
  }

  save() {
    const id = this.editingId();
    if (id === null || this.form.invalid) return;

    this.stock.update(id, this.form.getRawValue()).subscribe(() => {
      this.cancel();
      this.load();
    });
  }

  cancel() {
    this.editingId.set(null);
    this.form.reset({ medicineName: '', price: 0, quantity: 0 });
  }

  remove(id: number) {
    if (confirm('Admin action: Remove this medicine listing from the platform?')) {
      this.stock.remove(id).subscribe(() => this.load());
    }
  }
}
