import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicaidComponent } from './medicaid.component';

describe('MedicaidComponent', () => {
  let component: MedicaidComponent;
  let fixture: ComponentFixture<MedicaidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicaidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicaidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

