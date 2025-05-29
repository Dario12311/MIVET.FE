import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicoveterinarioComponent } from './medicoveterinario.component';

describe('MedicoveterinarioComponent', () => {
  let component: MedicoveterinarioComponent;
  let fixture: ComponentFixture<MedicoveterinarioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MedicoveterinarioComponent]
    });
    fixture = TestBed.createComponent(MedicoveterinarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
