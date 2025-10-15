import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicaidintakeComponent } from './medicaidintake.component';

describe('MedicaidintakeComponent', () => {
  let component: MedicaidintakeComponent;
  let fixture: ComponentFixture<MedicaidintakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicaidintakeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicaidintakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
