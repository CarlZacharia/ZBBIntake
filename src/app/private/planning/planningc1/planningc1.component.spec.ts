import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planningc1Component } from './planningc1.component';

describe('Planningc1Component', () => {
  let component: Planningc1Component;
  let fixture: ComponentFixture<Planningc1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planningc1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planningc1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
