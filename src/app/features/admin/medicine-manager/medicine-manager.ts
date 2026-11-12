import { Component,signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockService } from '../../../core/services/stock';
import { AdminStockRow } from '../../../core/models/stock.model';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-medicine-manager',
  styleUrl: './medicine-manager.css',
  templateUrl: './medicine-manager.html',
})
export class MedicineManager {
items = signal<AdminStockRow[]>([]);
editingId = signal<number | null>(null);
form;

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
  this.form.reset();
}

remove(id: number) {
  this.stock.remove(id).subscribe(() => this.load());
}}