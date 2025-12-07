import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstateplanComponent } from './estateplan.component';

describe('EstateplanComponent', () => {
  let component: EstateplanComponent;
  let fixture: ComponentFixture<EstateplanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstateplanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstateplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
