import { Component,signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivityService } from '../../../core/services/activity';
import { ActivityLog as ActivityEntry } from '../../../core/models/activity.model';

@Component({
  imports: [DatePipe],
  selector: 'app-activity-log',
  styleUrl: './activity-log.css',
  templateUrl: './activity-log.html',
})
export class ActivityLog {
entries = signal<ActivityEntry[]>([]);

constructor(private activity: ActivityService) {
  this.load();
}

load() {
  this.activity.getAll().subscribe(list => this.entries.set(list));
}
}