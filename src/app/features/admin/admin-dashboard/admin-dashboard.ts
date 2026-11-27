import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PharmacyService } from '../../../core/services/pharmacy';
import { Pharmacy, PharmacyStatus } from '../../../core/models/pharmacy.model';
import { MedicineManager } from '../medicine-manager/medicine-manager';
import { ActivityLog } from '../activity-log/activity-log';

@Component({
  selector: 'app-admin-dashboard',
  imports: [MedicineManager, ActivityLog, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  pharmacies = signal<Pharmacy[]>([]);
  filters = ['All', 'Pending', 'Approved', 'Rejected'] as const;
  filter = signal<'All' | PharmacyStatus>('All');
  query = signal('');
  loading = signal(true);

  totalCount = computed(() => this.pharmacies().length);
  pendingCount = computed(() => this.pharmacies().filter(p => p.status === 'Pending').length);
  approvedCount = computed(() => this.pharmacies().filter(p => p.status === 'Approved').length);
  rejectedCount = computed(() => this.pharmacies().filter(p => p.status === 'Rejected').length);

  shown = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.pharmacies().filter(p =>
      (this.filter() === 'All' || p.status === this.filter()) &&
      (!q ||
        p.name.toLowerCase().includes(q) ||
        p.licenseNumber.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.phone.includes(q))
    );
  });

  constructor(private pharmacyService: PharmacyService) {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.pharmacyService.getAll().subscribe(list => {
      this.pharmacies.set(list);
      this.loading.set(false);
    });
  }

  getFilterCount(f: 'All' | PharmacyStatus): number {
    if (f === 'All') return this.totalCount();
    if (f === 'Pending') return this.pendingCount();
    if (f === 'Approved') return this.approvedCount();
    return this.rejectedCount();
  }

  decide(id: number, status: PharmacyStatus) {
    this.pharmacyService.setStatus(id, status).subscribe(() => this.load());
  }
}
