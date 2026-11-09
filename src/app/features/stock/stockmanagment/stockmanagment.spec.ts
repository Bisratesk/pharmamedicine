import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Stockmanagment } from './stockmanagment';

describe('Stockmanagment', () => {
  let component: Stockmanagment;
  let fixture: ComponentFixture<Stockmanagment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stockmanagment],
    }).compileComponents();

    fixture = TestBed.createComponent(Stockmanagment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
