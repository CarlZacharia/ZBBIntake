import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Plannings1Component } from './plannings1.component';

describe('Plannings1Component', () => {
  let component: Plannings1Component;
  let fixture: ComponentFixture<Plannings1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plannings1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Plannings1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
