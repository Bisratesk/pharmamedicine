import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivityMonitor } from './activity-monitor';

describe('ActivityMonitor', () => {
  let component: ActivityMonitor;
  let fixture: ComponentFixture<ActivityMonitor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityMonitor],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityMonitor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
