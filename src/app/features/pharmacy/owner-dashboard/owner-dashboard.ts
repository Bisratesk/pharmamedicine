import { Component,signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pharmacy } from '../../../core/models/pharmacy.model';
import { PharmacyService } from '../../../core/services/pharmacy';
import { StockManager } from '../../stock/stockmanagment/stockmanagment';

@Component({
  imports: [ReactiveFormsModule,StockManager],
  selector: 'app-owner-dashboard',
  styleUrl: './owner-dashboard.css',
  templateUrl: './owner-dashboard.html',
})
export class OwnerDashboard {pharmacy = signal<Pharmacy | null>(null);
loadingPharmacy = signal(true);
saving = signal(false);
error = signal('');
form;

constructor(private fb: FormBuilder, private pharmacyService: PharmacyService) {
  this.form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    address: ['', Validators.required],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    licenseNumber: ['', Validators.required],
    openingTime: ['08:00', Validators.required],
    closingTime: ['20:00', Validators.required],
    longitude: [0, [Validators.required, Validators.min(-180), Validators.max(180)]],
    latitude: [0, [Validators.required, Validators.min(-90), Validators.max(90)]],
   
  });

  this.pharmacyService.getMine().subscribe(p => {
    this.pharmacy.set(p);
    this.loadingPharmacy.set(false);
  });
}

submit() {
  if (this.form.invalid) return;

  this.saving.set(true);
  this.error.set('');

  const payload = this.form.getRawValue();

  this.pharmacyService.register({
    ...payload,
    
  }).subscribe({
    next: p => {
      this.pharmacy.set(p);
      this.saving.set(false);
    },
    error: err => {
      this.saving.set(false);
      this.error.set(err.message);
    },
  });
}

}