import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestLaptop } from './test-laptop';

describe('TestLaptop', () => {
  let component: TestLaptop;
  let fixture: ComponentFixture<TestLaptop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestLaptop],
    }).compileComponents();

    fixture = TestBed.createComponent(TestLaptop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
