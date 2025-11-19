import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntakehubComponent } from './intakehub.component';

describe('IntakehubComponent', () => {
  let component: IntakehubComponent;
  let fixture: ComponentFixture<IntakehubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntakehubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntakehubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
