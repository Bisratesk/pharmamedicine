import { Component , signal , computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { StockService } from '../../../core/services/stock';
import { SearchResult } from '../../../core/models/search.model';
import { PrescriptionService } from '../../../core/services/prescription';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-search-page',
  styleUrl: './search-page.css',
  templateUrl: './search-page.html',
})
export class SearchPage {
  term = new FormControl('', { nonNullable: true });
results = signal<SearchResult[]>([]);
searched = signal(false);
loading = signal(false);
maxPrice = signal<number | null>(null);
minPrice = signal<number | null>(null);
sortBy = signal<'none' | 'priceAsc' | 'priceDesc'>('none');
previewUrl = signal<string | null>(null);
detected = signal<string[]>([]);
uploading = signal(false);

onFileChosen(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file.');
    return;
  }

  this.previewUrl.set(URL.createObjectURL(file));
  this.detected.set([]);
  this.uploading.set(true);

  this.prescription.upload(file).subscribe(names => {
    this.detected.set(names);
    this.uploading.set(false);
  });
}

searchFor(name: string) {
  this.term.setValue(name);
  this.search();
}
filtered = computed(() => {
  let list = this.results();

  const max = this.maxPrice();
  if (max !== null) {
    list = list.filter(r => r.price <= max);
  }
  const min = this.minPrice();
if (min !== null) {
  list = list.filter(r => r.price >= min);
}


  const sort = this.sortBy();
  if (sort === 'priceAsc') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'priceDesc') list = [...list].sort((a, b) => b.price - a.price);

  return list;
});

setMaxPrice(value: string) {
  this.maxPrice.set(value === '' ? null : Number(value));
}
setMinPrice(value: string) {
  this.minPrice.set(value === '' ? null : Number(value));
}
setSort(value: string) {
  this.sortBy.set(value as 'none' | 'priceAsc' | 'priceDesc');
}

constructor(private stock: StockService, private prescription: PrescriptionService) {}

search() {
  if (!this.term.value.trim()) return;

  this.loading.set(true);
  this.stock.search(this.term.value).subscribe(list => {
    this.results.set(list);
    this.searched.set(true);
    this.loading.set(false);
  });
}
}
