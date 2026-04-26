import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Laptops } from './laptops';

describe('Laptops', () => {
  let component: Laptops;
  let fixture: ComponentFixture<Laptops>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Laptops],
    }).compileComponents();

    fixture = TestBed.createComponent(Laptops);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
