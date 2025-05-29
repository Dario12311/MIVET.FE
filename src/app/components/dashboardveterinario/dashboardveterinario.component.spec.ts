import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardveterinarioComponent } from './dashboardveterinario.component';

describe('DashboardveterinarioComponent', () => {
  let component: DashboardveterinarioComponent;
  let fixture: ComponentFixture<DashboardveterinarioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardveterinarioComponent]
    });
    fixture = TestBed.createComponent(DashboardveterinarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
