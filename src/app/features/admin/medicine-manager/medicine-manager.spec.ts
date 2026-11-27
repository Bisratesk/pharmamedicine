import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicineManager } from './medicine-manager';

describe('MedicineManager', () => {
  let component: MedicineManager;
  let fixture: ComponentFixture<MedicineManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineManager],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
