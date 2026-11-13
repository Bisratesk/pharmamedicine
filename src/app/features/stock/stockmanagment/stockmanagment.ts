import { Component, OnInit, input, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { StockService } from '../../../core/services/stock';
import { StockItem } from '../../../core/models/stock.model';

@Component({
  selector: 'app-stockmanagment',
  imports: [ReactiveFormsModule, DecimalPipe],
  styleUrl: './stockmanagment.css',
  templateUrl: './stockmanagment.html',
})
export class StockManager implements OnInit {
  pharmacyId = input.required<number>();
  items = signal<StockItem[]>([]);
  editingId = signal<number | null>(null);
  saving = signal(false);
  searchQuery = signal('');
  form;

  filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.items();
    return this.items().filter(i =>
      i.medicineName.toLowerCase().includes(q)
    );
  });

  totalItems = computed(() => this.items().length);
  totalUnits = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  lowStockCount = computed(() => this.items().filter(i => i.quantity < 10).length);

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
    // Scroll form into view
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  cancel() {
    this.editingId.set(null);
    this.form.reset({ medicineName: '', price: 0, quantity: 0 });
  }

  remove(id: number) {
    if (confirm('Are you sure you want to remove this medicine from inventory?')) {
      this.stock.remove(id).subscribe(() => this.load());
    }
  }
}
