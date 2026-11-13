import { Component, computed, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivityService } from '../../../core/services/activity';
import { ActivityLog } from '../../../core/models/activity.model';

@Component({
  selector: 'app-activity-monitor',
  imports: [RouterLink, DatePipe],
  styleUrl: './activity-monitor.css',
  templateUrl: './activity-monitor.html',
})
export class ActivityMonitor implements OnInit {
  activities = signal<ActivityLog[]>([]);
  loading = signal(true);
  searchQuery = signal('');

  filteredActivities = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.activities();
    return this.activities().filter(a =>
      a.message.toLowerCase().includes(q)
    );
  });

  constructor(private activityService: ActivityService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.activityService.getAll().subscribe(list => {
      this.activities.set(list);
      this.loading.set(false);
    });
  }

  getBadgeClass(message: string): string {
    const text = message.toLowerCase();
    if (text.includes('added') || text.includes('registered')) return 'badge-add';
    if (text.includes('approved')) return 'badge-success';
    if (text.includes('rejected') || text.includes('removed')) return 'badge-danger';
    if (text.includes('updated')) return 'badge-info';
    return 'badge-neutral';
  }

  getBadgeLabel(message: string): string {
    const text = message.toLowerCase();
    if (text.includes('registered')) return 'REGISTRATION';
    if (text.includes('approved')) return 'APPROVED';
    if (text.includes('rejected')) return 'REJECTED';
    if (text.includes('added')) return 'ADDED';
    if (text.includes('removed')) return 'REMOVED';
    if (text.includes('updated')) return 'UPDATED';
    return 'SYSTEM';
  }
}
