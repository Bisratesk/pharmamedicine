import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ActivityLog } from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityService { 
  private logs: ActivityLog[] = [];
  private nextId = 1;//

  log(message: string) {
    this.logs.unshift({  // unshift adds the new log to the beginning of the array
      id: this.nextId++,// increment the id for the next log
      message,
      timestamp: new Date().toISOString(),//
    });
  }

  getAll(): Observable<ActivityLog[]> { 
    return of([...this.logs]).pipe(delay(300));
  }
}