import { Component,signal , OnDestroy,computed} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivityService } from '../../../core/services/activity';
import { ActivityLog as ActivityEntry } from '../../../core/models/activity.model';

@Component({
  imports: [DatePipe],
  selector: 'app-activity-log',
  styleUrl: './activity-log.css',
  templateUrl: './activity-log.html',
})
export class ActivityLog implements OnDestroy {
entries = signal<ActivityEntry[]>([]);
open = signal(false);
seen = signal(0);
unread = computed(() => Math.max(0, this.entries().length - this.seen()));
private timer = setInterval(() => this.load(), 3000);

toggle() {
  this.open.update(v => !v);
  if (this.open()) this.load();
}

ngOnDestroy() {
  clearInterval(this.timer);
}

constructor(private activity: ActivityService) {
  this.load();
}


load() {
  this.activity.getAll().subscribe(list => {
    this.entries.set(list);
    if (this.open()) this.seen.set(list.length);
  });
}
}

