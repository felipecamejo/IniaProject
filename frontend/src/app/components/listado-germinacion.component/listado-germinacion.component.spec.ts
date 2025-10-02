import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoGerminacionComponent } from './listado-germinacion.component';

describe('ListadoGerminacionComponent', () => {
  let component: ListadoGerminacionComponent;
  let fixture: ComponentFixture<ListadoGerminacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoGerminacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoGerminacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
