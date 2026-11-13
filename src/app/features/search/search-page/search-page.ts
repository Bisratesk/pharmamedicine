import { Component, signal, computed, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { StockService } from '../../../core/services/stock';
import { SearchResult } from '../../../core/models/search.model';
import { PrescriptionService } from '../../../core/services/prescription';

@Component({
  selector: 'app-search-page',
  imports: [ReactiveFormsModule],
  styleUrl: './search-page.css',
  templateUrl: './search-page.html',
})
export class SearchPage implements OnDestroy {
  term = new FormControl('', { nonNullable: true });
  results = signal<SearchResult[]>([]);
  searched = signal(false);
  loading = signal(false);
  maxPrice = signal<number | null>(null);
  sortBy = signal<'none' | 'priceAsc' | 'priceDesc' | 'nearest'>('none');
  previewUrl = signal<string | null>(null);
  detected = signal<string[]>([]);
  uploading = signal(false);

  // distance
  userLocation = signal<{ lat: number; lng: number } | null>(null);
  locating = signal(false);
  locationError = signal('');
  maxDistance = signal<number | null>(null);

  popularMedicines = ['Paracetamol', 'Amoxicillin', 'Ibuprofen', 'Ciprofloxacin', 'Omeprazole', 'Cetirizine'];

  filtered = computed(() => {
    const loc = this.userLocation();

    let list = this.results().map(r => ({
      ...r,
      distanceKm: loc ? this.distanceKm(loc.lat, loc.lng, r.latitude, r.longitude) : null,
    }));

    const max = this.maxPrice();
    if (max !== null) {
      list = list.filter(r => r.price <= max);
    }

    const maxDist = this.maxDistance();
    if (maxDist !== null && loc) {
      list = list.filter(r => r.distanceKm !== null && r.distanceKm <= maxDist);
    }

    const sort = this.sortBy();
    if (sort === 'priceAsc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'priceDesc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'nearest' && loc) list = [...list].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

    return list;
  });

  constructor(private stock: StockService, private prescription: PrescriptionService) {}

  onFileChosen(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (PNG, JPG, JPEG).');
      return;
    }

    // Clean up previous blob
    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
    }

    this.previewUrl.set(URL.createObjectURL(file));
    this.detected.set([]);
    this.uploading.set(true);

    this.prescription.upload(file).subscribe({
      next: names => {
        this.detected.set(names);
        this.uploading.set(false);
      },
      error: () => {
        this.uploading.set(false);
      }
    });
  }

  clearPrescription() {
    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
      this.previewUrl.set(null);
    }
    this.detected.set([]);
  }

  searchFor(name: string) {
    this.term.setValue(name);
    this.search();
  }

  search() {
    const query = this.term.value.trim();
    if (!query) return;

    this.loading.set(true);
    this.stock.search(query).subscribe({
      next: list => {
        this.results.set(list);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  setMaxPrice(value: string) {
    this.maxPrice.set(value === '' ? null : Number(value));
  }

  setSort(value: string) {
    this.sortBy.set(value as 'none' | 'priceAsc' | 'priceDesc' | 'nearest');
  }

  useMyLocation() {
    if (!navigator.geolocation) {
      this.locationError.set('Your browser does not support geolocation.');
      return;
    }

    this.locating.set(true);
    this.locationError.set('');

    navigator.geolocation.getCurrentPosition(
      pos => {
        this.userLocation.set({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        this.locating.set(false);
      },
      () => {
        this.locationError.set('Could not get your location. Please check browser permissions.');
        this.locating.set(false);
      }
    );
  }

  setMaxDistance(value: string) {
    this.maxDistance.set(value === '' ? null : Number(value));
  }

  getDirectionsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  ngOnDestroy() {
    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
    }
  }
}
