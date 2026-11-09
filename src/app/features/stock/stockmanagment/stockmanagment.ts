import { Component, OnInit, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockService } from '../../../core/services/stock';
import { StockItem } from '../../../core/models/stock.model';

@Component({
  imports: [ReactiveFormsModule,],
  selector: 'app-stockmanagment',
  styleUrl: './stockmanagment.css',
  templateUrl: './stockmanagment.html',
})
export class StockManager implements OnInit {
  pharmacyId = input.required<number>();
  items = signal<StockItem[]>([]);
  editingId = signal<number | null>(null);
  saving = signal(false);
  form;

  constructor(private fb: FormBuilder, private stock: StockService) {
    this.form = this.fb.nonNullable.group({
      medicineName: ['', [Validators.required, Validators.minLength(2)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.stock.getByPharmacy(this.pharmacyId()).subscribe(list => this.items.set(list));
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);

    const id = this.editingId();
    const req = this.form.getRawValue();
    const call = id === null
      ? this.stock.add(this.pharmacyId(), req)
      : this.stock.update(id, req);

    call.subscribe({
  next: () => {
    this.saving.set(false);
    this.cancel();
    this.load();
  },
  error: () => this.saving.set(false),
});
  }

  edit(item: StockItem) {
    this.editingId.set(item.id);
    this.form.patchValue({
      medicineName: item.medicineName,
      price: item.price,
      quantity: item.quantity,
    });
  }

  cancel() {
    this.editingId.set(null);
    this.form.reset();
  }

  remove(id: number) {
    this.stock.remove(id).subscribe(() => this.load());
  }
}