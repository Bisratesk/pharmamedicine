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
locating = signal(false);
locationSet = signal(false);
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
  
  if (this.form.invalid || !this.locationSet()) return;

  this.saving.set(true);//starts the saving spinner and disables the submit button.
  this.error.set('');//clears any previous error message.

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
  });}
  useMyLocation() {
  if (!navigator.geolocation) {
    this.error.set('Your browser does not support location.');
    return;
  }

  this.locating.set(true);
  this.error.set('');

  navigator.geolocation.getCurrentPosition(
    pos => {
      this.form.patchValue({
        latitude: Number(pos.coords.latitude.toFixed(6)),
        longitude: Number(pos.coords.longitude.toFixed(6)),
      });//the browser fills the two hidden form fields with the user's current latitude and longitude, rounded to 6 decimal places.
      this.locationSet.set(true);//marks the location as captured.
      this.locating.set(false);//stops the locating spinner.
    },
    () => {
      this.error.set('Could not get your location. Please allow location access.');
      this.locating.set(false);
    } //: it asks the browser for the position, fills the two hidden form fields, and marks the location as captured.
  );
}

}

