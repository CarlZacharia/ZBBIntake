import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planning2Component } from './planning2.component';

describe('Planning2Component', () => {
  let component: Planning2Component;
  let fixture: ComponentFixture<Planning2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planning2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planning2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
