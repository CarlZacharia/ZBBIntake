import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralsharedComponent } from './referralshared.component';

describe('ReferralsharedComponent', () => {
  let component: ReferralsharedComponent;
  let fixture: ComponentFixture<ReferralsharedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferralsharedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferralsharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

