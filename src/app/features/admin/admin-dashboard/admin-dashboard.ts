import { Component, signal } from '@angular/core';
import { PharmacyService } from '../../../core/services/pharmacy';
import { Pharmacy, PharmacyStatus } from '../../../core/models/pharmacy.model';
import { MedicineManager } from '../medicine-manager/medicine-manager';
import { ActivityLog } from '../activity-log/activity-log';

@Component({
  selector: 'app-admin-dashboard',
  imports: [MedicineManager,ActivityLog],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  pending = signal<Pharmacy[]>([]);
  loading = signal(true);

  constructor(private pharmacyService: PharmacyService) {
    this.load();
  }

  load() {
    this.pharmacyService.getPending().subscribe(list => {
      this.pending.set(list);
      this.loading.set(false);
    });
  }

  decide(id: number, status: PharmacyStatus) {
    this.pharmacyService.setStatus(id, status).subscribe(() => this.load());
  }
}
