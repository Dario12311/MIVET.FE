import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuncionalidadesComponent } from './funcionalidades.component';

describe('FuncionalidadesComponent', () => {
  let component: FuncionalidadesComponent;
  let fixture: ComponentFixture<FuncionalidadesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FuncionalidadesComponent]
    });
    fixture = TestBed.createComponent(FuncionalidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
