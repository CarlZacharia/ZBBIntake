import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainintakeComponent } from './mainintake.component';

describe('MainintakeComponent', () => {
  let component: MainintakeComponent;
  let fixture: ComponentFixture<MainintakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainintakeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainintakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
