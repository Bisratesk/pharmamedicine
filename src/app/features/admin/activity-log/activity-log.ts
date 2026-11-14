import { Component, signal, OnDestroy, computed } from '@angular/core';
import { ActivityService } from '../../../core/services/activity';
import { ActivityLog as ActivityEntry } from '../../../core/models/activity.model';

@Component({
  selector: 'app-activity-log',
  styleUrl: './activity-log.css',
  templateUrl: './activity-log.html',
})
export class ActivityLog implements OnDestroy {
  entries = signal<ActivityEntry[]>([]);
  unread = computed(() => this.entries().length);
  private timer = setInterval(() => this.load(), 3000);

  constructor(private activity: ActivityService) {
    this.load();
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  load() {
    this.activity.getAll().subscribe(list => {
      this.entries.set(list);
    });
  }
}

