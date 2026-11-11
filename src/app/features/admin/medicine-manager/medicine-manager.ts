import { Component,signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicineService } from '../../../core/services/medicine';
import { Medicine } from '../../../core/models/medicine.model';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-medicine-manager',
  styleUrl: './medicine-manager.css',
  templateUrl: './medicine-manager.html',
})
export class MedicineManager {
  medicines = signal<Medicine[]>([]);
  editingId = signal<number | null>(null);
form;

constructor(private fb: FormBuilder, private service: MedicineService) {
  this.form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: ['', Validators.required],
  });
  this.load();
}

load() {
  this.service.getAll().subscribe(list => this.medicines.set(list));
}

submit() {
  if (this.form.invalid) return;

  const id = this.editingId();
  const req = this.form.getRawValue();
  const call = id === null ? this.service.add(req) : this.service.update(id, req);

  call.subscribe(() => {
    this.form.reset();
    this.editingId.set(null);
    this.load();
  });
}
edit(m: Medicine) {
  this.editingId.set(m.id);
  this.form.patchValue({ name: m.name, category: m.category });
}

cancel() {
  this.editingId.set(null);
  this.form.reset();
}

remove(id: number) {
  this.service.remove(id).subscribe(() => this.load());
}
}
