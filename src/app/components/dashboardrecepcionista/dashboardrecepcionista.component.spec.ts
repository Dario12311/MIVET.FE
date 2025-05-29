import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardrecepcionistaComponent } from './dashboardrecepcionista.component';

describe('DashboardrecepcionistaComponent', () => {
  let component: DashboardrecepcionistaComponent;
  let fixture: ComponentFixture<DashboardrecepcionistaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardrecepcionistaComponent]
    });
    fixture = TestBed.createComponent(DashboardrecepcionistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
