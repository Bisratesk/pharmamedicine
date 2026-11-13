import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ActivityLog } from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityService { 
  private logs: ActivityLog[] = [
    {
      id: 1,
      message: 'System audit logging initialized',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 2,
      message: 'Admin catalog initialized with default medicines',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
  private nextId = 3;

  log(message: string) {
    this.logs.unshift({  // unshift adds the new log to the beginning of the array
      id: this.nextId++,// increment the id for the next log
      message,
      timestamp: new Date().toISOString(),//
    });
  }

  getAll(): Observable<ActivityLog[]> { 
    return of([...this.logs]).pipe(delay(200));
  }
}