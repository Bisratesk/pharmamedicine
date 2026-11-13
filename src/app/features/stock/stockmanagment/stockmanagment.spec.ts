import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockManager } from './stockmanagment';

describe('StockManager', () => {
  let component: StockManager;
  let fixture: ComponentFixture<StockManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockManager],
    }).compileComponents();

    fixture = TestBed.createComponent(StockManager);
    fixture.componentRef.setInput('pharmacyId', 1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
