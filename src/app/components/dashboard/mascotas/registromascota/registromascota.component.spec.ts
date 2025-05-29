import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistromascotaComponent } from './registromascota.component';

describe('RegistromascotaComponent', () => {
  let component: RegistromascotaComponent;
  let fixture: ComponentFixture<RegistromascotaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistromascotaComponent]
    });
    fixture = TestBed.createComponent(RegistromascotaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
